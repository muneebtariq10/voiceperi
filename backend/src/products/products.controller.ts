import { Controller, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Post('lookup')
  async lookupProduct(@Body() body: any) {
    const rawQuery =
      body?.query ??
      body?.keyword ??
      body?.product ??
      body?.product_name ??
      body?.item_number ??
      body?.model ??
      body?.sku ??
      body?.args?.query ??
      body?.args?.keyword ??
      body?.args?.product ??
      body?.args?.product_name ??
      body?.arguments?.query ??
      body?.arguments?.keyword ??
      body?.arguments?.product ??
      body?.arguments?.product_name ??
      (typeof body === 'string' ? body : undefined);

    return this.productsService.lookupProduct(rawQuery);
  }

  @Public()
  @Post('sync-shopify')
  async syncShopify(@Body() body?: { businessId?: string }) {
    if (body?.businessId) {
      const count = await this.productsService.syncShopifyProductsForBusiness(
        body.businessId,
      );
      return {
        success: true,
        message: `Synced ${count} products for business ${body.businessId}`,
        count,
      };
    }
    const count = await this.productsService.syncAllShopifyProducts();
    return {
      success: true,
      message: `Synced ${count} products across all Shopify stores`,
      count,
    };
  }
}
