import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInformation } from '../../entities/business_information';
import { BrandConfig } from '../../config/brand.config';
import {
  IOrderProvider,
  OrderLookupResult,
  OrderListResult,
  OrderData,
  OrderProductData,
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

  private async generateAccessToken(
    business: BusinessInformation,
  ): Promise<string> {
    if (
      !business.shopifyClientId ||
      !business.shopifyClientSecret ||
      !business.shopifyStoreUrl
    ) {
      throw new Error(
        'Shopify credentials (Client ID/Secret or Store URL) not found for the associated business.',
      );
    }

    this.logger.log(
      `Generating programmatic Shopify access token for business...`,
    );
    const tokenUrl = `https://${business.shopifyStoreUrl}/admin/oauth/access_token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: business.shopifyClientId,
        client_secret: business.shopifyClientSecret,
        grant_type: 'client_credentials',
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      business.shopifyAccessToken = data.access_token;
      await this.businessInfoRepo.save(business);
      this.logger.log(
        `Successfully generated and saved new Shopify access token.`,
      );
      return data.access_token;
    } else {
      throw new Error(`Failed to generate token: ${JSON.stringify(data)}`);
    }
  }

  private async getShopifyCredentials(
    forceRefresh = false,
    businessId?: string,
  ): Promise<{ storeUrl: string; accessToken: string }> {
    let query = this.businessInfoRepo
      .createQueryBuilder('business')
      .where('business.shopifyStoreUrl IS NOT NULL')
      .andWhere(
        '(business.shopifyAccessToken IS NOT NULL OR (business.shopifyClientId IS NOT NULL AND business.shopifyClientSecret IS NOT NULL))',
      );

    if (businessId) {
      query = query.andWhere('business.id = :businessId', { businessId });
    }

    const business = await query.getOne();

    if (!business || !business.shopifyStoreUrl) {
      throw new Error(
        'Shopify store URL not found for the associated business.',
      );
    }

    if (forceRefresh || !business.shopifyAccessToken) {
      business.shopifyAccessToken = await this.generateAccessToken(business);
    }

    return {
      storeUrl: business.shopifyStoreUrl,
      accessToken: business.shopifyAccessToken,
    };
  }

  private async executeGraphQL(
    query: string,
    variables: Record<string, any> = {},
    businessId?: string,
  ): Promise<any> {
    let creds = await this.getShopifyCredentials(false, businessId);
    const shopifyApiUrl = `https://${creds.storeUrl}/admin/api/2024-01/graphql.json`;

    const callApi = async (token: string) => {
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

      const data = await response.json();
      if (data.errors) {
        const hasAuthError = data.errors.some(
          (e: any) =>
            e.message?.toLowerCase().includes('access token') ||
            e.message?.toLowerCase().includes('unauthorized') ||
            e.extensions?.code === 'ACCESS_DENIED',
        );
        if (hasAuthError) throw new Error('UNAUTHORIZED');
      }
      return data;
    };

    try {
      return await callApi(creds.accessToken);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        this.logger.log('Shopify access token expired. Refreshing token...');
        creds = await this.getShopifyCredentials(true, businessId);
        return await callApi(creds.accessToken);
      }
      throw err;
    }
  }

  private mapShopifyOrderNodeToOrderData(node: any): OrderData {
    const rawStatus = (
      node.displayFulfillmentStatus ||
      node.displayFinancialStatus ||
      'PROCESSING'
    ).toUpperCase();

    // Map into friendly customer status message
    let statusMessage = `Order ${node.name} is currently ${rawStatus.toLowerCase()}.`;
    const fulfillments = node.fulfillments || [];
    const trackingList: string[] = [];

    for (const f of fulfillments) {
      const tracking = f.trackingInfo || [];
      for (const t of tracking) {
        if (t.number) {
          const company = t.company ? ` via ${t.company}` : '';
          trackingList.push(`${t.number}${company}`);
        }
      }
    }

    if (rawStatus === 'FULFILLED') {
      if (trackingList.length > 0) {
        statusMessage = `Your order ${node.name} has been shipped and fulfilled! Tracking number: ${trackingList.join(', ')}.`;
      } else {
        statusMessage = `Your order ${node.name} is fulfilled and ready.`;
      }
    } else if (rawStatus === 'PAID') {
      statusMessage = `Your order ${node.name} is confirmed and paid. Our team is currently preparing it for shipment.`;
    } else if (rawStatus === 'UNFULFILLED') {
      statusMessage = `Your order ${node.name} is received and awaiting fulfillment.`;
    }

    const products: OrderProductData[] = (node.lineItems?.edges || []).map(
      (itemEdge: any) => {
        const item = itemEdge.node;
        const unitPrice = parseFloat(
          item.originalUnitPriceSet?.shopMoney?.amount || '0',
        );
        const totalPrice = parseFloat(
          item.originalTotalSet?.shopMoney?.amount || '0',
        );
        return {
          productId: item.variant?.id || item.id,
          name: item.title,
          model: item.sku || item.variant?.sku || '',
          quantity: item.quantity,
          unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
          total: isNaN(totalPrice) ? 0 : totalPrice,
          options: item.variant?.title
            ? [{ name: 'Variant', value: item.variant.title }]
            : [],
        };
      },
    );

    const total = parseFloat(
      node.currentTotalPriceSet?.shopMoney?.amount ||
        node.totalPriceSet?.shopMoney?.amount ||
        '0',
    );
    const subtotal = parseFloat(
      node.subtotalPriceSet?.shopMoney?.amount || '0',
    );
    const shippingCost = parseFloat(
      node.totalShippingPriceSet?.shopMoney?.amount || '0',
    );

    const shipAddress = node.shippingAddress;
    const formattedAddress = shipAddress
      ? (
          shipAddress.formatted || [
            shipAddress.address1,
            shipAddress.city,
            shipAddress.province,
            shipAddress.zip,
            shipAddress.country,
          ]
        )
          .filter(Boolean)
          .join(', ')
      : undefined;

    return {
      orderId: node.name || node.id,
      status: rawStatus,
      statusMessage,
      dateOrdered: node.createdAt,
      dateLastUpdated: node.updatedAt,
      currency: node.currentTotalPriceSet?.shopMoney?.currencyCode || 'USD',
      total: isNaN(total) ? 0 : total,
      subtotal: isNaN(subtotal) ? 0 : subtotal,
      shippingCost: isNaN(shippingCost) ? 0 : shippingCost,
      customerName:
        node.customer?.displayName ||
        `${node.customer?.firstName || ''} ${node.customer?.lastName || ''}`.trim() ||
        undefined,
      customerEmail: node.customer?.email || undefined,
      customerPhone: node.customer?.phone || undefined,
      shippingAddress: formattedAddress,
      shippingRecipient: shipAddress?.name || undefined,
      shippingCompany: shipAddress?.company || undefined,
      products,
      historySummary:
        trackingList.length > 0
          ? [`Shipment Tracking: ${trackingList.join(', ')}`]
          : undefined,
    };
  }

  async getOrderById(
    orderId: number | string,
    businessId?: string,
  ): Promise<OrderLookupResult> {
    this.logger.log(`🔍 Shopify Order Lookup for #${orderId}...`);
    try {
      const cleanOrderId = String(orderId).replace(/^#/, '').trim();
      const queryStr = `name:#${cleanOrderId} OR name:${cleanOrderId} OR id:${cleanOrderId}`;

      const gqlQuery = `
        query SearchOrder($query: String!) {
          orders(first: 1, query: $query) {
            edges {
              node {
                id
                name
                createdAt
                updatedAt
                displayFinancialStatus
                displayFulfillmentStatus
                currentTotalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                totalShippingPriceSet {
                  shopMoney {
                    amount
                  }
                }
                subtotalPriceSet {
                  shopMoney {
                    amount
                  }
                }
                customer {
                  displayName
                  email
                  phone
                }
                shippingAddress {
                  name
                  company
                  address1
                  city
                  province
                  zip
                  country
                  formatted
                }
                fulfillments(first: 5) {
                  status
                  trackingInfo(first: 5) {
                    number
                    url
                    company
                  }
                }
                lineItems(first: 25) {
                  edges {
                    node {
                      id
                      title
                      quantity
                      sku
                      originalUnitPriceSet {
                        shopMoney {
                          amount
                        }
                      }
                      originalTotalSet {
                        shopMoney {
                          amount
                        }
                      }
                      variant {
                        id
                        title
                        sku
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const res = await this.executeGraphQL(
        gqlQuery,
        { query: queryStr },
        businessId,
      );

      const orderEdges = res.data?.orders?.edges || [];
      if (orderEdges.length === 0) {
        return {
          found: false,
          message: `We could not find an order matching #${orderId} in your Shopify store.`,
        };
      }

      const orderNode = orderEdges[0].node;
      const orderData = this.mapShopifyOrderNodeToOrderData(orderNode);

      return {
        found: true,
        order: orderData,
      };
    } catch (err: any) {
      this.logger.error(
        `Failed to lookup Shopify order #${orderId}: ${err.message}`,
      );
      return {
        found: false,
        message: `Error querying Shopify store: ${err.message}`,
      };
    }
  }

  async getOrdersByEmail(
    email: string,
    businessId?: string,
  ): Promise<OrderListResult> {
    return this.getOrdersByCustomer(email, undefined, undefined, businessId);
  }

  async getOrdersByCustomer(
    email?: string,
    phone?: string,
    name?: string,
    businessId?: string,
  ): Promise<OrderListResult> {
    this.logger.log(
      `🔍 Looking up Shopify orders for Customer (Email: ${email || 'N/A'}, Phone: ${phone || 'N/A'}, Name: ${name || 'N/A'})...`,
    );

    try {
      const searchTerms: string[] = [];
      if (email) searchTerms.push(`email:${email}`);
      if (phone) searchTerms.push(`phone:${phone}`);
      if (name && !email && !phone) searchTerms.push(`customer:${name}`);

      const queryStr = searchTerms.join(' OR ');
      if (!queryStr) {
        return {
          found: false,
          message:
            'Please provide an email or phone number to look up your order history.',
        };
      }

      const gqlQuery = `
        query SearchOrders($query: String!) {
          orders(first: 10, query: $query, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                name
                createdAt
                displayFinancialStatus
                displayFulfillmentStatus
                currentTotalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                lineItems(first: 5) {
                  edges {
                    node {
                      title
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const res = await this.executeGraphQL(
        gqlQuery,
        { query: queryStr },
        businessId,
      );

      const orderEdges = res.data?.orders?.edges || [];
      if (orderEdges.length === 0) {
        return {
          found: false,
          message: `No orders found for customer information provided.`,
        };
      }

      const orders = orderEdges.map((edge: any) => {
        const node = edge.node;
        const productSummary = (node.lineItems?.edges || [])
          .map(
            (itemEdge: any) =>
              `${itemEdge.node.title} (x${itemEdge.node.quantity})`,
          )
          .join(', ');
        const total = parseFloat(
          node.currentTotalPriceSet?.shopMoney?.amount || '0',
        );
        const status = (
          node.displayFulfillmentStatus ||
          node.displayFinancialStatus ||
          'CONFIRMED'
        ).toUpperCase();

        return {
          orderId: node.name || node.id,
          status,
          dateOrdered: node.createdAt,
          total: isNaN(total) ? 0 : total,
          productSummary,
        };
      });

      return {
        found: true,
        orders,
      };
    } catch (err: any) {
      this.logger.error(
        `Failed to list Shopify orders by customer: ${err.message}`,
      );
      return {
        found: false,
        message: `Error querying Shopify store: ${err.message}`,
      };
    }
  }

  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    this.logger.log(
      `🛒 Creating Shopify Draft Order for customer ${payload.customer?.email}...`,
    );

    try {
      const lineItems = (payload.products || []).map((p) => {
        const isGid = String(p.product_id).startsWith('gid://');
        const variantId = isGid
          ? String(p.product_id)
          : `gid://shopify/ProductVariant/${p.product_id}`;
        return { variantId, quantity: p.quantity || 1 };
      });

      if (lineItems.length === 0) {
        throw new Error('No products provided for the order.');
      }

      const mutation = `
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
          note: payload.comment || `Order created via ${BrandConfig.fullName}`,
          email: payload.customer?.email,
          lineItems: lineItems,
          shippingAddress: payload.shipping_address
            ? {
                address1: payload.shipping_address.address_1,
                city: payload.shipping_address.city,
                zip: payload.shipping_address.postcode,
                firstName:
                  payload.customer?.firstname ||
                  payload.shipping_address.firstname,
                lastName:
                  payload.customer?.lastname ||
                  payload.shipping_address.lastname,
              }
            : undefined,
        },
      };

      const data = await this.executeGraphQL(
        mutation,
        variables,
        payload.businessId,
      );

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
      this.logger.error(
        `❌ Shopify Draft Order Creation Error: ${error.message}`,
      );
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
    businessId?: string,
  ): Promise<ReorderOperationResult> {
    this.logger.log(
      `🔄 Processing Shopify reorder for source order #${sourceOrderId}...`,
    );

    try {
      const lookup = await this.getOrderById(sourceOrderId, businessId);
      if (!lookup.found || !lookup.order) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Could not locate original order #${sourceOrderId} in Shopify.`,
          },
        };
      }

      const pastOrder = lookup.order;
      const productsToReorder = (pastOrder.products || []).map((p) => ({
        product_id: Number(p.productId) || 0,
        quantity: p.quantity || 1,
      }));

      if (productsToReorder.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_PRODUCTS',
            message: `Original order #${sourceOrderId} contained no re-orderable line items.`,
          },
        };
      }

      const nameParts = (pastOrder.customerName || 'Valued Customer').split(
        ' ',
      );
      const createRes = await this.createOrder({
        customer: {
          firstname: nameParts[0] || 'Customer',
          lastname: nameParts.slice(1).join(' ') || '',
          email: pastOrder.customerEmail || 'customer@example.com',
          telephone: pastOrder.customerPhone || '',
        },
        products: productsToReorder,
        comment:
          comment ||
          `Reorder of previous Shopify order #${sourceOrderId} via ${BrandConfig.fullName}`,
        businessId,
      });

      if (createRes.success && createRes.order) {
        return {
          success: true,
          order: createRes.order,
        };
      } else {
        return {
          success: false,
          error: createRes.error,
        };
      }
    } catch (err: any) {
      this.logger.error(`Shopify reorderPastOrder failed: ${err.message}`);
      return {
        success: false,
        error: { code: 'SHOPIFY_REORDER_ERROR', message: err.message },
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async isAvailable(): Promise<boolean> {
    return true;
  }
}
