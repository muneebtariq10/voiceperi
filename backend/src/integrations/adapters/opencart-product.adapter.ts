import { Injectable, Logger } from '@nestjs/common';
import { IProductProvider, ProductRecord } from '../interfaces';

/**
 * OpenCartProductAdapter — Fetches product catalog from PrintEZ's OpenCart API.
 *
 * Extracted from ProductsService to follow the Adapter pattern.
 * Tomorrow this could be swapped for ShopifyProductAdapter, WooCommerceProductAdapter, etc.
 */
@Injectable()
export class OpenCartProductAdapter implements IProductProvider {
  private readonly logger = new Logger(OpenCartProductAdapter.name);

  private readonly apiUrl =
    'https://www.printez.com/index.php?route=agentapi/product|list';
  private readonly apiHeader = {
    Authorization:
      'Bearer 5c4faefcfc742ee848f1aa2f385f237aec5e70c6fcd7d5b3c8e082e426c51b54',
  };

  async fetchAllProducts(): Promise<ProductRecord[]> {
    const allProducts: ProductRecord[] = [];
    let page = 1;
    const limit = 500;
    let hasMore = true;

    this.logger.log(
      '🌐 Starting live product catalog sync from PrintEZ API...',
    );
    try {
      while (hasMore) {
        const url = `${this.apiUrl}&limit=${limit}&page=${page}`;
        const response = await fetch(url, { headers: this.apiHeader });
        if (!response.ok) {
          this.logger.warn(
            `Failed fetching PrintEZ API page ${page}: HTTP ${response.status}`,
          );
          break;
        }

        const data = await response.json();
        if (
          !data ||
          !Array.isArray(data.products) ||
          data.products.length === 0
        ) {
          break;
        }

        for (const item of data.products) {
          const rawDesc = item.description || '';
          const cleanDesc = rawDesc
            .replace(/<[^>]*>?/gm, ' ') // Strip HTML tags for clean AI voice rendering
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();

          const category =
            item.category_path ||
            (Array.isArray(item.breadcrumb) && item.breadcrumb.length > 0
              ? item.breadcrumb.map((b: any) => b.name).join(' > ')
              : '');

          const prodId = String(item.product_id || item.model || '').trim();
          const rawModel = String(item.model || item.product_id || '').trim();
          const imageUrl = String(item.image || '');
          const prodUrl = String(item.url || '');
          // Extract SKU codes from image filename or url (e.g., DLT103.jpg -> DLT103)
          const imgMatch = imageUrl.match(/\/([A-Za-z0-9_-]+)\.[a-z]{3,4}$/i);
          const urlMatch = prodUrl.match(/\/([A-Za-z0-9_-]+)(\.html)?$/i);
          const extraSku = [rawModel, imgMatch?.[1], urlMatch?.[1]]
            .filter(Boolean)
            .join(' ')
            .trim();

          allProducts.push({
            productId: prodId,
            name: (item.title || '').trim(),
            description: cleanDesc,
            price: String(item.price ?? ''),
            sku: extraSku || rawModel,
            category: category,
            url: prodUrl,
            priceFrom: Boolean(item.price_from),
            minimumQuantity: item.minimum_quantity || 1,
            descriptionTruncated: Boolean(item.description_truncated),
          });
        }

        hasMore =
          Boolean(data?.pagination?.has_more) && data.products.length > 0;
        page++;
        if (page > 200) break; // Safety cap against infinite loops
      }
      this.logger.log(
        `✅ Completed PrintEZ API fetch. Retrieved ${allProducts.length} total products across ${page - 1} pages.`,
      );
      return allProducts;
    } catch (error) {
      this.logger.error(
        'Error fetching products from PrintEZ API',
        error?.stack,
      );
      return allProducts;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}&limit=1&page=1`, {
        headers: this.apiHeader,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
