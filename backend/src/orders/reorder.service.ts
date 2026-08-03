import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { OpenCartOrderAdapter } from '../integrations/adapters';

export interface ReorderRequest {
  productId?: string;
  productName: string;
  quantity?: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  previousOrderId?: string | number;
  notes?: string;
  color?: string;
  parts?: string;
  shippingAddress?: string;
}

export interface ReorderResult {
  success: boolean;
  message: string;
  referenceId: string;
  liveOrderId?: number | string;
  skippedProducts?: Array<{ product_id: number | string; quantity: number }>;
}

@Injectable()
export class ReorderService {
  private readonly logger = new Logger(ReorderService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly orderAdapter: OpenCartOrderAdapter,
  ) {}

  async captureReorder(request: ReorderRequest): Promise<ReorderResult> {
    let referenceId = `RO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    let liveOrderId: number | string | undefined = undefined;
    let customMessage: string | undefined = undefined;
    let skippedProducts: Array<{
      product_id: number | string;
      quantity: number;
    }> = [];

    this.logger.log(
      `📦 Processing order/reorder capture: ${request.productName} x${request.quantity || 1} for ${request.customerName} (${request.customerEmail})`,
    );

    // 1. Attempt Live Reorder API if a previousOrderId is provided (agentapi/order|reorder)
    if (request.previousOrderId) {
      this.logger.log(
        `🔄 Previous Order #${request.previousOrderId} detected! Executing live PrintEZ Agent reorder API...`,
      );
      try {
        const reorderRes = await this.orderAdapter.reorderPastOrder(
          request.previousOrderId,
          request.notes ||
            `Reorder via AI voice concierge for ${request.productName}`,
        );

        if (reorderRes.success && reorderRes.order) {
          liveOrderId = reorderRes.order.orderId;
          referenceId = String(liveOrderId);
          skippedProducts = reorderRes.order.skipped_products || [];

          let skippedMsg = '';
          if (skippedProducts.length > 0) {
            skippedMsg = ` Note: ${skippedProducts.length} discontinued line item(s) from order #${request.previousOrderId} were excluded from the brand new order.`;
          }

          customMessage = `Great news! Your repeat order has been instantly created in our live PrintEZ catalog under new Order ID #${liveOrderId}! All line items have been re-priced at current catalog rates.${skippedMsg} Our operations team is forwarding your secure checkout payment link directly to ${request.customerEmail}.`;
          this.logger.log(
            `🎉 Live Reorder successful! Generated new order ID: ${liveOrderId}`,
          );
        } else {
          this.logger.warn(
            `Live Reorder API returned error (${reorderRes.error?.code}): ${reorderRes.error?.message}. Falling back to manual operations capture...`,
          );
        }
      } catch (err) {
        this.logger.warn(
          `Error invoking live reorder API: ${err?.message}. Falling back to manual capture.`,
        );
      }
    }
    // 2. Otherwise, attempt Live Order Insertion API if we can resolve a numeric product ID (agentapi/order|insert)
    else if (request.productId && /\d+/.test(String(request.productId))) {
      const numericProductId = parseInt(
        String(request.productId).replace(/\D/g, ''),
        10,
      );
      if (!isNaN(numericProductId) && numericProductId > 0) {
        this.logger.log(
          `🛒 Numeric Product ID (${numericProductId}) detected! Executing live PrintEZ Agent Order Insertion API...`,
        );

        // PrintEZ requires firstname and lastname when creating a new customer account via email
        const nameParts = (request.customerName || 'Valued Customer')
          .trim()
          .split(/\s+/);
        const firstname = nameParts[0] || 'Customer';
        const lastname =
          nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Order';

        // Build comprehensive order comment with all collected details
        const commentParts: string[] = [];
        commentParts.push(
          request.notes ||
            `Phone order placed by AI concierge for ${request.productName}`,
        );
        if (request.parts) commentParts.push(`Parts: ${request.parts}`);
        if (request.color) commentParts.push(`Color: ${request.color}`);
        if (request.shippingAddress)
          commentParts.push(`Shipping Address: ${request.shippingAddress}`);
        const orderComment = commentParts.join(' | ');

        // Parse shipping address into structured fields if provided
        const shippingPayload = request.shippingAddress
          ? { address_1: request.shippingAddress }
          : undefined;

        try {
          const createRes = await this.orderAdapter.createOrder({
            customer: {
              firstname,
              lastname,
              email: request.customerEmail,
              telephone: request.customerPhone || '555-0000',
            },
            products: [
              {
                product_id: numericProductId,
                quantity:
                  request.quantity && request.quantity > 0
                    ? request.quantity
                    : 1,
              },
            ],
            ...(shippingPayload ? { shipping_address: shippingPayload } : {}),
            comment: orderComment,
          });

          if (createRes.success && createRes.order) {
            liveOrderId = createRes.order.orderId;
            referenceId = String(liveOrderId);
            customMessage = `Excellent! Your order for ${request.productName} has been directly registered in our live PrintEZ catalog under official Order ID #${liveOrderId}. Your pricing and tax are being computed by our checkout engine, and our team will email your secure checkout link to ${request.customerEmail}!`;
            this.logger.log(
              `🎉 Live New Order insertion successful! Generated Order ID: ${liveOrderId}`,
            );
          } else {
            this.logger.warn(
              `Live Order Insertion API returned error (${createRes.error?.code}): ${createRes.error?.message}. Falling back to manual capture...`,
            );
          }
        } catch (err) {
          this.logger.warn(
            `Error invoking live order insertion API: ${err?.message}. Falling back to manual capture.`,
          );
        }
      }
    }

    // 3. Send notification to PrintEZ operations team
    try {
      await this.sendOperationsNotification(
        request,
        referenceId,
        liveOrderId,
        skippedProducts,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send operations notification for ${referenceId}`,
        error?.stack,
      );
    }

    // 4. Send confirmation email directly to customer
    try {
      await this.sendCustomerConfirmation(
        request,
        referenceId,
        liveOrderId,
        customMessage,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send customer confirmation for ${referenceId}`,
        error?.stack,
      );
    }

    const finalMessage =
      customMessage ||
      `Your reorder request for ${request.productName} has been recorded with reference ID ${referenceId}. Our order processing team will verify your account details and send a checkout confirmation link directly to ${request.customerEmail}.`;

    return {
      success: true,
      message: finalMessage,
      referenceId,
      ...(liveOrderId ? { liveOrderId, skippedProducts } : {}),
    };
  }

  private async sendOperationsNotification(
    request: ReorderRequest,
    referenceId: string,
    liveOrderId?: number | string,
    skippedProducts?: Array<any>,
  ) {
    const operationsEmail =
      process.env.PRINTEZ_OPERATIONS_EMAIL || 'orders@printez.com';

    const subject = `🔄 Voice Agent Order/Reorder ${referenceId} — ${request.productName}`;

    const skippedHtml =
      skippedProducts && skippedProducts.length > 0
        ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #d9534f;">Skipped Discontinued Items</td><td style="padding: 8px; border: 1px solid #ddd; color: #d9534f;">${JSON.stringify(skippedProducts)}</td></tr>`
        : '';

    const html = `
      <h2>New Order/Reorder Request from Voice Agent</h2>
      <p style="color: green; font-weight: bold;">${liveOrderId ? `⚡ PROCESSED LIVE VIA PRINTEZ AGENT API — OFFICIAL ORDER ID: #${liveOrderId}` : '⚠️ RECORDED FOR MANUAL CHECKOUT DISPATCH'}</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Reference / Order ID</td><td style="padding: 8px; border: 1px solid #ddd;">${referenceId}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Product</td><td style="padding: 8px; border: 1px solid #ddd;">${request.productName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Item/Model #</td><td style="padding: 8px; border: 1px solid #ddd;">${request.productId || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Quantity</td><td style="padding: 8px; border: 1px solid #ddd;">${request.quantity || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Name</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Email</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerEmail}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Phone</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerPhone || 'Not provided'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Previous Order ID</td><td style="padding: 8px; border: 1px solid #ddd;">${request.previousOrderId || 'N/A (new order)'}</td></tr>
        ${request.parts ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Parts</td><td style="padding: 8px; border: 1px solid #ddd;">${request.parts}</td></tr>` : ''}
        ${request.color ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Color</td><td style="padding: 8px; border: 1px solid #ddd;">${request.color}</td></tr>` : ''}
        ${request.shippingAddress ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Shipping Address</td><td style="padding: 8px; border: 1px solid #ddd;">${request.shippingAddress}</td></tr>` : ''}
        ${skippedHtml}
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Notes</td><td style="padding: 8px; border: 1px solid #ddd;">${request.notes || 'None'}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666;">This order was captured by the VoicePeri AI Voice Agent during a live customer call. Please ensure the customer completes payment via their secure checkout link.</p>
    `;

    await this.mailerService.sendMail({
      to: operationsEmail,
      subject,
      html,
    });

    this.logger.log(
      `✅ Operations notification sent to ${operationsEmail} for ${referenceId}`,
    );
  }

  private async sendCustomerConfirmation(
    request: ReorderRequest,
    referenceId: string,
    liveOrderId?: number | string,
    customMessage?: string,
  ) {
    const subject = `PrintEZ Order/Reorder Confirmation — #${referenceId}`;

    const html = `
      <h2>Thank you for your order, ${request.customerName}!</h2>
      <p>${customMessage || `We have received your reorder request for <strong>${request.productName}</strong>.`}</p>
      <p><strong>Official Order/Reference ID:</strong> #${referenceId}</p>
      <p><strong>Product:</strong> ${request.productName}</p>
      <p><strong>Quantity:</strong> ${request.quantity || '1'}</p>
      ${request.parts ? `<p><strong>Parts:</strong> ${request.parts}</p>` : ''}
      ${request.color ? `<p><strong>Color:</strong> ${request.color}</p>` : ''}
      ${request.shippingAddress ? `<p><strong>Shipping Address:</strong> ${request.shippingAddress}</p>` : ''}
      <hr style="border: none; border-top: 1px solid #eee; my: 16px;" />
      <p>Our order processing engine will verify your order options and forward your secure payment link directly to your inbox so you can finalize checkout.</p>
      <p>If you have questions, simply reply to this email or call us at <strong>+1 845-782-5832</strong>.</p>
      <p>Thank you for choosing PrintEZ!</p>
    `;

    await this.mailerService.sendMail({
      to: request.customerEmail,
      subject,
      html,
    });

    this.logger.log(
      `✅ Customer confirmation sent to ${request.customerEmail} for #${referenceId}`,
    );
  }
}
