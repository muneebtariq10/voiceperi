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

      // Convert spoken numbers to digits and clean conversational noise
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
        .replace(/\bzero\b/gi, '0')
        .replace(/\bone\b/gi, '1')
        .replace(/\btwo\b/gi, '2')
        .replace(/\bthree\b/gi, '3')
        .replace(/\bfour\b/gi, '4')
        .replace(/\bfive\b/gi, '5')
        .replace(/\bsix\b/gi, '6')
        .replace(/\bseven\b/gi, '7')
        .replace(/\beight\b/gi, '8')
        .replace(/\bnine\b/gi, '9')
        .trim();

      if (!cleanQuery) cleanQuery = query.trim();

      const queryLower = cleanQuery.toLowerCase();
      
      const stopWords = new Set([
        'the', 'and', 'for', 'with', 'about', 'details', 'available', 'options', 'option',
        'item', 'number', 'model', 'sku', 'check', 'checks', 'from', 'please', 'want',
        'looking', 'show', 'tell', 'need', 'product', 'products', 'price', 'pricing', 'cost',
        'costs', 'of', 'on', 'my', 'your', 'is', 'are', 'what', 'can', 'you', 'give', 'me',
        'have', 'do', 'sell', 'carry', 'info', 'regarding', 'at', 'in', 'would', 'like', 'to', 'know'
      ]);

      // Step 1: Filter out stop words to isolate critical keywords and potential SKUs
      const rawWords = queryLower.split(/\s+/).map(t => t.replace(/[^a-z0-9]/gi, '')).filter(t => t.length > 0);
      const meaningfulWords = rawWords.filter(t => !stopWords.has(t));

      // Step 2: Collapse separated single characters (e.g. ['d', 'l', 'd', '1', '0', '3'] -> 'dld103')
      let collapsedCode = meaningfulWords.join('').replace(/dld103/g, 'dlt103').replace(/dld/g, 'dlt');

      const tokens: string[] = [];
      for (const w of meaningfulWords) {
        if (w.length >= 2) tokens.push(w);
      }
      if (collapsedCode.length >= 4) {
        tokens.push(collapsedCode);
      }

      // Check if the query clearly targets an alphanumeric SKU/model code (e.g. DLT103, TP0069)
      const targetSku = tokens.find(t => t.length >= 4 && (/\d/.test(t) || t === 'dlt103'));

      const scoredProducts = catalog
        .map((p) => {
          let score = 0;
          const name = (p.name || '').toLowerCase();
          const id = (p.productId || '').toLowerCase();
          const sku = (p.sku || '').toLowerCase();
          const category = (p.category || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();

          const allIdentifiers = `${id} ${sku} ${name}`.split(/\s+/).map(w => w.replace(/[^a-z0-9]/gi, '')).filter(Boolean);

          let isExactSku = false;

          // Check against all tokens of product identifiers
          if (targetSku) {
            for (const ident of allIdentifiers) {
              if (ident === targetSku || (ident.length >= 4 && this.getEditDistance(ident, targetSku) <= 1)) {
                isExactSku = true;
                score += 10000;
                break;
              }
            }
          }

          // General matching if not exclusively an exact SKU search
          for (const token of tokens) {
            if (id === token || sku === token) score += 40;
            else if (id.includes(token) || sku.includes(token)) score += 25;
            else if (token.length >= 3 && (id.startsWith(token.slice(0, 3)) || sku.startsWith(token.slice(0, 3)))) {
              score += 15;
            }
            if (name.includes(token)) score += 15;
            if (category.includes(token)) score += 10;
            if (!targetSku && desc.includes(token)) score += 5; // Do not use description scores if searching for a model number
          }

          return { product: p, score, isExactSku };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

      // EXACT SKU ISOLATION RULE:
      // If the caller inquired about a specific item number or model (exact SKU match), return ONLY that exact product!
      const exactMatches = scoredProducts.filter((i) => i.isExactSku || i.score >= 5000);
      const candidates = exactMatches.length > 0 ? exactMatches.slice(0, 1) : scoredProducts.slice(0, 3);

      const topResults = await Promise.all(
        candidates.map(async (item) => {
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

          const tieredPricingOptions = await this.fetchProductOptionPricing(p.productId);
          // const applicablePromo = this.resolveApplicablePromo(p.category || '', p.name || '');

          return {
            name: p.name,
            price: displayPrice,
            category: p.category,
            productId: p.productId,
            sku: p.sku || p.productId,
            description: cleanDesc,
            url: p.url || '',
            minimumQuantity: p.minimumQuantity || 1,
            tieredPricingOptions,
            // applicablePromo,
            note: p.descriptionTruncated
              ? 'Full product details including available options, colors, and sizes can be found on the product page.'
              : '',
          };
        }),
      );

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

  private async fetchProductOptionPricing(productId: string): Promise<string> {
    if (!productId) return 'Standard catalog pricing applies.';
    try {
      const res = await fetch(
        `https://www.printez.com/index.php?route=agentapi/product|get&product_id=${productId}`,
        {
          headers: {
            Authorization:
              'Bearer 5c4faefcfc742ee848f1aa2f385f237aec5e70c6fcd7d5b3c8e082e426c51b54',
          },
        },
      );
      if (!res.ok) return 'Standard catalog pricing applies.';
      const data: any = await res.json();
      if (!data?.product?.options || !Array.isArray(data.product.options)) {
        return 'Standard catalog pricing applies.';
      }
      const summaries: string[] = [];
      for (const opt of data.product.options) {
        if (Array.isArray(opt.values) && opt.values.length > 0) {
          const tiers = opt.values
            .slice(0, 6)
            .map((v: any) => `${v.name || v.quantity || ''} for $${Number(v.price || 0).toFixed(2)}`)
            .filter((s: string) => !s.startsWith(' for '))
            .join(', ');
          if (tiers) {
            summaries.push(`${opt.name}: [${tiers}]`);
          }
        }
      }
      return summaries.length > 0
        ? `Tiered Option Pricing: ${summaries.join(' | ')}`
        : 'Standard catalog pricing applies.';
    } catch (err) {
      this.logger.warn(`Failed fetching option pricing for product ${productId}: ${err?.message}`);
      return 'Standard catalog pricing applies.';
    }
  }

  /*
  private resolveApplicablePromo(category: string, name: string): string {
    const combined = `${category || ''} ${name || ''}`.toLowerCase();
    if (combined.includes('computer check') || combined.includes('check on top') || combined.includes('quickbooks check') || combined.includes('laser check')) {
      return '🔥 Best Deal: 10% Discount on Computer Checks! Use promo code HCC10 at checkout.';
    }
    if (combined.includes('business check') || combined.includes('manual check') || combined.includes('voucher check') || combined.includes('wallet check')) {
      return '🔥 Best Deal: 10% Discount on Business Checks! Use promo code HBC10 at checkout.';
    }
    if (combined.includes('form') || combined.includes('invoice') || combined.includes('receipt') || combined.includes('clinical') || combined.includes('history update')) {
      return '🔥 Best Deal: 10% Discount on Business Forms! Use promo code HBF10 at checkout.';
    }
    if (combined.includes('envelope') || combined.includes('mailer')) {
      return '🔥 Best Deal: 10% Discount on Envelopes! Use promo code HBE10 at checkout.';
    }
    if (combined.includes('banner') || combined.includes('sign')) {
      return '🔥 Best Deal: 10% Discount on Banners! Use promo code HBA10 at checkout.';
    }
    if (combined.includes('pen') || combined.includes('promotional') || combined.includes('gift') || combined.includes('stamp') || combined.includes('label')) {
      return '🔥 Best Deal: 5% Discount on Pens & Promotional Office Items! Use promo code HPEN10 at checkout.';
    }
    return 'Check printez.com for current seasonal promotions and volume free-shipping offers!';
  }
  */

  async resolveInternalProductId(
    productIdOrSku?: string,
    productName?: string,
  ): Promise<number | undefined> {
    if (productIdOrSku && /^\d{4,6}$/.test(String(productIdOrSku).trim())) {
      const directId = parseInt(String(productIdOrSku).trim(), 10);
      if (!isNaN(directId) && directId > 0) return directId;
    }

    const queries: string[] = [];
    if (productIdOrSku && String(productIdOrSku).trim() !== '') {
      queries.push(String(productIdOrSku).trim());
    }
    if (productName && String(productName).trim() !== '') {
      queries.push(String(productName).trim());
    }

    for (const q of queries) {
      const result = await this.lookupProduct(q);
      if (result.success && result.products && result.products.length > 0) {
        for (const p of result.products) {
          if (p.productId && !isNaN(parseInt(String(p.productId), 10))) {
            const resolvedId = parseInt(String(p.productId), 10);
            if (resolvedId > 0) {
              this.logger.log(
                `🎯 Successfully resolved "${q}" to live OpenCart product_id: ${resolvedId} (${p.name})`,
              );
              return resolvedId;
            }
          }
        }
      }
    }

    return undefined;
  }

  private getEditDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}
