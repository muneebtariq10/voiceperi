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
    const productName =
      body?.productName ??
      body?.product_name ??
      body?.args?.productName ??
      body?.args?.product_name ??
      body?.arguments?.productName ??
      body?.arguments?.product_name ??
      'Custom Printed Item';

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
      'Valued Customer';

    const rawModified =
      body?.isModifiedReorder ??
      body?.is_modified_reorder ??
      body?.modifiedReorder ??
      body?.args?.isModifiedReorder ??
      body?.arguments?.isModifiedReorder ??
      false;
    const isModifiedReorder =
      String(rawModified).toLowerCase() === 'true' || rawModified === true;

    const previousOrderOrDesignId =
      body?.previousOrderOrDesignId ??
      body?.previous_order_or_design_id ??
      body?.previousDesignId ??
      body?.previousOrderId ??
      body?.args?.previousOrderOrDesignId ??
      body?.arguments?.previousOrderOrDesignId ??
      undefined;

    const customizationNotes =
      body?.customizationNotes ??
      body?.customization_notes ??
      body?.notes ??
      body?.args?.customizationNotes ??
      body?.arguments?.customizationNotes ??
      undefined;

    if (!customerEmail) {
      return {
        success: false,
        message:
          'To generate and deliver your custom design link, I need your email address. Could you please provide your best email address?',
      };
    }

    this.logger.log(
      `📥 Webhook invoked for personalization: ${productName} (Modified: ${isModifiedReorder}) by ${customerEmail}`,
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
    });
  }
}
