import {
  Controller,
  Post,
  Body,
  Req,
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
  async captureReorder(@Body() body: any, @Req() req: any) {
    // Extract fields prioritizing body.args/body.arguments to prevent tool metadata (e.g. body.name = 'capture_reorder') from overriding arguments
    const args = body?.args || body?.arguments || body || {};

    const agentId = body?.agent_id || args.agent_id;
    const callId = body?.call_id || args.call_id;

    const productId =
      args.productId ??
      args.product_id ??
      args.itemNumber ??
      args.item_number ??
      body?.productId ??
      body?.product_id ??
      undefined;

    const productName =
      args.productName ??
      args.product_name ??
      body?.productName ??
      body?.product_name ??
      'Unknown Product';

    const quantity =
      args.quantity ?? args.qty ?? body?.quantity ?? body?.qty ?? undefined;

    const customerEmail =
      args.customerEmail ??
      args.customer_email ??
      args.email ??
      body?.customerEmail ??
      body?.customer_email ??
      body?.email ??
      undefined;

    // CRITICAL: Avoid falling back to body.name as Retell sends function tool name (e.g. 'capture_reorder') in body.name
    const customerName =
      args.customerName ??
      args.customer_name ??
      args.name ??
      body?.customerName ??
      body?.customer_name ??
      'Valued Customer';

    const customerPhone =
      args.customerPhone ??
      args.customer_phone ??
      args.phone ??
      body?.customerPhone ??
      body?.customer_phone ??
      body?.phone ??
      undefined;

    const previousOrderId =
      args.previousOrderId ??
      args.previous_order_id ??
      args.reorderId ??
      args.reorder_id ??
      body?.previousOrderId ??
      body?.previous_order_id ??
      body?.reorderId ??
      body?.reorder_id ??
      undefined;

    const notes = args.notes ?? body?.notes ?? undefined;
    const color = args.color ?? body?.color ?? undefined;
    const parts = args.parts ?? body?.parts ?? undefined;

    const shippingAddress =
      args.shippingAddress ??
      args.shipping_address ??
      args.address ??
      body?.shippingAddress ??
      body?.shipping_address ??
      body?.address ??
      undefined;

    const company = args.company ?? body?.company ?? undefined;
    const streetAddress =
      args.streetAddress ??
      args.street_address ??
      body?.streetAddress ??
      body?.street_address ??
      undefined;
    const city = args.city ?? body?.city ?? undefined;
    const state = args.state ?? body?.state ?? undefined;
    const zipCode =
      args.zipCode ??
      args.zip_code ??
      args.postcode ??
      body?.zipCode ??
      body?.zip_code ??
      body?.postcode ??
      undefined;

    const billingStreetAddress =
      args.billingStreetAddress ??
      args.billing_street_address ??
      body?.billingStreetAddress ??
      body?.billing_street_address ??
      undefined;
    const billingCity =
      args.billingCity ??
      args.billing_city ??
      body?.billingCity ??
      body?.billing_city ??
      undefined;
    const billingState =
      args.billingState ??
      args.billing_state ??
      body?.billingState ??
      body?.billing_state ??
      undefined;
    const billingZipCode =
      args.billingZipCode ??
      args.billing_zip_code ??
      body?.billingZipCode ??
      body?.billing_zip_code ??
      undefined;

    const shippingMethod =
      args.shippingMethod ??
      args.shipping_method ??
      body?.shippingMethod ??
      body?.shipping_method ??
      undefined;
    const paymentMethod =
      args.paymentMethod ??
      args.payment_method ??
      body?.paymentMethod ??
      body?.payment_method ??
      undefined;

    const ip =
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.headers?.['x-real-ip'] ||
      req?.socket?.remoteAddress ||
      '127.0.0.1';

    const userAgent = 'VoicePeri AI Telephony Concierge';

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
      `Reorder request received: ${productName} (${productId || 'no ID'}) for ${customerName} (${customerEmail}) via IP ${ip} (Agent: ${agentId || 'unknown'})`,
    );

    return this.reorderService.captureReorder({
      agentId,
      callId,
      productId,
      productName,
      quantity: quantity ? parseInt(String(quantity), 10) : 1,
      customerEmail,
      customerName,
      customerPhone,
      previousOrderId,
      notes,
      color,
      parts,
      shippingAddress,
      company,
      streetAddress,
      city,
      state,
      zipCode,
      billingStreetAddress,
      billingCity,
      billingState,
      billingZipCode,
      shippingMethod,
      paymentMethod,
      ip,
      userAgent,
    });
  }
}
