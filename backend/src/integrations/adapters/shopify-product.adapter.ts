import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInformation } from '../../entities/business_information';
import { IProductProvider, ProductRecord } from '../interfaces';

@Injectable()
export class ShopifyProductAdapter implements IProductProvider {
  private readonly logger = new Logger(ShopifyProductAdapter.name);

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
      throw new Error('Shopify credentials not found.');
    }

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
      return data.access_token;
    }
    throw new Error(
      `Failed to generate Shopify token: ${JSON.stringify(data)}`,
    );
  }

  private async getCredentials(
    business: BusinessInformation,
    forceRefresh = false,
  ) {
    if (forceRefresh || !business.shopifyAccessToken) {
      if (business.shopifyClientId && business.shopifyClientSecret) {
        business.shopifyAccessToken = await this.generateAccessToken(business);
      }
    }
    if (!business.shopifyAccessToken || !business.shopifyStoreUrl) {
      throw new Error(
        `Missing Shopify access token or store URL for business ${business.name}`,
      );
    }
    return {
      storeUrl: business.shopifyStoreUrl,
      accessToken: business.shopifyAccessToken,
    };
  }

  async fetchProductsForBusiness(
    business: BusinessInformation,
  ): Promise<ProductRecord[]> {
    if (!business.shopifyStoreUrl) return [];

    const products: ProductRecord[] = [];
    this.logger.log(
      `🛍️ Starting Shopify product sync for store: ${business.shopifyStoreUrl}...`,
    );

    let creds: { storeUrl: string; accessToken: string };
    try {
      creds = await this.getCredentials(business);
    } catch (err: any) {
      this.logger.warn(`Could not get Shopify credentials: ${err.message}`);
      return [];
    }

    let hasNextPage = true;
    let cursor: string | null = null;
    let pageCount = 0;

    const query = `
      query GetProducts($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              description
              descriptionHtml
              productType
              tags
              onlineStoreUrl
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    price
                    sku
                    barcode
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const executeGql = async (token: string, cur: string | null) => {
      const res = await fetch(
        `https://${creds.storeUrl}/admin/api/2024-01/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token,
          },
          body: JSON.stringify({ query, variables: { cursor: cur } }),
        },
      );

      if (res.status === 401) throw new Error('UNAUTHORIZED');
      const json = await res.json();
      if (json.errors) {
        const hasAuthErr = json.errors.some(
          (e: any) =>
            e.message?.toLowerCase().includes('access token') ||
            e.message?.toLowerCase().includes('unauthorized'),
        );
        if (hasAuthErr) throw new Error('UNAUTHORIZED');
      }
      return json;
    };

    while (hasNextPage) {
      pageCount++;
      let resData;
      try {
        resData = await executeGql(creds.accessToken, cursor);
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') {
          this.logger.log(
            'Refreshing expired Shopify token during product sync...',
          );
          creds = await this.getCredentials(business, true);
          resData = await executeGql(creds.accessToken, cursor);
        } else {
          this.logger.error(`Shopify product sync query error: ${err.message}`);
          break;
        }
      }

      if (resData.errors) {
        this.logger.error(
          `Shopify GraphQL errors: ${JSON.stringify(resData.errors)}`,
        );
        break;
      }

      const productEdges = resData.data?.products?.edges || [];
      for (const edge of productEdges) {
        const p = edge.node;
        const rawDesc = p.description || p.descriptionHtml || '';
        const cleanDesc = rawDesc
          .replace(/<[^>]*>?/gm, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ')
          .trim();

        const category =
          p.productType ||
          (p.tags && p.tags.length > 0 ? p.tags.join(', ') : 'Shopify Product');
        const variants = p.variants?.edges || [];

        if (variants.length === 0) {
          const numericId = p.id.split('/').pop() || p.id;
          products.push({
            productId: numericId,
            name: p.title.trim(),
            description: cleanDesc,
            price: '0.00',
            sku: numericId,
            category,
            url: p.onlineStoreUrl || `https://${business.shopifyStoreUrl}`,
            minimumQuantity: 1,
          });
        } else {
          for (const vEdge of variants) {
            const v = vEdge.node;
            const variantNumericId = v.id.split('/').pop() || v.id;
            const isDefaultTitle = v.title === 'Default Title';
            const fullName = isDefaultTitle
              ? p.title.trim()
              : `${p.title.trim()} - ${v.title.trim()}`;

            products.push({
              productId: variantNumericId,
              name: fullName,
              description: cleanDesc,
              price: String(v.price || '0.00'),
              sku: v.sku || v.barcode || variantNumericId,
              category,
              url: p.onlineStoreUrl || `https://${business.shopifyStoreUrl}`,
              minimumQuantity: 1,
            });
          }
        }
      }

      const pageInfo = resData.data?.products?.pageInfo;
      hasNextPage = Boolean(pageInfo?.hasNextPage);
      cursor = pageInfo?.endCursor || null;

      if (pageCount >= 50) break;
    }

    this.logger.log(
      `✅ Synced ${products.length} products/variants from Shopify store (${business.shopifyStoreUrl}).`,
    );
    return products;
  }

  async fetchAllProducts(): Promise<ProductRecord[]> {
    const businesses = await this.businessInfoRepo
      .createQueryBuilder('business')
      .where('business.shopifyStoreUrl IS NOT NULL')
      .andWhere(
        '(business.shopifyAccessToken IS NOT NULL OR (business.shopifyClientId IS NOT NULL AND business.shopifyClientSecret IS NOT NULL))',
      )
      .getMany();

    const allProducts: ProductRecord[] = [];
    for (const b of businesses) {
      try {
        const bProducts = await this.fetchProductsForBusiness(b);
        allProducts.push(...bProducts);
      } catch (err: any) {
        this.logger.error(
          `Failed to fetch products for Shopify store ${b.shopifyStoreUrl}: ${err?.message}`,
        );
      }
    }
    return allProducts;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async isAvailable(): Promise<boolean> {
    return true;
  }
}
