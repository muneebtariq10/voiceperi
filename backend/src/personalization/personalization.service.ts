import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { B2CPersonalizationAdapter } from '../integrations/adapters';

export interface PersonalizationRequest {
  productName: string;
  productId?: string;
  customerEmail: string;
  customerName: string;
  isModifiedReorder?: boolean;
  previousOrderOrDesignId?: string;
  customizationNotes?: string;
}

export interface PersonalizationResponse {
  success: boolean;
  message: string;
  designId?: string;
  editUrl?: string;
}

@Injectable()
export class PersonalizationService {
  private readonly logger = new Logger(PersonalizationService.name);

  constructor(
    private readonly b2cAdapter: B2CPersonalizationAdapter,
    private readonly mailerService: MailerService,
  ) {}

  async handlePersonalizationRequest(
    request: PersonalizationRequest,
  ): Promise<PersonalizationResponse> {
    this.logger.log(
      `🎯 Processing B2C customization for [${request.productName}] (${request.customerEmail}) - Modified Reorder: ${request.isModifiedReorder ? 'YES' : 'NO'}`,
    );

    const targetProductId = request.productId || request.productName;
    let sessionResult;

    // Scenario 3: Modified Reorder (changing address, routing numbers, logos on a repeat order)
    if (request.isModifiedReorder && request.previousOrderOrDesignId) {
      sessionResult = await this.b2cAdapter.getEditSessionForPreviousDesign(
        request.previousOrderOrDesignId,
        request.customerEmail,
      );
    } else {
      // Scenario 1: Brand New Personalization Session (custom laser checks, imprinted forms)
      sessionResult = await this.b2cAdapter.createSession(
        targetProductId,
        request.customerEmail,
        { notes: request.customizationNotes },
      );
    }

    if (
      !sessionResult.success ||
      !sessionResult.editUrl ||
      !sessionResult.designId
    ) {
      return {
        success: false,
        message:
          sessionResult.message ||
          `We encountered an issue preparing your design studio for ${request.productName}. Please confirm the product number or speak with customer care.`,
      };
    }

    // Proactively email the interactive design link directly to the caller's inbox
    try {
      await this.sendStudioLinkToCustomer(
        request,
        sessionResult.designId,
        sessionResult.editUrl,
      );
    } catch (error) {
      this.logger.error(
        `Failed emailing B2C customization link to ${request.customerEmail}: ${error?.message}`,
        error?.stack,
      );
      // Continue without breaking conversational response if SMTP credentials aren't present
    }

    const modeSummary = request.isModifiedReorder
      ? `We have duplicated your previous design from order ${request.previousOrderOrDesignId} into new customizable workspace ${sessionResult.designId}.`
      : `We have launched a custom design studio session for ${request.productName} with reference ID ${sessionResult.designId}.`;

    return {
      success: true,
      designId: sessionResult.designId,
      editUrl: sessionResult.editUrl,
      message: `${modeSummary} A secure, interactive design link has just been sent directly to ${request.customerEmail} where you can preview your layout, verify your imprinted company details, and finalize your purchase in minutes!`,
    };
  }

  private async sendStudioLinkToCustomer(
    request: PersonalizationRequest,
    designId: string,
    editUrl: string,
  ) {
    const subject = request.isModifiedReorder
      ? `PrintEZ Custom Check Update & Reorder Studio — ${designId}`
      : `PrintEZ Custom Design Studio & Checkout Link — ${request.productName}`;

    const html = `
      <h2>Hello ${request.customerName}, your custom design workspace is ready!</h2>
      <p>Thank you for speaking with our AI voice concierge about ordering <strong>${request.productName}</strong>.</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-left: 5px solid #0056b3; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px;"><strong>Design Reference ID:</strong> ${designId}</p>
      </div>
      <p>You can review your check layout, imprint business name, customize formatting, and securely complete your checkout by clicking below:</p>
      <p style="margin: 25px 0;">
        <a href="${editUrl}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          Open Interactive Design Studio
        </a>
      </p>
      <p style="color: #666; font-size: 12px;">If the button above does not open, copy and paste this URL into your browser:<br/>${editUrl}</p>
      <p>If you have any questions, reply directly to this email or call our team at <strong>+1 845-782-5832</strong>.</p>
      <p>We appreciate your business,<br/><strong>The PrintEZ Team</strong></p>
    `;

    await this.mailerService.sendMail({
      to: request.customerEmail,
      subject,
      html,
    });

    this.logger.log(
      `📧 Custom B2C Studio link emailed to ${request.customerEmail} [${designId}]`,
    );
  }
}
