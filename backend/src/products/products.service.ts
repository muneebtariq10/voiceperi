import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product';
import { OpenCartProductAdapter } from '../integrations/adapters';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  private productsCache: any[] = [];

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productAdapter: OpenCartProductAdapter,
  ) {}

  onModuleInit() {
    this.initializeProducts().catch((err) =>
      this.logger.error('Background product initialization failed', err),
    );
  }

  private async initializeProducts() {
    try {
      // Step 1: Load existing DB products into memory immediately for instant voice agent responses
      const dbProducts = await this.productRepository.find();
      if (dbProducts.length > 0) {
        this.productsCache = dbProducts;
        this.logger.log(
          `⚡ Loaded ${dbProducts.length} existing products from database into fast memory cache.`,
        );
      }

      // Step 2: Fetch fresh product catalog via the Integration Layer adapter
      const liveProducts = await this.productAdapter.fetchAllProducts();
      if (liveProducts && liveProducts.length > 0) {
        this.productsCache = liveProducts;
        this.logger.log(
          `🚀 Updated fast memory cache with ${liveProducts.length} live products from PrintEZ API!`,
        );
        await this.syncProductsToDatabase();
      }
    } catch (error) {
      this.logger.error('Failed to initialize products catalog', error?.stack);
    }
  }



  private async syncProductsToDatabase() {
    if (this.productsCache.length === 0) return;
    try {
      const allExisting = await this.productRepository.find({
        select: ['productId'],
      });
      const existingIds = new Set(allExisting.map((p) => p.productId));

      const newProducts: Product[] = [];
      for (const record of this.productsCache) {
        if (!existingIds.has(record.productId) && record.productId) {
          existingIds.add(record.productId); // Prevent duplicates within the API response
          const product = this.productRepository.create({
            productId: record.productId,
            name: record.name,
            description: record.description || '',
            price: String(record.price ?? ''),
            sku: record.sku || record.productId,
            category: record.category || '',
            url: record.url || '',
            priceFrom: Boolean(record.priceFrom),
            minimumQuantity: record.minimumQuantity || 1,
            descriptionTruncated: Boolean(record.descriptionTruncated),
          });
          newProducts.push(product);
        }
      }

      if (newProducts.length > 0) {
        // Save in chunks of 500 for maximum performance
        for (let i = 0; i < newProducts.length; i += 500) {
          const batch = newProducts.slice(i, i + 500);
          await this.productRepository.save(batch);
        }
        this.logger.log(
          `Synced ${newProducts.length} brand new products into database.`,
        );
      }
    } catch (error) {
      this.logger.error('Failed syncing products to DB', error?.stack);
    }
  }

  async lookupProduct(query: string) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return {
        success: false,
        message:
          'Please provide a product name, category, or item number to search.',
      };
    }

    try {
      // Ensure we have catalog items loaded
      let catalog = this.productsCache;
      if (!catalog || catalog.length === 0) {
        catalog = await this.productRepository.find();
      }

      // Clean conversational noise and normalize terms
      let cleanQuery = query
        .replace(/cheques?/gi, 'check')
        .replace(/item\s*number/gi, '')
        .replace(/model\s*number/gi, '')
        .replace(/part\s*number/gi, '')
        .replace(/how\s*much\s*(is|for)?/gi, '')
        .replace(/what\s*is\s*the\s*price\s*of/gi, '')
        .replace(/do\s*you\s*(have|sell|carry)/gi, '')
        .replace(/tell\s*me\s*about/gi, '')
        .replace(/info\s*(about|regarding)?/gi, '')
        .trim();

      if (!cleanQuery) cleanQuery = query.trim();

      const queryLower = cleanQuery.toLowerCase();
      const tokens = queryLower
        .split(/\s+/)
        .map((t) => t.replace(/[^a-z0-9]/gi, ''))
        .filter(
          (t) =>
            t.length >= 2 &&
            !['the', 'and', 'for', 'with', 'about'].includes(t),
        );

      const scoredProducts = catalog
        .map((p) => {
          let score = 0;
          const name = (p.name || '').toLowerCase();
          const id = (p.productId || '').toLowerCase();
          const sku = (p.sku || '').toLowerCase();
          const category = (p.category || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();

          // Exact or substring match on entire clean query
          if (id === queryLower || sku === queryLower || name === queryLower) {
            score += 100;
          } else if (
            id.includes(queryLower) ||
            sku.includes(queryLower) ||
            name.includes(queryLower) ||
            category.includes(queryLower)
          ) {
            score += 50;
          }

          // Individual token relevancy
          for (const token of tokens) {
            if (id === token || sku === token) score += 40;
            else if (id.includes(token) || sku.includes(token)) score += 25;
            else if (
              token.length >= 3 &&
              (id.startsWith(token.slice(0, 3)) ||
                sku.startsWith(token.slice(0, 3)))
            ) {
              score += 15; // Handle speech-to-text SKU typos like "919g" for "9191g"
            }

            if (name.includes(token)) score += 15;
            if (category.includes(token)) score += 10;
            if (desc.includes(token)) score += 5;
          }

          return { product: p, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

      const topResults = scoredProducts.slice(0, 3).map((item) => {
        const p = item.product;
        const rawPrice = parseFloat(p.price) || 0;
        const isPriceFrom = Boolean(p.priceFrom);
        let displayPrice: string;

        if (rawPrice <= 0) {
          displayPrice =
            'Pricing varies based on your selections (quantity, size, customization). Visit the product page or ask me for the link.';
        } else if (isPriceFrom) {
          displayPrice = `Starting from $${rawPrice.toFixed(2)}`;
        } else {
          displayPrice = `$${rawPrice.toFixed(2)}`;
        }

        let cleanDesc = p.description || '';
        if (cleanDesc.length > 350) {
          cleanDesc = cleanDesc.substring(0, 350) + '...';
        }

        return {
          name: p.name,
          price: displayPrice,
          category: p.category,
          productId: p.productId,
          sku: p.sku || p.productId,
          description: cleanDesc,
          url: p.url || '',
          minimumQuantity: p.minimumQuantity || 1,
          note: p.descriptionTruncated
            ? 'Full product details including available options, colors, and sizes can be found on the product page.'
            : '',
        };
      });

      if (topResults.length === 0) {
        return {
          success: true,
          message: `While we couldn't find an exact match for "${query}" in our instant lookup, PrintEZ carries a complete catalog of over 4,200 commercial printing items including QuickBooks Computer Checks, Manual Checks, Custom Carbonless Forms, Deposit Slips, Invoice Books, and Envelopes. Standard checks start at $28.99 with free logo imprint and bank encoding. Would you like me to help you search with different keywords?`,
          products: [],
        };
      }

      return {
        success: true,
        message: `Found ${topResults.length} matching product(s) in the PrintEZ catalog for "${query}". Each result includes a direct product page link where the customer can see all available options, colors, and sizes.`,
        products: topResults,
      };
    } catch (error) {
      this.logger.error(`Error looking up product: ${query}`, error?.stack);
      return {
        success: false,
        message: 'An error occurred while searching for products.',
      };
    }
  }
}
