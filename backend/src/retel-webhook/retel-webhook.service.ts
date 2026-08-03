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

    // Helper dictionaries and classifiers for intelligent semantic detection
    const productKeywords = [
      'book',
      'receipt',
      'card',
      'check',
      'form',
      'order',
      'print',
      'sales',
      'catalog',
      'laser',
      'carbonless',
      'booked',
      'banner',
      'flyer',
      'brochure',
      'service',
      'item',
      'customization',
      'invoice',
      'folder',
      'label',
      'envelope',
      'stationery',
      'package',
      'bundle',
    ];
    const companyKeywords = [
      'corporation',
      'corp',
      'inc',
      'llc',
      'ltd',
      'company',
      'enterprises',
      'solutions',
      'business',
      'industries',
      'group',
      'associates',
      'partners',
      'studio',
      'agency',
      'holdings',
    ];

    const isEmailString = (s: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
    const isPriceString = (s: string) =>
      /^\$[\d,]+(\.\d{2})?$/.test(s.trim()) ||
      /^(\d{1,5}\.\d{2})/.test(s.trim()) ||
      s.toLowerCase().includes('dollar') ||
      s.toLowerCase().includes('price');
    const isCompanyString = (s: string) =>
      companyKeywords.some((kw) => s.toLowerCase().includes(kw));
    const isProductString = (s: string) =>
      productKeywords.some((kw) => s.toLowerCase().includes(kw));
    const isPlausibleHumanName = (s: string) => {
      const trimmed = s.trim();
      if (trimmed.length < 3 || trimmed.length > 35) return false;
      if (
        /\d/.test(trimmed) ||
        trimmed.includes('@') ||
        trimmed.toLowerCase().includes('http')
      )
        return false;
      if (
        isProductString(trimmed) ||
        isCompanyString(trimmed) ||
        isPriceString(trimmed)
      ) {
        return false;
      }
      const wordCount = trimmed.split(/\s+/).length;
      return (
        wordCount >= 1 &&
        wordCount <= 4 &&
        !/[!@#$%^&*()_+=[\]{};':"\\|,.<>?]/.test(trimmed) &&
        !trimmed.includes('/')
      );
    };

    // Smart Email Fallback: If user_email_address is missing, find any email string in custom variables
    let callerEmail = customData?.user_email_address;
    if (
      !callerEmail ||
      typeof callerEmail !== 'string' ||
      !callerEmail.includes('@')
    ) {
      const emailMatch = customVars.find(
        (val) => typeof val === 'string' && isEmailString(val),
      );
      if (emailMatch) callerEmail = emailMatch.trim();
    }

    // Smart Company Detection:
    let callerCompany: string | null = null;
    const companyMatch = customVars.find(
      (val) => typeof val === 'string' && isCompanyString(val),
    );
    if (companyMatch) callerCompany = companyMatch.trim();

    // Smart Name Fallback:
    let callerName = customData?.user_name;
    if (
      !callerName ||
      typeof callerName !== 'string' ||
      callerName.trim() === ''
    ) {
      const nameMatch = customVars.find(
        (val) =>
          typeof val === 'string' &&
          isPlausibleHumanName(val) &&
          val !== callerEmail &&
          val !== callerCompany,
      );
      if (nameMatch) callerName = nameMatch.trim();
    }
    // Prevent product or company titles from leaking into Customer Name field
    if (
      callerName &&
      !isPlausibleHumanName(callerName) &&
      !customData?.user_name
    ) {
      callerName = null;
    }

    // Smart Product / Service Interest Fallback:
    let callerInterest = customData?.service_interest;
    if (
      !callerInterest ||
      typeof callerInterest !== 'string' ||
      callerInterest.trim() === '' ||
      callerInterest === 'General Consultation & Catalog Order'
    ) {
      const productMatches = customVars.filter(
        (val) =>
          typeof val === 'string' &&
          isProductString(val) &&
          val !== callerCompany &&
          !isPriceString(val),
      );
      if (productMatches.length > 0) {
        // Pick the most detailed product description captured
        callerInterest = productMatches
          .sort((a, b) => (b?.length || 0) - (a?.length || 0))[0]
          ?.trim();
      }
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
      callerName: callerName || 'Not specified in audio',
      callerEmail: callerEmail || 'Not provided',
      callerPhone:
        payload.call?.from_number ||
        payload.call?.to_number ||
        'Web / App Audio',
      callerCompany: callerCompany || null,
      callerInterest: callerInterest || 'General Consultation & Catalog Order',
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

    // Pair custom variables with configured question titles or intelligently auto-label them
    const pairedQuestions: { question: string; answer: string }[] = [];
    const usedLabels = new Set<string>();

    customVars.forEach((val, i) => {
      if (val && typeof val === 'string' && val.trim() !== '') {
        const cleanVal = val.trim();
        let questionText =
          configuredQuestions[i] && configuredQuestions[i].trim() !== ''
            ? configuredQuestions[i].trim()
            : null;

        // Semantic Auto-Labeling for extracted insights when custom question title is empty
        if (!questionText) {
          if (isEmailString(cleanVal)) {
            questionText = '✉️ Customer Email Address';
          } else if (isPriceString(cleanVal)) {
            questionText = '💰 Quoted Price / Estimate';
          } else if (isCompanyString(cleanVal)) {
            questionText = '🏢 Company / Business Name';
          } else if (isProductString(cleanVal)) {
            questionText = usedLabels.has('🎯 Requested Product / Service')
              ? '📦 Catalog Option Selected'
              : '🎯 Requested Product / Service';
          } else if (isPlausibleHumanName(cleanVal)) {
            questionText = '👤 Customer Name Mentioned';
          } else {
            questionText = `📌 Extracted Detail #${i + 1}`;
          }
        }
        usedLabels.add(questionText);
        pairedQuestions.push({ question: questionText, answer: cleanVal });
      }
    });

    let textQuestionsSection = '';
    if (pairedQuestions.length > 0) {
      textQuestionsSection = `\nCustomer Q&A & Extracted Insights:\n${pairedQuestions
        .map((qa, i) => `  ${i + 1}. ${qa.question}: ${qa.answer}`)
        .join('\n')}\n`;
    }

    let htmlQuestionsSection = '';
    if (pairedQuestions.length > 0) {
      htmlQuestionsSection = `
      <div style="margin-top: 36px;">
        <div style="font-size: 13px; font-weight: 700; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">📊 Extracted AI Insights &amp; Q&amp;A Grid</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px 18px; border-bottom: 1px solid #cbd5e1; text-align: left; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.6px; width: 45%;">Extracted Parameter</th>
              <th style="padding: 12px 18px; border-bottom: 1px solid #cbd5e1; text-align: left; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.6px;">Customer Response / Value</th>
            </tr>
          </thead>
          <tbody>
            ${pairedQuestions
              .map(
                (qa, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 14px 18px; border-bottom: ${
                  i === pairedQuestions.length - 1
                    ? 'none'
                    : '1px solid #e2e8f0'
                }; font-weight: 600; color: #1e293b; font-size: 14px; vertical-align: middle;">
                  ${qa.question}
                </td>
                <td style="padding: 14px 18px; border-bottom: ${
                  i === pairedQuestions.length - 1
                    ? 'none'
                    : '1px solid #e2e8f0'
                }; vertical-align: middle;">
                  <span style="background-color: #eff6ff; color: #1e40af; padding: 5px 12px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; border: 1px solid #bfdbfe; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);">
                    ${qa.answer}
                  </span>
                </td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>`;
    }

    const callerIdentifier =
      callerInfo.callerEmail !== 'Not provided'
        ? callerInfo.callerEmail
        : callerInfo.callerName !== 'Not specified in audio'
          ? callerInfo.callerName
          : callerInfo.callerPhone;

    const emailSubject = `📞 Call Insight from ${callerIdentifier} | ${businessName} Concierge`;

    const isPositive = callerInfo.callerSentiment
      ?.toLowerCase()
      .includes('positive');
    const isNegative = callerInfo.callerSentiment
      ?.toLowerCase()
      .includes('negative');
    const sentimentColor = isPositive
      ? '#059669'
      : isNegative
        ? '#dc2626'
        : '#475569';
    const sentimentBg = isPositive
      ? '#ecfdf5'
      : isNegative
        ? '#fef2f2'
        : '#f1f5f9';
    const sentimentBorder = isPositive
      ? '#a7f3d0'
      : isNegative
        ? '#fca5a5'
        : '#cbd5e1';
    const sentimentIcon = isPositive ? '😊 ' : isNegative ? '😟 ' : '😐 ';

    const isSuccess = callerInfo.callStatus === 'Successful';
    const outcomeColor = isSuccess ? '#059669' : '#d97706';
    const outcomeBg = isSuccess ? '#ecfdf5' : '#fffbeb';
    const outcomeBorder = isSuccess ? '#a7f3d0' : '#fde68a';
    const outcomeIcon = isSuccess ? '✨ ' : '⏳ ';

    const recordingCta = callerInfo.recordingUrl
      ? `
      <div style="margin-top: 36px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 30px 20px; text-align: center; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.02);">
        <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">🎙️ Complete Call Audio Recording</div>
        <div style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Listen to lossless interactive telephony streaming directly from our secure vault.</div>
        <a href="${callerInfo.recordingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; padding: 15px 34px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.35), 0 4px 6px -2px rgba(79, 70, 229, 0.2); letter-spacing: 0.3px; border: 1px solid rgba(255,255,255,0.1);">▶ Open &amp; Play Full Recording</a>
      </div>`
      : '';

    const textContent = `Hi ${businessName},

A new voice consultation has just been completed. Here is the executive summary and extracted insights from the conversation:

👤 Caller Information:
  • Name: ${callerInfo.callerName}
  • Email: ${callerInfo.callerEmail}${callerInfo.callerCompany ? `\n  • Company: ${callerInfo.callerCompany}` : ''}
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
<body style="margin: 0; padding: 25px 15px; background-color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 660px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #cbd5e1;">
    <!-- Modern AI Dark Accent Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #0b0f19 0%, #1e1b4b 55%, #312e81 100%); padding: 36px 40px; color: #ffffff;">
        <div>
          <span style="display: inline-block; background-color: rgba(165, 180, 252, 0.15); border: 1px solid rgba(165, 180, 252, 0.35); color: #c7d2fe; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.8px; margin-bottom: 14px;">✨ INTELLIGENT VOICE ANALYTICS</span>
        </div>
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Executive Call Synthesis</h1>
        <p style="margin: 8px 0 0 0; font-size: 15px; color: #cbd5e1; font-weight: 400;">Real-time consultation assessment for <strong style="color: #ffffff;">${businessName}</strong></p>
      </td>
    </tr>

    <!-- KPI Metrics Dashboard Bar -->
    <tr>
      <td style="background-color: #f8fafc; padding: 20px 40px; border-bottom: 1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="text-align: left; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Call Outcome</div>
              <span style="display: inline-block; background-color: ${outcomeBg}; color: ${outcomeColor}; border: 1px solid ${outcomeBorder}; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px;">${outcomeIcon}${callerInfo.callStatus}</span>
            </td>
            <td width="34%" style="text-align: center; vertical-align: middle; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; padding: 0 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Caller Sentiment</div>
              <span style="display: inline-block; background-color: ${sentimentBg}; color: ${sentimentColor}; border: 1px solid ${sentimentBorder}; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px;">${sentimentIcon}${callerInfo.callerSentiment}</span>
            </td>
            ${
              callerInfo.durationSeconds
                ? `<td width="33%" style="text-align: right; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Audio Duration</div>
              <span style="display: inline-block; background-color: #eff6ff; color: #1e3a8a; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px;">⏱️ ${Math.floor(
                callerInfo.durationSeconds / 60,
              )}m ${callerInfo.durationSeconds % 60}s</span>
            </td>`
                : ''
            }
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Body Content -->
    <tr>
      <td style="padding: 40px;">
        <!-- CRM Caller Intelligence Profile Card -->
        <div style="font-size: 13px; font-weight: 700; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">👤 CRM Intelligence Profile</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; background: #fafafa; margin-bottom: 36px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);">
          <tr>
            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; width: 35%; font-size: 13px; color: #64748b; font-weight: 600;">Customer Name</td>
            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 700; color: #0f172a;">${callerInfo.callerName}</td>
          </tr>
          <tr>
            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Email Address</td>
            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 600; color: #2563eb;">
              ${
                callerInfo.callerEmail !== 'Not provided'
                  ? `<a href="mailto:${callerInfo.callerEmail}" style="color: #2563eb; text-decoration: underline;">${callerInfo.callerEmail}</a>`
                  : '<span style="color: #94a3b8; font-weight: 400; font-style: italic;">Not captured in audio</span>'
              }
            </td>
          </tr>
          ${
            callerInfo.callerCompany
              ? `<tr>
            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Company / Business</td>
            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px;">
              <span style="background-color: #f5f3ff; color: #5b21b6; border: 1px solid #ddd6fe; padding: 4px 10px; border-radius: 6px; font-weight: 700; display: inline-block;">🏢 ${callerInfo.callerCompany}</span>
            </td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Phone Number</td>
            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 600; color: #334155;">📱 ${callerInfo.callerPhone}</td>
          </tr>
          <tr>
            <td style="padding: 14px 20px; font-size: 13px; color: #64748b; font-weight: 600;">Product Interest</td>
            <td style="padding: 14px 20px; font-size: 15px;">
              <span style="background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; font-weight: 700; display: inline-block;">🎯 ${callerInfo.callerInterest}</span>
            </td>
          </tr>
        </table>

        <!-- AI Executive Briefing (Call Summary) -->
        <div style="font-size: 13px; font-weight: 700; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">🧠 AI Conversation Synthesis</div>
        <div style="padding: 24px; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #6366f1; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; color: #1e293b; line-height: 1.7; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);">
          <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Executive Briefing</div>
          ${callerInfo.callSummary}
        </div>

        <!-- Q&A Section -->
        ${htmlQuestionsSection}

        <!-- Call Action Recording -->
        ${recordingCta}
      </td>
    </tr>

    <!-- Ultra-Modern Dark Slate Footer -->
    <tr>
      <td style="background-color: #0b0f19; padding: 28px 40px; text-align: center;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #f8fafc; letter-spacing: 0.3px;">VoicePeri AI Concierge Platform</p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">Automated Post-Call Intelligence &amp; Telephony Analytics</p>
        <p style="margin: 16px 0 0 0; font-size: 11px; color: #475569; border-top: 1px solid #1e293b; padding-top: 16px;">This executive summary was generated instantly upon conversation completion for <strong style="color: #94a3b8;">${businessName}</strong>.</p>
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
