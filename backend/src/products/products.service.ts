import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Product } from '../entities/product';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    await this.importProducts();
  }

  private async importProducts() {
    try {
      const dataPath = path.join(
        process.cwd(),
        'data',
        'printez-products.json',
      );
      if (!fs.existsSync(dataPath)) {
        this.logger.warn(
          'printez-products.json not found, skipping product import.',
        );
        return;
      }

      const fileContent = fs.readFileSync(dataPath, 'utf8');
      const productsData = JSON.parse(fileContent);

      let importedCount = 0;
      for (const record of productsData) {
        let product = await this.productRepository.findOne({
          where: { productId: record.productId },
        });

        if (!product) {
          product = this.productRepository.create({
            productId: record.productId,
            name: record.name,
            description: record.description || '',
            price: record.price,
            sku: record.sku || '',
            category: record.category || '',
            url: record.url || '',
          });
          await this.productRepository.save(product);
          importedCount++;
        }
      }

      if (importedCount > 0) {
        this.logger.log(`Successfully imported ${importedCount} new products.`);
      } else {
        this.logger.log('Products database is already up to date.');
      }
    } catch (error) {
      this.logger.error('Failed to import products', error.stack);
    }
  }

  async lookupProduct(query: string) {
    if (!query) {
      return {
        success: false,
        message:
          'Please provide a product name, category, or keyword to search.',
      };
    }

    try {
      // Find products that match the query in name or category
      const products = await this.productRepository.find({
        where: [
          { name: ILike(`%${query}%`) },
          { category: ILike(`%${query}%`) },
          { sku: ILike(`%${query}%`) },
        ],
        take: 5, // Return top 5 results
      });

      if (products.length === 0) {
        return {
          success: false,
          message: `I couldn't find any products matching "${query}".`,
        };
      }

      return {
        success: true,
        message: `Found ${products.length} product(s) matching your search.`,
        products: products.map((p) => ({
          name: p.name,
          price: p.price,
          category: p.category,
          sku: p.sku,
        })),
      };
    } catch (error) {
      this.logger.error(`Error looking up product: ${query}`, error.stack);
      return {
        success: false,
        message: 'An error occurred while searching for products.',
      };
    }
  }
}
