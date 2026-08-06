import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PersonalizationService } from './personalization.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('personalization')
export class PersonalizationController {
  private readonly logger = new Logger(PersonalizationController.name);

  constructor(
    private readonly personalizationService: PersonalizationService,
  ) {}

  @Public()
  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startPersonalization(@Body() body: any) {
    const args = body?.args || body?.arguments || body || {};

    const productName =
      args.productName ??
      args.product_name ??
      body?.productName ??
      body?.product_name ??
      'Custom Printed Item';

    const productId =
      args.productId ??
      args.product_id ??
      args.itemNumber ??
      args.item_number ??
      body?.productId ??
      body?.product_id ??
      undefined;

    const customerEmail =
      args.customerEmail ??
      args.customer_email ??
      args.email ??
      body?.customerEmail ??
      body?.customer_email ??
      body?.email ??
      undefined;

    // CRITICAL: avoid checking body.name since Retell passes function name in body.name
    const customerName =
      args.customerName ??
      args.customer_name ??
      args.name ??
      body?.customerName ??
      body?.customer_name ??
      'Valued Customer';

    const rawModified =
      args.isModifiedReorder ??
      args.is_modified_reorder ??
      args.modifiedReorder ??
      body?.isModifiedReorder ??
      body?.is_modified_reorder ??
      body?.modifiedReorder ??
      false;
    const isModifiedReorder =
      String(rawModified).toLowerCase() === 'true' || rawModified === true;

    const previousOrderOrDesignId =
      args.previousOrderOrDesignId ??
      args.previous_order_or_design_id ??
      args.previousDesignId ??
      args.previousOrderId ??
      body?.previousOrderOrDesignId ??
      body?.previous_order_or_design_id ??
      body?.previousDesignId ??
      body?.previousOrderId ??
      undefined;

    const customizationNotes =
      args.customizationNotes ??
      args.customization_notes ??
      args.notes ??
      body?.customizationNotes ??
      body?.customization_notes ??
      body?.notes ??
      undefined;

    const rawQuantity =
      args.quantity ?? args.qty ?? body?.quantity ?? body?.qty ?? undefined;
    const quantity = rawQuantity
      ? parseInt(String(rawQuantity), 10)
      : undefined;

    const parts = args.parts ?? body?.parts ?? undefined;
    const color = args.color ?? body?.color ?? undefined;

    if (!customerEmail) {
      return {
        success: false,
        message:
          'To generate and deliver your custom design link, I need your email address. Could you please provide your best email address?',
      };
    }

    this.logger.log(
      `📥 Webhook invoked for personalization: ${productName} (Modified: ${isModifiedReorder}) by ${customerName} (${customerEmail})`,
    );

    return this.personalizationService.handlePersonalizationRequest({
      productName,
      productId,
      customerEmail,
      customerName,
      isModifiedReorder,
      previousOrderOrDesignId: previousOrderOrDesignId
        ? String(previousOrderOrDesignId)
        : undefined,
      customizationNotes,
      quantity: !isNaN(quantity as any) ? quantity : undefined,
      parts,
      color,
    });
  }
}
