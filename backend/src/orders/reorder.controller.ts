import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ReorderService } from './reorder.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('orders')
export class ReorderController {
  private readonly logger = new Logger(ReorderController.name);

  constructor(private readonly reorderService: ReorderService) {}

  @Public()
  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  async captureReorder(@Body() body: any) {
    // Extract fields from various possible Retell tool payload formats
    const productId =
      body?.productId ??
      body?.product_id ??
      body?.itemNumber ??
      body?.item_number ??
      body?.args?.productId ??
      body?.args?.product_id ??
      body?.arguments?.productId ??
      body?.arguments?.product_id ??
      undefined;

    const productName =
      body?.productName ??
      body?.product_name ??
      body?.args?.productName ??
      body?.args?.product_name ??
      body?.arguments?.productName ??
      body?.arguments?.product_name ??
      'Unknown Product';

    const quantity =
      body?.quantity ??
      body?.qty ??
      body?.args?.quantity ??
      body?.arguments?.quantity ??
      undefined;

    const customerEmail =
      body?.customerEmail ??
      body?.customer_email ??
      body?.email ??
      body?.args?.customerEmail ??
      body?.args?.email ??
      body?.arguments?.customerEmail ??
      body?.arguments?.email ??
      undefined;

    const customerName =
      body?.customerName ??
      body?.customer_name ??
      body?.name ??
      body?.args?.customerName ??
      body?.args?.name ??
      body?.arguments?.customerName ??
      body?.arguments?.name ??
      'Not provided';

    const customerPhone =
      body?.customerPhone ??
      body?.customer_phone ??
      body?.phone ??
      body?.args?.customerPhone ??
      body?.arguments?.customerPhone ??
      undefined;

    const previousOrderId =
      body?.previousOrderId ??
      body?.previous_order_id ??
      body?.reorderId ??
      body?.args?.previousOrderId ??
      body?.arguments?.previousOrderId ??
      undefined;

    const notes =
      body?.notes ??
      body?.args?.notes ??
      body?.arguments?.notes ??
      undefined;

    // Validate required fields
    if (!customerEmail) {
      return {
        success: false,
        message:
          'To process your reorder, I need your email address. Could you please provide it?',
      };
    }

    if (!productName || productName === 'Unknown Product') {
      return {
        success: false,
        message:
          'Could you please tell me the name or item number of the product you want to reorder?',
      };
    }

    this.logger.log(
      `Reorder request received: ${productName} (${productId || 'no ID'}) for ${customerEmail}`,
    );

    return this.reorderService.captureReorder({
      productId,
      productName,
      quantity: quantity ? parseInt(String(quantity), 10) : undefined,
      customerEmail,
      customerName,
      customerPhone,
      previousOrderId,
      notes,
    });
  }
}
