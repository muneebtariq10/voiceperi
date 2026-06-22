import { Injectable } from '@nestjs/common';
import { AgentsService } from '../agents/agents.service';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent'; // adjust the path
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { BusinessInformation } from 'src/entities/business_information';
import { Console } from 'console';
@Injectable()
export class RetelWebhookService {
  constructor(
    private mailerService: MailerService,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(BusinessInformation)
    private readonly businessRepository: Repository<BusinessInformation>,
  ) {}
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
    const call = payload?.call?.call_analysis;
    // const {
    //   custom_var_2,
    //   custom_var_3,
    //   custom_var_4,
    //   custom_var_5,
    // } = call?.custom_analysis_data;
    const agentId = payload.call.agent_id;
    // const transcript = payload.call.transcript;
    const custom_var_1 = call?.custom_analysis_data?.custom_var_1;
    const custom_var_2 = call?.custom_analysis_data?.custom_var_2;
    const custom_var_3 = call?.custom_analysis_data?.custom_var_3;
    const custom_var_4 = call?.custom_analysis_data?.custom_var_4;
    const custom_var_5 = call?.custom_analysis_data?.custom_var_5;
    console.log('entered into call analyzed');
    console.log(
      custom_var_1,
      custom_var_2,
      custom_var_3,
      custom_var_4,
      custom_var_5,
      'here are custom questios',
    );
    const callerInfo = {
      callerName: call?.custom_analysis_data?.user_name,
      callerEmail: call?.custom_analysis_data?.user_email_address,
      callerInterest: call?.custom_analysis_data?.service_interest,
      callSummary: call?.call_summary,
      callerSentiment: call?.user_sentiment,
      callStatus: call.call_successful,
    };

    const agent = await this.getAgentByRetelId(agentId);
    let businessName;
    if (agent) {
      const business = await this.getBusinessByUserId(agent?.user?.id);
      businessName = business?.name;
    }

    const agentEmails = agent?.emails || [];

    // const userEmails =
    //   typeof agent?.user?.email === 'string'
    //     ? agent?.user.email.split(',').map((email) => email.trim())
    //     : [];
    // , ...userEmails
    const allEmails = [...agentEmails];

    if (!agent) {
      console.log('agent id not found');
    }
    if (!agent) return;
    // Caller Number: {{caller_number}}  Name: ${callerInfo.callerName || 'Name is not provided'} Service Interest: ${callerInfo.callerInterest || 'interest is not recorded'}

    const questionVars = [
      custom_var_1,
      custom_var_2,
      custom_var_3,
      custom_var_4,
      custom_var_5,
    ].filter((q) => q && q.trim() !== '');

    let questionsSection = '';

    if (questionVars.length > 0) {
      questionsSection = `Questions:\n${questionVars
        .map((q, i) => `  ${i + 1}. ${q.trim()}`)
        .join('\n')}\n`;
    }

    const emailContent = `Hi ${businessName},
    
    A new call has just been completed. Here’s the full summary and extracted insights from the conversation:
    
    Caller Information:
    - Email: ${callerInfo.callerEmail || 'Email is not provided'}
    - Call Outcome: ${callerInfo.callStatus}
    - User Sentiment: ${callerInfo.callerSentiment}
    
    Call Summary:
    ${callerInfo.callSummary || 'Call summary is not provided'}
    
    ${questionsSection}
    
    Your voice ai assistant,
    VoicePeri.
    `;

    //   let questionsSection = '';

    //   // Check if any custom vars are defined
    //   if (
    //     custom_var_1 ||
    //     custom_var_2 ||
    //     custom_var_3 ||
    //     custom_var_4 ||
    //     custom_var_5
    //   ) {
    //     questionsSection = `
    //         Questions:
    //         ${custom_var_1 || ''}
    //         ${custom_var_2 || ''}
    //         ${custom_var_3 || ''}
    //         ${custom_var_4 || ''}
    //         ${custom_var_5 || ''}
    // `;
    //   }
    //   const emailContent = `
    //     Hi ${businessName},

    //     A new call has just been completed. Here’s the full summary and extracted insights from the conversation:

    //         Caller Information:

    //             Email: ${callerInfo.callerEmail || 'Email is not provided'}
    //             Call Outcome: ${callerInfo.callStatus}
    //             User Sentiment: ${callerInfo.callerSentiment}

    //         Call Summary: ${callerInfo.callSummary || 'Call summary is not provided'}

    //         ${questionsSection}

    //         Your voice ai assistant,
    //         VoicePeri.

    //   `;
    // Collected Data:
    // ${transcript}
    await this.mailerService.sendMail({
      to: 'ahmedali.nexvistech@gmail.com', // Convert string to array and trim spaces
      subject: `Call summary from 
      ${callerInfo.callerEmail}`,
      text: `${emailContent}\n\nFull Payload:\n${JSON.stringify(payload, null, 2)}`,
    });
    await Promise.all(
      allEmails.map((email) =>
        this.mailerService.sendMail({
          to: email,
          subject: `Call summary from ${callerInfo.callerEmail}`,
          text: `${emailContent}`,
        }),
      ),
    );
  }
}
