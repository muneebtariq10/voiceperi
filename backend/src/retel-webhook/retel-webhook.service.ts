import { Injectable } from '@nestjs/common';
import { AgentsService } from '../agents/agents.service';
import { CallHistoryService } from '../callhistory/callhistory.service';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent'; // adjust the path
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { BusinessInformation } from 'src/entities/business_information';
import * as twilio from 'twilio';
@Injectable()
export class RetelWebhookService {
  private twilioClient: twilio.Twilio | null = null;

  constructor(
    private mailerService: MailerService,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(BusinessInformation)
    private readonly businessRepository: Repository<BusinessInformation>,
    private readonly callHistoryService: CallHistoryService,
  ) {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    }
  }
  async getAgentByRetelId(agentId: string) {
    return this.agentRepository.findOne({
      where: { retell_agent: agentId },
      relations: ['user'],
    });
  }
  async getBusinessByUserId(userId: string) {
    return this.businessRepository.findOne({
      where: {
        user_id: { id: userId },
      },
    });
  }

  async processWebhook(payload: any) {
    if (payload?.event !== 'call_analyzed') return;
    console.log(
      'Entered into call analyzed webhook with payload call ID:',
      payload?.call?.call_id,
    );
    const agentId = payload.call?.agent_id;

    const agent = await this.getAgentByRetelId(agentId);
    if (!agent) {
      console.log('Agent ID not found in database:', agentId);
      return;
    }

    let businessName = 'Valued Partner';
    if (agent?.user?.id) {
      const business = await this.getBusinessByUserId(agent.user.id);
      if (business?.name) businessName = business.name;
    }

    const agentEmails = Array.isArray(agent?.emails)
      ? agent.emails.filter((e) => e && e.trim() !== '')
      : [];
    const userEmails =
      typeof agent?.user?.email === 'string'
        ? agent?.user.email
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean)
        : [];
    const rawEmails = agentEmails.length > 0 ? agentEmails : userEmails;
    const allEmails = Array.from(new Set(rawEmails));
    if (allEmails.length === 0) return;

    const callAnalysis = payload?.call?.call_analysis || {};
    const customData = callAnalysis?.custom_analysis_data || {};

    const configuredQuestions = agent?.notes || [];
    const customVars = [
      customData?.custom_var_1,
      customData?.custom_var_2,
      customData?.custom_var_3,
      customData?.custom_var_4,
      customData?.custom_var_5,
    ];

    // Smart Email Fallback: If user_email_address is missing, find any email string in custom variables
    let callerEmail = customData?.user_email_address;
    if (
      !callerEmail ||
      typeof callerEmail !== 'string' ||
      !callerEmail.includes('@')
    ) {
      const emailMatch = customVars.find(
        (val) =>
          typeof val === 'string' &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      );
      if (emailMatch) callerEmail = emailMatch.trim();
    }

    // Smart Name Fallback: If user_name is missing, find a plausible name string
    let callerName = customData?.user_name;
    if (
      !callerName ||
      typeof callerName !== 'string' ||
      callerName.trim() === ''
    ) {
      const nameMatch = customVars.find(
        (val) =>
          typeof val === 'string' &&
          val.trim().length > 2 &&
          !val.includes('@') &&
          !/\d/.test(val) &&
          !val.toLowerCase().includes('http'),
      );
      if (nameMatch && nameMatch !== callerEmail) callerName = nameMatch.trim();
    }

    const durationSeconds =
      payload.call?.end_timestamp && payload.call?.start_timestamp
        ? Math.round(
            (payload.call.end_timestamp - payload.call.start_timestamp) / 1000,
          )
        : payload.call?.duration_ms
          ? Math.round(payload.call.duration_ms / 1000)
          : null;

    const callerInfo = {
      callerName: callerName || 'Not specified',
      callerEmail: callerEmail || 'Not provided',
      callerPhone:
        payload.call?.from_number ||
        payload.call?.to_number ||
        'Web / App Audio',
      callerInterest:
        customData?.service_interest || 'General Consultation & Catalog Order',
      callSummary:
        callAnalysis?.call_summary || 'No conversation summary generated.',
      callerSentiment: callAnalysis?.user_sentiment || 'Neutral',
      callStatus:
        callAnalysis?.call_successful !== undefined
          ? callAnalysis?.call_successful
            ? 'Successful'
            : 'Needs Follow-up'
          : 'Completed',
      durationSeconds,
      recordingUrl: payload.call?.recording_url || null,
    };

    // Pair custom variables with configured question titles
    const pairedQuestions: { question: string; answer: string }[] = [];
    customVars.forEach((val, i) => {
      if (val && typeof val === 'string' && val.trim() !== '') {
        const questionText =
          configuredQuestions[i] && configuredQuestions[i].trim() !== ''
            ? configuredQuestions[i].trim()
            : `Extracted Insight #${i + 1}`;
        pairedQuestions.push({ question: questionText, answer: val.trim() });
      }
    });

    let textQuestionsSection = '';
    if (pairedQuestions.length > 0) {
      textQuestionsSection = `\nCustomer Questions & Extracted Answers:\n${pairedQuestions
        .map((qa, i) => `  ${i + 1}. Q: ${qa.question}\n     A: ${qa.answer}`)
        .join('\n\n')}\n`;
    }

    let htmlQuestionsSection = '';
    if (pairedQuestions.length > 0) {
      htmlQuestionsSection = `
      <div style="margin-top: 28px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Q&A & Extracted Insights</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #ffffff;">
          ${pairedQuestions
            .map(
              (qa, i) => `
            <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
              <td style="padding: 14px 18px; border-bottom: ${
                i === pairedQuestions.length - 1 ? 'none' : '1px solid #e5e7eb'
              }; width: 45%; font-weight: 600; color: #374151; font-size: 14px; vertical-align: top;">
                ${qa.question}
              </td>
              <td style="padding: 14px 18px; border-bottom: ${
                i === pairedQuestions.length - 1 ? 'none' : '1px solid #e5e7eb'
              }; color: #1e40af; font-size: 14px; vertical-align: top;">
                <span style="background-color: #eff6ff; padding: 4px 10px; border-radius: 6px; font-weight: 500; display: inline-block; border: 1px solid #dbeafe;">
                  ${qa.answer}
                </span>
              </td>
            </tr>
          `,
            )
            .join('')}
        </table>
      </div>`;
    }

    const callerIdentifier =
      callerInfo.callerEmail !== 'Not provided'
        ? callerInfo.callerEmail
        : callerInfo.callerName !== 'Not specified'
          ? callerInfo.callerName
          : callerInfo.callerPhone;

    const emailSubject = `📞 Call Insight from ${callerIdentifier} | ${businessName} Concierge`;

    const sentimentColor = callerInfo.callerSentiment
      ?.toLowerCase()
      .includes('positive')
      ? '#059669'
      : callerInfo.callerSentiment?.toLowerCase().includes('negative')
        ? '#dc2626'
        : '#4b5563';
    const sentimentBg = callerInfo.callerSentiment
      ?.toLowerCase()
      .includes('positive')
      ? '#ecfdf5'
      : callerInfo.callerSentiment?.toLowerCase().includes('negative')
        ? '#fef2f2'
        : '#f3f4f6';

    const outcomeColor =
      callerInfo.callStatus === 'Successful' ? '#059669' : '#d97706';
    const outcomeBg =
      callerInfo.callStatus === 'Successful' ? '#ecfdf5' : '#fffbeb';

    const recordingCta = callerInfo.recordingUrl
      ? `<div style="margin-top: 28px; text-align: center;"><a href="${callerInfo.recordingUrl}" target="_blank" style="display: inline-block; background-color: #4338ca; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(67, 56, 202, 0.25);">🎧 Listen to Full Call Recording</a></div>`
      : '';

    const textContent = `Hi ${businessName},

A new voice consultation has just been completed. Here is the executive summary and extracted insights from the conversation:

👤 Caller Information:
  • Name: ${callerInfo.callerName}
  • Email: ${callerInfo.callerEmail}
  • Phone: ${callerInfo.callerPhone}
  • Interest/Product: ${callerInfo.callerInterest}
  • Call Outcome: ${callerInfo.callStatus}
  • Sentiment: ${callerInfo.callerSentiment}

📋 Executive Call Summary:
${callerInfo.callSummary}
${textQuestionsSection}${callerInfo.recordingUrl ? `\n🎧 Audio Recording Link: ${callerInfo.recordingUrl}\n` : ''}
Your AI Concierge,
VoicePeri Platform`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Call Executive Summary</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); border: 1px solid #e5e7eb;">
    <!-- Header Banner -->
    <tr>
      <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 30px 36px; color: #ffffff;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #a5b4fc; margin-bottom: 6px;">VoicePeri AI Concierge</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Executive Call Summary</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #e0e7ff;">New interaction analysis for <strong>${businessName}</strong></p>
      </td>
    </tr>

    <!-- Metrics Bar -->
    <tr>
      <td style="background-color: #f8fafc; padding: 16px 36px; border-bottom: 1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 13px; color: #64748b;">
              <strong>Outcome:</strong> 
              <span style="background-color: ${outcomeBg}; color: ${outcomeColor}; padding: 3px 8px; border-radius: 9999px; font-weight: 600; font-size: 12px; margin-left: 4px;">${callerInfo.callStatus}</span>
            </td>
            <td style="font-size: 13px; color: #64748b; text-align: center;">
              <strong>Sentiment:</strong> 
              <span style="background-color: ${sentimentBg}; color: ${sentimentColor}; padding: 3px 8px; border-radius: 9999px; font-weight: 600; font-size: 12px; margin-left: 4px;">${callerInfo.callerSentiment}</span>
            </td>
            ${
              callerInfo.durationSeconds
                ? `<td style="font-size: 13px; color: #64748b; text-align: right;"><strong>Duration:</strong> <span style="color: #334155; font-weight: 600; margin-left: 4px;">${Math.floor(
                    callerInfo.durationSeconds / 60,
                  )}m ${callerInfo.durationSeconds % 60}s</span></td>`
                : ''
            }
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Body Content -->
    <tr>
      <td style="padding: 36px;">
        <!-- Caller Profile Card -->
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.5px;">Caller Identification & Profile</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fafafa; margin-bottom: 28px;">
          <tr>
            <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; width: 35%; font-size: 13px; color: #6b7280; font-weight: 500;">👤 Customer Name</td>
            <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600; color: #111827;">${callerInfo.callerName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; font-weight: 500;">✉️ Email Address</td>
            <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600; color: #2563eb;">
              ${
                callerInfo.callerEmail !== 'Not provided'
                  ? `<a href="mailto:${callerInfo.callerEmail}" style="color: #2563eb; text-decoration: none;">${callerInfo.callerEmail}</a>`
                  : '<span style="color: #9ca3af; font-weight: 400;">Not captured in audio</span>'
              }
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; font-weight: 500;">📱 Phone Number</td>
            <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600; color: #374151;">${callerInfo.callerPhone}</td>
          </tr>
          <tr>
            <td style="padding: 12px 18px; font-size: 13px; color: #6b7280; font-weight: 500;">🎯 Product / Service Interest</td>
            <td style="padding: 12px 18px; font-size: 14px; font-weight: 600; color: #059669;">${callerInfo.callerInterest}</td>
          </tr>
        </table>

        <!-- Call Summary -->
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.5px;">Executive Conversation Summary</h3>
        <div style="padding: 20px; background-color: #f8fafc; border-left: 4px solid #4338ca; border-radius: 6px; font-size: 15px; color: #334155; line-height: 1.6; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);">
          ${callerInfo.callSummary}
        </div>

        <!-- Q&A Section -->
        ${htmlQuestionsSection}

        <!-- Call Action Recording -->
        ${recordingCta}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">VoicePeri AI Concierge Platform &bull; Intelligent Call Analytics</p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">You are receiving this instant notification because your AI receptionist just completed a conversation for <strong>${businessName}</strong>.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Instantly send emails without waiting for downstream history syncs
    await Promise.all(
      allEmails.map((email) =>
        this.mailerService
          .sendMail({
            to: email,
            subject: emailSubject,
            text: textContent,
            html: htmlContent,
          })
          .catch((err) => console.error('Failed to send email to', email, err)),
      ),
    );

    const phoneNumbers = agent?.phone_numbers || [];
    if (this.twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
      await Promise.all(
        phoneNumbers.map((number) => {
          const formattedNumber = number.startsWith('+')
            ? number
            : '+' + number.replace(/\D/g, '');
          return this.twilioClient!.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${formattedNumber}`,
            body: textContent,
          }).catch((err) =>
            console.error('Failed to send WhatsApp message', err),
          );
        }),
      );
    }

    // After notifications are instantly dispatched, sync the call history in background
    try {
      await this.callHistoryService.historyAndSave();
      console.log('Successfully synced call history via webhook.');
    } catch (err) {
      console.error('Failed to sync call history via webhook:', err);
    }
  }
}
