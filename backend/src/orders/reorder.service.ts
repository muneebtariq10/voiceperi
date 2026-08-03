import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface ReorderRequest {
  productId?: string;
  productName: string;
  quantity?: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  previousOrderId?: string | number;
  notes?: string;
}

export interface ReorderResult {
  success: boolean;
  message: string;
  referenceId: string;
}

@Injectable()
export class ReorderService {
  private readonly logger = new Logger(ReorderService.name);

  constructor(private readonly mailerService: MailerService) {}

  async captureReorder(request: ReorderRequest): Promise<ReorderResult> {
    const referenceId = `RO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    this.logger.log(
      `📦 Capturing reorder request ${referenceId}: ${request.productName} x${request.quantity || 1} for ${request.customerName} (${request.customerEmail})`,
    );

    // Send notification to PrintEZ operations team
    try {
      await this.sendOperationsNotification(request, referenceId);
    } catch (error) {
      this.logger.error(
        `Failed to send operations notification for ${referenceId}`,
        error?.stack,
      );
      // Don't fail the whole request if email fails — log and continue
    }

    // Send confirmation to customer
    try {
      await this.sendCustomerConfirmation(request, referenceId);
    } catch (error) {
      this.logger.error(
        `Failed to send customer confirmation for ${referenceId}`,
        error?.stack,
      );
    }

    return {
      success: true,
      message: `Your reorder request for ${request.productName} has been recorded with reference ID ${referenceId}. Our order processing team will verify your account details and send a checkout confirmation link directly to ${request.customerEmail}.`,
      referenceId,
    };
  }

  private async sendOperationsNotification(
    request: ReorderRequest,
    referenceId: string,
  ) {
    const operationsEmail =
      process.env.PRINTEZ_OPERATIONS_EMAIL || 'orders@printez.com';

    const subject = `🔄 Voice Agent Reorder Request ${referenceId} — ${request.productName}`;

    const html = `
      <h2>New Reorder Request from Voice Agent</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Reference ID</td><td style="padding: 8px; border: 1px solid #ddd;">${referenceId}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Product</td><td style="padding: 8px; border: 1px solid #ddd;">${request.productName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Item/Model #</td><td style="padding: 8px; border: 1px solid #ddd;">${request.productId || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Quantity</td><td style="padding: 8px; border: 1px solid #ddd;">${request.quantity || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Name</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Email</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerEmail}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Phone</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerPhone || 'Not provided'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Previous Order ID</td><td style="padding: 8px; border: 1px solid #ddd;">${request.previousOrderId || 'N/A (new order)'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Notes</td><td style="padding: 8px; border: 1px solid #ddd;">${request.notes || 'None'}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666;">This reorder was captured by the VoicePeri AI Voice Agent during a live customer call. Please process this request and send the customer a checkout/payment link.</p>
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
  ) {
    const subject = `PrintEZ Reorder Confirmation — ${referenceId}`;

    const html = `
      <h2>Thank you for your reorder, ${request.customerName}!</h2>
      <p>We have received your reorder request for <strong>${request.productName}</strong>.</p>
      <p><strong>Reference ID:</strong> ${referenceId}</p>
      <p><strong>Quantity:</strong> ${request.quantity || 'To be confirmed'}</p>
      <p>Our order processing team will review your previous artwork and imprint settings, then send you a secure checkout link to finalize your order.</p>
      <p>If you have questions, reply to this email or call us at <strong>+1 845-782-5832</strong>.</p>
      <p>Thank you for choosing PrintEZ!</p>
    `;

    await this.mailerService.sendMail({
      to: request.customerEmail,
      subject,
      html,
    });

    this.logger.log(
      `✅ Customer confirmation sent to ${request.customerEmail} for ${referenceId}`,
    );
  }
}
