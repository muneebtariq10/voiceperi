import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInformation } from '../entities/business_information';
import { ProductsService } from '../products/products.service';
import { ProductRecord } from '../integrations/interfaces';
import * as crypto from 'crypto';

@Injectable()
export class ShopifyWebhookService {
  private readonly logger = new Logger(ShopifyWebhookService.name);

  constructor(
    @InjectRepository(BusinessInformation)
    private readonly businessInfoRepo: Repository<BusinessInformation>,
    private readonly productsService: ProductsService,
  ) {}

  verifyHmac(rawBody: string | Buffer, hmacHeader: string, secret: string): boolean {
    if (!hmacHeader || !secret) return false;
    try {
      const generatedHmac = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('base64');
      return crypto.timingSafeEqual(
        Buffer.from(generatedHmac),
        Buffer.from(hmacHeader),
      );
    } catch {
      return false;
    }
  }

  async handleWebhook(
    topic: string,
    shopDomain: string,
    payload: any,
    hmacHeader?: string,
    rawBody?: any,
  ): Promise<{ status: string; message: string }> {
    this.logger.log(
      `📥 Received Shopify Webhook: [Topic: ${topic}] from [Shop: ${shopDomain}]`,
    );

    const business = await this.businessInfoRepo
      .createQueryBuilder('business')
      .where('business.shopifyStoreUrl ILIKE :shopDomain', {
        shopDomain: `%${shopDomain}%`,
      })
      .getOne();

    // Verify HMAC if client secret exists and raw body is provided
    if (business?.shopifyClientSecret && hmacHeader && rawBody) {
      const isValid = this.verifyHmac(
        rawBody,
        hmacHeader,
        business.shopifyClientSecret,
      );
      if (!isValid) {
        this.logger.warn(
          `⚠️ HMAC signature verification failed for shop ${shopDomain}`,
        );
      }
    }

    switch (topic?.toLowerCase()) {
      case 'products/create':
      case 'products/update':
        return await this.handleProductUpsert(payload, shopDomain);

      case 'products/delete':
        return await this.handleProductDelete(payload);

      case 'orders/fulfilled':
      case 'orders/updated':
      case 'orders/create':
      case 'orders/paid':
        return await this.handleOrderUpdate(topic, payload, shopDomain);

      default:
        this.logger.log(`ℹ️ Webhook topic '${topic}' acknowledged (no handler required).`);
        return { status: 'acknowledged', message: `Unhandled topic: ${topic}` };
    }
  }

  private async handleProductUpsert(
    product: any,
    shopDomain: string,
  ): Promise<{ status: string; message: string }> {
    if (!product || !product.id) {
      return { status: 'error', message: 'Invalid product payload' };
    }

    const rawDesc = product.body_html || product.description || '';
    const cleanDesc = rawDesc
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    const category =
      product.product_type ||
      (product.tags ? String(product.tags) : 'Shopify Product');
    const variants = product.variants || [];
    const records: ProductRecord[] = [];

    if (variants.length === 0) {
      records.push({
        productId: String(product.id),
        name: String(product.title || '').trim(),
        description: cleanDesc,
        price: '0.00',
        sku: String(product.id),
        category,
        url: `https://${shopDomain}/products/${product.handle || ''}`,
        minimumQuantity: 1,
      });
    } else {
      for (const v of variants) {
        const isDefault = v.title === 'Default Title';
        const fullName = isDefault
          ? String(product.title || '').trim()
          : `${String(product.title || '').trim()} - ${String(v.title || '').trim()}`;

        records.push({
          productId: String(v.id),
          name: fullName,
          description: cleanDesc,
          price: String(v.price || '0.00'),
          sku: String(v.sku || v.barcode || v.id),
          category,
          url: `https://${shopDomain}/products/${product.handle || ''}`,
          minimumQuantity: 1,
        });
      }
    }

    await this.productsService.upsertProducts(records);
    this.logger.log(
      `✅ [Real-Time Webhook] Upserted ${records.length} variant(s) for "${product.title}" (${shopDomain})`,
    );

    return {
      status: 'success',
      message: `Upserted ${records.length} variants for product ${product.id}`,
    };
  }

  private async handleProductDelete(
    payload: any,
  ): Promise<{ status: string; message: string }> {
    const productId = String(payload?.id || '');
    if (!productId) {
      return { status: 'error', message: 'Missing product ID in delete payload' };
    }

    await this.productsService.removeProducts([productId]);
    this.logger.log(
      `🗑️ [Real-Time Webhook] Removed product ID ${productId} from store catalog`,
    );

    return {
      status: 'success',
      message: `Deleted product ${productId}`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async handleOrderUpdate(
    topic: string,
    order: any,
    shopDomain: string,
  ): Promise<{ status: string; message: string }> {
    const orderName = order.name || `#${order.order_number || order.id}`;
    const fulfillments = order.fulfillments || [];
    const trackingNumbers = fulfillments
      .map((f: any) => f.tracking_number)
      .filter(Boolean);

    this.logger.log(
      `📦 [Real-Time Webhook: ${topic}] Order ${orderName} updated (${shopDomain}). Fulfillment: ${order.fulfillment_status || 'unfulfilled'}. Tracking: ${trackingNumbers.join(', ') || 'N/A'}`,
    );

    return {
      status: 'success',
      message: `Order ${orderName} updated`,
    };
  }
}
