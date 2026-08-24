import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInformation } from '../../entities/business_information';
import {
  IOrderProvider,
  OrderLookupResult,
  OrderListResult,
  OrderData,
  CreateOrderPayload,
  CreateOrderResult,
  ReorderOperationResult,
} from '../interfaces';

@Injectable()
export class ShopifyOrderAdapter implements IOrderProvider {
  private readonly logger = new Logger(ShopifyOrderAdapter.name);

  constructor(
    @InjectRepository(BusinessInformation)
    private readonly businessInfoRepo: Repository<BusinessInformation>,
  ) {}

  private async generateAccessToken(business: BusinessInformation): Promise<string> {
    if (!business.shopifyClientId || !business.shopifyClientSecret || !business.shopifyStoreUrl) {
      throw new Error('Shopify credentials (Client ID/Secret or Store URL) not found for the associated business.');
    }
    
    this.logger.log(`Generating programmatic Shopify access token for business...`);
    const tokenUrl = `https://${business.shopifyStoreUrl}/admin/oauth/access_token`;
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: business.shopifyClientId,
        client_secret: business.shopifyClientSecret,
        grant_type: 'client_credentials'
      }),
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      business.shopifyAccessToken = data.access_token;
      await this.businessInfoRepo.save(business);
      this.logger.log(`Successfully generated and saved new Shopify access token.`);
      return data.access_token;
    } else {
      throw new Error(`Failed to generate token: ${JSON.stringify(data)}`);
    }
  }

  private async getShopifyCredentials(forceRefresh = false, businessId?: string): Promise<{ storeUrl: string; accessToken: string }> {
    let query = this.businessInfoRepo.createQueryBuilder('business')
      .where('business.shopifyStoreUrl IS NOT NULL')
      .andWhere('(business.shopifyAccessToken IS NOT NULL OR (business.shopifyClientId IS NOT NULL AND business.shopifyClientSecret IS NOT NULL))');
      
    if (businessId) {
      query = query.andWhere('business.id = :businessId', { businessId });
    }
    
    const business = await query.getOne();

    if (!business || !business.shopifyStoreUrl) {
      throw new Error('Shopify store URL not found for the associated business.');
    }

    if (forceRefresh || !business.shopifyAccessToken) {
      business.shopifyAccessToken = await this.generateAccessToken(business);
    }

    return {
      storeUrl: business.shopifyStoreUrl,
      accessToken: business.shopifyAccessToken,
    };
  }

  async getOrderById(orderId: number | string): Promise<OrderLookupResult> {
    return { found: false, message: 'Not implemented yet for Shopify.' };
  }

  async getOrdersByEmail(email: string): Promise<OrderListResult> {
    return { found: false, message: 'Not implemented yet for Shopify.' };
  }

  async getOrdersByCustomer(email?: string, phone?: string, name?: string): Promise<OrderListResult> {
    return { found: false, message: 'Not implemented yet for Shopify.' };
  }

  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    this.logger.log(`🛒 Creating Shopify Draft Order for customer ${payload.customer?.email}...`);

    try {
      let { storeUrl, accessToken } = await this.getShopifyCredentials(false, payload.businessId);
      const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/graphql.json`;

      const lineItems = (payload.products || []).map(p => {
        const isGid = String(p.product_id).startsWith('gid://');
        const variantId = isGid ? String(p.product_id) : `gid://shopify/ProductVariant/${p.product_id}`;
        return { variantId, quantity: p.quantity || 1 };
      });

      if (lineItems.length === 0) {
        throw new Error('No products provided for the order.');
      }

      const query = `
        mutation draftOrderCreate($input: DraftOrderInput!) {
          draftOrderCreate(input: $input) {
            draftOrder {
              id
              name
              invoiceUrl
              status
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          note: payload.comment || 'Order created via VoicePeri AI',
          email: payload.customer?.email,
          lineItems: lineItems,
          shippingAddress: payload.shipping_address ? {
            address1: payload.shipping_address.address_1,
            city: payload.shipping_address.city,
            zip: payload.shipping_address.postcode,
            firstName: payload.customer?.firstname || payload.shipping_address.firstname,
            lastName: payload.customer?.lastname || payload.shipping_address.lastname,
          } : undefined
        }
      };

      const executeGraphQL = async (token: string) => {
        const response = await fetch(shopifyApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token,
          },
          body: JSON.stringify({ query, variables }),
        });
        
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED');
        }
        
        const responseData = await response.json();
        
        if (responseData.errors) {
          const hasAuthError = responseData.errors.some((e: any) => 
            e.message.toLowerCase().includes('access token') || 
            e.message.toLowerCase().includes('unauthorized') ||
            e.extensions?.code === 'ACCESS_DENIED'
          );
          if (hasAuthError) throw new Error('UNAUTHORIZED');
        }
        
        return responseData;
      };

      let data;
      try {
        data = await executeGraphQL(accessToken);
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') {
          this.logger.log('Shopify access token is expired or invalid. Attempting to refresh...');
          const creds = await this.getShopifyCredentials(true, payload.businessId);
          data = await executeGraphQL(creds.accessToken);
        } else {
          throw err;
        }
      }

      if (data.errors) {
        throw new Error(data.errors.map((e: any) => e.message).join(', '));
      }

      const userErrors = data.data?.draftOrderCreate?.userErrors;
      if (userErrors && userErrors.length > 0) {
        throw new Error(userErrors.map((e: any) => e.message).join(', '));
      }

      const draftOrder = data.data?.draftOrderCreate?.draftOrder;

      return {
        success: true,
        order: {
          orderId: draftOrder.id,
          status: draftOrder.status || 'DRAFT',
          statusMessage: 'Draft order created pending payment.',
          customerEmail: payload.customer?.email,
        } as OrderData,
        message: `Draft Order successfully created with ID ${draftOrder.name}. Invoice URL: ${draftOrder.invoiceUrl}`,
      };
    } catch (error: any) {
      this.logger.error(`❌ Shopify Draft Order Creation Error: ${error.message}`);
      return {
        success: false,
        error: { code: 'SHOPIFY_ERROR', message: error.message },
        message: 'Failed to create Shopify Draft Order.',
      };
    }
  }

  async reorderPastOrder(
    sourceOrderId: number | string,
    comment?: string,
    customerId?: number,
    ip?: string,
    userAgent?: string,
  ): Promise<ReorderOperationResult> {
    this.logger.log(`🔄 Processing Shopify reorder for source order #${sourceOrderId}...`);
    // Note: A full implementation would first fetch the original order's line items from Shopify via GraphQL,
    // then call createOrder. 
    return {
      success: false,
      message: 'Reorder logic requiring fetching past line items is not fully implemented yet for Shopify.',
    };
  }

  async isAvailable(): Promise<boolean> {
    return true; 
  }
}
