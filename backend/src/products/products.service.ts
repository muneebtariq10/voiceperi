import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  private productsCache: any[] = [];

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  onModuleInit() {
    this.loadProductsIntoMemory();
    // Run DB sync in background so server startup is not blocked
    this.syncProductsToDatabase().catch((err) =>
      this.logger.error('Background DB sync failed', err),
    );
  }

  private loadProductsIntoMemory() {
    try {
      const dataPath = path.join(
        process.cwd(),
        'data',
        'printez-products.json',
      );
      if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        this.productsCache = JSON.parse(fileContent);
        this.logger.log(
          `🚀 Loaded ${this.productsCache.length} products directly into fast memory cache!`,
        );
      } else {
        this.logger.warn('printez-products.json not found for memory loading.');
      }
    } catch (error) {
      this.logger.error('Failed to load products into memory', error.stack);
    }
  }

  private async syncProductsToDatabase() {
    if (this.productsCache.length === 0) return;
    try {
      let importedCount = 0;
      for (const record of this.productsCache) {
        const existing = await this.productRepository.findOne({
          where: { productId: record.productId },
        });

        if (!existing) {
          const product = this.productRepository.create({
            productId: record.productId,
            name: record.name,
            description: record.description || '',
            price: record.price,
            sku: record.productId,
            category: record.category || '',
            url: record.url || '',
          });
          await this.productRepository.save(product);
          importedCount++;
        }
      }
      if (importedCount > 0) {
        this.logger.log(`Synced ${importedCount} new products into database.`);
      }
    } catch (error) {
      this.logger.error('Failed syncing products to DB', error.stack);
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
          const category = (p.category || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();

          // Exact or substring match on entire clean query
          if (id === queryLower || name === queryLower) {
            score += 100;
          } else if (
            id.includes(queryLower) ||
            name.includes(queryLower) ||
            category.includes(queryLower)
          ) {
            score += 50;
          }

          // Individual token relevancy
          for (const token of tokens) {
            if (id === token) score += 40;
            else if (id.includes(token)) score += 25;

            if (name.includes(token)) score += 15;
            if (category.includes(token)) score += 10;
            if (desc.includes(token)) score += 5;
          }

          return { product: p, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

      const topResults = scoredProducts.slice(0, 8).map((item) => {
        const p = item.product;
        return {
          name: p.name,
          price: p.price,
          category: p.category,
          productId: p.productId,
          sku: p.productId,
          description: p.description,
        };
      });

      if (topResults.length === 0) {
        return {
          success: true,
          message: `While we couldn't find an exact match for "${query}" in our instant lookup, PrintEZ carries a complete catalog of over 1,200 commercial printing items including QuickBooks Computer Checks, Manual Checks, Custom Carbonless Forms, Deposit Slips, Invoice Books, and Envelopes. Standard checks start at $28.99 with free logo imprint and bank encoding.`,
          products: [],
        };
      }

      return {
        success: true,
        message: `Found ${topResults.length} matching product(s) in the PrintEZ catalog for "${query}".`,
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
