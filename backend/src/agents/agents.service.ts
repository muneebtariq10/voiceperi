import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map, Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from 'src/entities/language';
import { Agent } from 'src/entities/agent';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from 'src/users/users.service';
import * as fs from 'fs';
import * as path from 'path';
import { BusinessInformation } from 'src/entities/business_information';
import axios from 'axios';
import { Buffer } from 'buffer';
import { BusinessinfosService } from 'src/businessinfos/businessinfos.service';
import { readFile } from 'fs/promises';

export interface PlaceDetailsResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: any;
  international_phone_number?: string;
  opening_hours?: any;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: any[];
  types?: string[];
  photos?: any[];
  business_status?: string;
  [key: string]: any;
}
@Injectable()
export class AgentsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Agent) private agentRepo: Repository<Agent>,
    @InjectRepository(Language) private languageRepo: Repository<Language>,
    @InjectRepository(BusinessInformation)
    private businessInfoRepo: Repository<BusinessInformation>,
    private readonly businessInfosService: BusinessinfosService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
  ) {}

  async onApplicationBootstrap() {
    console.log('Checking languages table for initial seed...');
    const languageCount = await this.languageRepo.count();
    if (languageCount === 0) {
      console.log('Languages table is empty. Seeding data...');
      const languagesToSeed = [
        {
          code: 'en',
          name: 'English',
          locale: 'en-US',
          direction: 'ltr' as const,
          status: true,
        },
        {
          code: 'es',
          name: 'Spanish',
          locale: 'es-ES',
          direction: 'ltr' as const,
          status: true,
        },
      ];
      for (const lang of languagesToSeed) {
        const newLang = this.languageRepo.create(lang);
        await this.languageRepo.save(newLang);
      }
      console.log('Language seeding complete.');
    } else {
      console.log(`Languages table already contains ${languageCount} entries.`);
    }
  }

  // private async createRetellAgent(
  //   createAgentDto: CreateAgentDto,
  //   language: Language,
  // ): Promise<any> {
  //   try {
  //     const businessInfo = await this.businessInfoRepo.findOne({
  //       where: { user_id: { id: createAgentDto.user_id } },
  //     });

  //     const languageCode = language?.code || 'en';
  //     const promptKey = `prompt_${languageCode}`;

  //     let generalPrompt = this.promptData[promptKey];
  //     const prompt = generalPrompt
  //       .replace(/{{agent_name}}/g, createAgentDto?.agent_name)
  //       .replace(/{{service_type}}/g, businessInfo?.services)
  //       .replace(/{{business_name}}/g, businessInfo?.name)
  //       .replace(/{{services}}/g, businessInfo?.services)
  //       .replace(/{{business_address}}/g, businessInfo?.address)
  //       .replace(/{{business_hours}}/g, businessInfo?.business_hours);

  //     const llmResponse = await firstValueFrom(
  //       this.httpService.post(
  //         `${process.env.RETELL_AI_API_URL}create-retell-llm`,
  //         {
  //           model: 'gpt-4o-mini',
  //           general_prompt: prompt || '',
  //           general_tools: [
  //             {
  //               type: 'end_call',
  //               name: 'end_call',
  //               description: 'End the call with user.',
  //             },
  //           ],
  //         },
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
  //           },
  //         },
  //       ),
  //     );
  //     const llm_id = llmResponse.data.llm_id;

  //     // 3. Create Agent using the LLM ID
  //     const payload = {
  //       agent_name: createAgentDto.agent_name,
  //       voice_id: createAgentDto.voice_id,
  //       response_engine: {
  //         type: 'retell-llm',
  //         llm_id: llm_id,
  //       },
  //       language: language.locale,
  //       post_call_analysis_model: 'gpt-4o-mini',
  //       post_call_analysis_data: [
  //         {
  //           type: 'string',
  //           name: 'user_name',
  //           description: 'The name of the customer.',
  //         },
  //         {
  //           type: 'string',
  //           name: 'user_email_address',
  //           description: 'The email address of the customer.',
  //         },
  //         {
  //           type: 'string',
  //           name: 'service_interest',
  //           description: 'The services customer showed interest in.',
  //         },
  //         {
  //           type: 'string',
  //           name: 'custom_var_1',
  //           description: 'Answer 1 given by customer.',
  //         },
  //         {
  //           type: 'string',
  //           name: 'custom_var_2',
  //           description: 'Answer 2 given by customer.',
  //         },
  //         {
  //           type: 'string',
  //           name: 'custom_var_3',
  //           description: 'Answer 3 given by customer.',
  //         },
  //         {
  //           type: 'string',
  //           name: 'custom_var_4',
  //           description: 'Answer 4 given by customer.',
  //         },
  //         {
  //           type: 'string',
  //           name: 'custom_var_5',
  //           description: 'Answer 5 given by customer.',
  //         },
  //       ],
  //       webhook_url: 'https://dev.voiceperi.com/api/retell-webhook',
  //     };

  //     const agentResponse = await firstValueFrom(
  //       this.httpService.post(
  //         `${process.env.RETELL_AI_API_URL}create-agent`,
  //         payload,
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
  //           },
  //         },
  //       ),
  //     );

  //     return agentResponse.data;
  //   } catch (error) {
  //     console.error(
  //       'Error during agent creation process:',
  //       error?.response?.data || error.message,
  //     );
  //     throw new Error('Failed to create agent with Retell AI');
  //   }
  // }
  //
  // private async generatePromptFromTextFile(
  //   lang: string,
  //   variables: Record<string, string>,
  // ): Promise<string> {
  //   const filePath = path.join(process.cwd(), 'src/agents', `prompt.txt`);
  //   const fullText = await readFile(filePath, 'utf8');

  //   // Extract language-specific section
  //   const regex = new RegExp(`\\[\\[${lang}\\]\\]([\\s\\S]*?)(?=\\[\\[|$)`);
  //   const match = fullText.match(regex);

  //   if (!match) {
  //     throw new Error(`Prompt for language [[${lang}]] not found`);
  //   }

  //   let promptTemplate = match[1].trim();

  //   // Replace all variables
  //   for (const key in variables) {
  //     const value = variables[key] ?? '';
  //     const regex = new RegExp(`{{${key}}}`, 'g');
  //     promptTemplate = promptTemplate.replace(regex, value);
  //   }

  //   return promptTemplate;
  // }
  private async generatePromptFromTextFile(
    lang: string,
    variables: Record<string, string>,
  ): Promise<string> {
    const filePath = path.join(process.cwd(), 'templates', `prompt.txt`);
    const fullText = await readFile(filePath, 'utf8');

    const regex = new RegExp(`\\[\\[${lang}\\]\\]([\\s\\S]*?)(?=\\[\\[|$)`);
    const match = fullText.match(regex);

    if (!match) {
      throw new Error(`Prompt for language [[${lang}]] not found`);
    }

    let promptTemplate = match[1].trim();

    // Handle conditional blocks
    const conditionalSections = [
      {
        start: '{{has_questions}}',
        end: '{{end_has_questions}}',
        key: 'question_section',
      },
      {
        start: '{{has_begin_message}}',
        end: '{{end_has_begin_message}}',
        key: 'begin_message',
      },
      {
        start: '{{has_services}}',
        end: '{{end_has_services}}',
        key: 'services',
      },
      {
        start: '{{has_post_call_fields}}',
        end: '{{end_has_post_call_fields}}',
        key: 'post_call_fields',
      },
      {
        start: '{{has_business_phone_number}}',
        end: '{{end_has_business_phone_number}}',
        key: 'business_phone_number',
      },
    ];

    for (const section of conditionalSections) {
      const sectionRegex = new RegExp(
        `${section.start}([\\s\\S]*?)${section.end}`,
        'g',
      );

      if (!variables[section.key] || variables[section.key].trim() === '') {
        // Remove entire block if value is missing or empty
        promptTemplate = promptTemplate.replace(sectionRegex, '');
      } else {
        // Keep the block and just remove the tags
        promptTemplate = promptTemplate
          .replace(section.start, '')
          .replace(section.end, '');
      }
    }

    // Replace all {{variables}} normally
    for (const key in variables) {
      const value = variables[key] ?? '';
      const variableRegex = new RegExp(`{{${key}}}`, 'g');
      promptTemplate = promptTemplate.replace(variableRegex, value);
    }

    return promptTemplate;
  }

  // private buildPromptVariables(
  //   agent: Agent | CreateAgentDto,
  //   businessInfo: BusinessInformation,
  //   notes?: string[],
  // ): Record<string, string> {
  //   const formattedServices = (businessInfo?.services || [])
  //     .map((s) => s.replace(/_/g, ' ').trim())
  //     .filter(Boolean);

  //   const businessHours = Array.isArray(businessInfo?.business_hours)
  //     ? businessInfo.business_hours.join(', ')
  //     : businessInfo?.business_hours || '';

  //   const questions = (notes || []).filter((q) => q && q.trim() !== '');

  //   const questionSection = questions.length
  //     ? questions
  //         .map(
  //           (q, i) =>
  //             `- Politely ask question ${i + 1}: ${q}, if incomplete or unclear, ask again.`,
  //         )
  //         .join('\n') +
  //       '\n\n' +
  //       questions
  //         .map(
  //           (_, i) =>
  //             `- \`custom_var_${i + 1}\`: Captured response of question ${i + 1}`,
  //         )
  //         .join('\n')
  //     : '';

  //   const vars: Record<string, string> = {
  //     agent_name: (agent as Agent)?.agent_name || '',
  //     business_name: businessInfo?.name || '',
  //     business_address: businessInfo?.address || '',
  //     business_hours: businessHours,
  //     begin_message:
  //       (agent as Agent)?.message !== 'null'
  //         ? (agent as Agent)?.message || ''
  //         : '',
  //     question_section: questionSection,
  //   };

  //   formattedServices.forEach((service, index) => {
  //     vars[`service_${index + 1}`] = service;
  //   });

  //   for (let i = formattedServices.length + 1; i <= 5; i++) {
  //     vars[`service_${i}`] = '';
  //   }

  //   questions.slice(0, 5).forEach((note, index) => {
  //     vars[`question_${index + 1}`] = note;
  //   });

  //   return vars;
  // }
  private buildPromptVariables(
    agent: Agent | CreateAgentDto,
    businessInfo: BusinessInformation,
    notes?: string[],
  ): Record<string, string> {
    const formattedServices = (businessInfo?.services || [])
      .map((s) => s.replace(/_/g, ' ').trim())
      .filter(Boolean);

    const businessHours = Array.isArray(businessInfo?.business_hours)
      ? businessInfo.business_hours.join(', ')
      : businessInfo?.business_hours || '';

    const questions = (notes || []).filter((q) => q && q.trim() !== '');

    const questionSection = questions.length
      ? questions
          .map(
            (q, i) =>
              `- Politely ask question ${i + 1}: ${q}, if incomplete or unclear, ask again.`,
          )
          .join('\n') + '\n\n'
      : '';

    const postCallFields = questions.length
      ? questions
          .map(
            (_, i) =>
              `- \`custom_var_${i + 1}\`: Captured response of question ${i + 1}`,
          )
          .join('\n')
      : '';

    const vars: Record<string, string> = {
      agent_name: (agent as Agent)?.agent_name || '',
      business_name: businessInfo?.name || '',
      business_address: businessInfo?.address || '',
      business_phone_number: businessInfo?.phone || '',
      business_hours: businessHours,
      begin_message:
        (agent as Agent)?.message !== 'null'
          ? (agent as Agent)?.message || ''
          : '',
      services: formattedServices.length
        ? formattedServices.length === 1
          ? formattedServices[0]
          : formattedServices.slice(0, -1).join(', ') +
            ' and ' +
            formattedServices.slice(-1)
        : '',

      question_section: questionSection,
      post_call_fields: postCallFields,
    };

    return vars;
  }

  private async createRetellAgent(
    createAgentDto: CreateAgentDto,
    language: Language,
  ): Promise<any> {
    const businessInfo = await this.businessInfoRepo.findOne({
      where: { user_id: { id: createAgentDto.user_id } },
    });

    if (!businessInfo) {
      throw new NotFoundException(
        `Business information not found for user ID ${createAgentDto.user_id}`,
      );
    }

    const variables = this.buildPromptVariables(createAgentDto, businessInfo);

    const prompt = await this.generatePromptFromTextFile(
      language.code,
      variables,
    );

    const user = await this.usersService.findOneById(
      createAgentDto.user_id.toString(),
    );
    const tools: any[] = [
      {
        type: 'end_call',
        name: 'end_call',
        description: 'End the call with the user.',
      },
      {
        type: 'custom',
        name: 'lookup_order',
        description: 'Look up the status of an order using the order ID and the last 4 digits of the customer\'s phone number.',
        url: process.env.RETELL_WEBHOOK_URL ? process.env.RETELL_WEBHOOK_URL.replace('/retell-webhook', '/orders/lookup') : 'https://dev.voiceperi.com/api/orders/lookup',
        method: 'post',
        headers: {
           Authorization: `Bearer ${process.env.ORDER_LOOKUP_INTEGRATION_TOKEN || 'your-secret-token'}`
        },
        parameters: {
          type: 'object',
          properties: {
            orderId: { type: 'number', description: 'The order ID' },
            phoneLast4: { type: 'string', description: 'The last 4 digits of the phone number' }
          },
          required: ['orderId', 'phoneLast4']
        }
      }
    ];

    if (
      createAgentDto.phone_numbers &&
      createAgentDto.phone_numbers.length > 0
    ) {
      tools.push({
        type: 'transfer_call',
        name: 'transfer_call',
        description: 'Transfer the call to a human agent.',
        transfer_destination: {
          type: 'predefined',
          number: createAgentDto.phone_numbers[0],
          ignore_e164_validation: true,
        },
        transfer_option: {
          type: 'cold_transfer',
        },
      });
    } else if (businessInfo.phone) {
      tools.push({
        type: 'transfer_call',
        name: 'transfer_call',
        description: 'Transfer the call to a human agent.',
        transfer_destination: {
          type: 'predefined',
          number: businessInfo.phone,
          ignore_e164_validation: true,
        },
        transfer_option: {
          type: 'cold_transfer',
        },
      });
    }

    if (user && user.cal_key && user.event_id) {
      tools.push({
        type: 'book_appointment_cal',
        name: 'book_appointment',
        description: 'Book an appointment for the user',
        cal_api_key: user.cal_key,
        event_type_id: parseInt(user.event_id, 10),
        timezone: businessInfo.timezone || 'America/New_York',
      });
    }

    const llmResponse = await firstValueFrom(
      this.httpService.post(
        `${process.env.RETELL_AI_API_URL}create-retell-llm`,
        {
          model: 'gpt-4o-mini',
          general_prompt: prompt,
          general_tools: tools,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
          },
        },
      ),
    );

    const llm_id = llmResponse.data.llm_id;

    const payload = {
      agent_name: createAgentDto.agent_name,
      voice_id: createAgentDto.voice_id,
      response_engine: {
        type: 'retell-llm',
        llm_id,
      },
      language: language.locale,
      post_call_analysis_model: 'gpt-4o-mini',
      post_call_analysis_data: Array.from({ length: 5 }).map((_, i) => ({
        type: 'string',
        name: `custom_var_${i + 1}`,
        description: `Answer ${i + 1} given by customer.`,
      })),
      webhook_url: process.env.RETELL_WEBHOOK_URL,
    };

    const agentResponse = await firstValueFrom(
      this.httpService.post(
        `${process.env.RETELL_AI_API_URL}create-agent`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
          },
        },
      ),
    );

    return agentResponse.data;
  }

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    const language = await this.languageRepo.findOne({
      where: { id: createAgentDto.language_id },
    });

    if (!language) {
      throw new NotFoundException(
        `Language with ID ${createAgentDto.language_id} not found`,
      );
    }
    const id = createAgentDto.user_id;

    const user = await this.usersService.findById(id);
    // const user = await this.usersService.findOne({ where: {id: id} });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createAgentDto.user_id} not found`,
      );
    }

    const retellResponse = await this.createRetellAgent(
      createAgentDto,
      language,
    );

    const agent = this.agentRepo.create({
      id: uuidv4(),
      agent_name: createAgentDto.agent_name,
      voice_id: createAgentDto.voice_id,
      google_business_url: createAgentDto.google_business_url,
      ai_number: createAgentDto.ai_number,
      phone_numbers: createAgentDto.phone_numbers,
      language,
      retell_agent: retellResponse?.agent_id,
      llm_id: retellResponse?.response_engine?.llm_id,
      user,
    });

    return await this.agentRepo.save(agent);
  }

  // async updateLlm(user_id: string): Promise<any> {
  //   try {
  //     const businessInfo = await this.businessInfoRepo.findOne({
  //       where: { user_id: { id: user_id } },
  //     });
  //     const agentInfo = await this.agentRepo.findOne({
  //       where: { user: { id: user_id } },
  //       relations: ['language', 'user'],
  //     });

  //     const languageCode = agentInfo?.language?.code || 'en';
  //     const promptKey = `prompt_${languageCode}`;
  //     let generalPrompt = this.promptData[promptKey];

  //     if (!generalPrompt) {
  //       throw new Error(`Prompt not found for language code: ${languageCode}`);
  //     }

  //     let prompt = generalPrompt
  //       .replace(/{{agent_name}}/g, agentInfo?.agent_name)
  //       .replace(/{{service_type}}/g, businessInfo?.services)
  //       .replace(/{{business_name}}/g, businessInfo?.name)
  //       .replace(/{{services}}/g, businessInfo?.services)
  //       .replace(/{{business_address}}/g, businessInfo?.address)
  //       .replace(/{{business_hours}}/g, businessInfo?.business_hours);
  //     const notes = agentInfo?.notes || [];

  //     notes.slice(0, 5).forEach((note, index) => {
  //       const key = `{{question_${index + 1}}}`;
  //       prompt = prompt.replace(new RegExp(key, 'g'), note);
  //     });

  //     // Remove any unused question placeholders
  //     for (let i = notes.length + 1; i <= 5; i++) {
  //       const key = `{{question_${i}}}`;
  //       prompt = prompt.replace(new RegExp(key, 'g'), '');
  //     }

  //     const agent = await this.agentRepo.findOne({
  //       where: { user: { id: user_id } },
  //       relations: ['language', 'user'],
  //     });

  //     if (!agent || !agent.llm_id) {
  //       throw new Error('Agent or LLM ID not found');
  //     }

  //     const updateResponse = await firstValueFrom(
  //       this.httpService.patch(
  //         `${process.env.RETELL_AI_API_URL}update-retell-llm/${agent.llm_id}`,
  //         {
  //           general_prompt: prompt,
  //         },
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
  //           },
  //         },
  //       ),
  //     );

  //     return updateResponse.data;
  //   } catch (error) {
  //     console.error(
  //       'Error updating LLM:',
  //       error?.response?.data || error.message,
  //     );
  //     throw new Error('Failed to update LLM');
  //   }
  // }
  // async updateLlm(user_id: string): Promise<any> {
  //   try {
  //     const businessInfo = await this.businessInfoRepo.findOne({
  //       where: { user_id: { id: user_id } },
  //     });
  //     const agentInfo = await this.agentRepo.findOne({
  //       where: { user: { id: user_id } },
  //       relations: ['language', 'user'],
  //     });

  //     const languageCode = agentInfo?.language?.code || 'en';
  //     const promptKey = `prompt_${languageCode}`;
  //     let generalPrompt = this.promptData[promptKey];

  //     if (!generalPrompt) {
  //       throw new Error(`Prompt not found for language code: ${languageCode}`);
  //     }

  //     let prompt = generalPrompt;

  //     prompt = prompt.replace(/{{agent_name}}/g, agentInfo?.agent_name || '');

  //     if (agentInfo?.message == null || agentInfo?.message == 'null') {
  //       prompt = prompt.replace(/{{begin_message}}/g, ' ');
  //     } else {
  //       let welcomeMsg = `Welcome Message \n ${agentInfo?.message}.`;
  //       prompt = prompt.replace(/{{begin_message}}/g, welcomeMsg);
  //     }
  //     prompt = prompt.replace(/{{begin_message}}/g, '');

  //     const formattedServices = (businessInfo?.services || [])
  //       .map((service) => service.replace(/_/g, ' '))
  //       .join(', ');

  //     prompt = prompt.replace(/{{service_type}}/g, formattedServices);
  //     prompt = prompt.replace(/{{services}}/g, formattedServices);
  //     prompt = prompt.replace(/{{business_name}}/g, businessInfo?.name || '');
  //     prompt = prompt.replace(
  //       /{{business_address}}/g,
  //       businessInfo?.address || '',
  //     );
  //     prompt = prompt.replace(
  //       /{{business_hours}}/g,
  //       businessInfo?.business_hours || '',
  //     );

  //     const notes = agentInfo?.notes || [];
  //     let questionsBlock = '';

  //     notes.slice(0, 5).forEach((note, index) => {
  //       questionsBlock += `- Politely ask question ${index + 1}: ${note}, if incomplete or unclear, ask again.\n
  //       Captured reponse of question ${index + 1} in  custom_var_${index + 1}\n`;
  //     });
  //     if (questionsBlock) {
  //       questionsBlock += 'Save the following fields for Post Call Analysis:';
  //       notes.slice(0, 5).forEach((note, index) => {
  //         questionsBlock += `\n custom_var_${index + 1} `;
  //       });
  //     }
  //     prompt = prompt.replace('{{question_section}}', questionsBlock);

  //     if (notes.length === 0) {
  //       prompt = prompt.replace('{{question_section}}', '');
  //     }

  //     const agent = await this.agentRepo.findOne({
  //       where: { user: { id: user_id } },
  //       relations: ['language', 'user'],
  //     });

  //     if (!agent || !agent.llm_id) {
  //       throw new Error('Agent or LLM ID not found');
  //     }

  //     const updateResponse = await firstValueFrom(
  //       this.httpService.patch(
  //         `${process.env.RETELL_AI_API_URL}update-retell-llm/${agent.llm_id}`,
  //         {
  //           general_prompt: prompt,
  //         },
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
  //           },
  //         },
  //       ),
  //     );

  //     return updateResponse.data;
  //   } catch (error) {
  //     console.error(
  //       'Error updating LLM:',
  //       error?.response?.data || error.message,
  //     );
  //     throw new Error('Failed to update LLM');
  //   }
  // }

  async updateLlm(user_id: string): Promise<any> {
    // 🧠 Step 1: Load Agent
    const agent = await this.agentRepo.findOne({
      where: { user: { id: user_id } },
      relations: ['language', 'user'],
    });

    if (!agent || !agent.llm_id) {
      throw new Error('Agent or LLM ID not found');
    }

    console.log('👤 Agent loaded:', {
      agent_name: agent.agent_name,
      language: agent.language?.code,
      notes: agent.notes,
    });

    // 🏢 Step 2: Load Business Info
    const businessInfo = await this.businessInfoRepo.findOne({
      where: { user_id: { id: user_id } },
    });

    if (!businessInfo) {
      throw new NotFoundException(
        `Business information not found for user ID ${user_id}`,
      );
    }

    console.log('🏢 Business Info loaded:', {
      name: businessInfo.name,
      address: businessInfo.address,
      hours: businessInfo.business_hours,
      services: businessInfo.services,
    });

    // 🧱 Step 3: Build Variables
    const variables = this.buildPromptVariables(
      agent,
      businessInfo,
      agent.notes || undefined,
    );

    console.log('🧩 Variables for prompt:', variables);

    // 📝 Step 4: Generate Prompt
    const prompt = await this.generatePromptFromTextFile(
      agent.language?.code || 'en',
      variables,
    );

    console.log('📄 Final Prompt Being Sent:\n', prompt);

    const user = await this.usersService.findOne(user_id.toString());
    const tools: any[] = [
      {
        type: 'end_call',
        name: 'end_call',
        description: 'End the call with the user.',
      },
    ];

    if (agent.phone_numbers && agent.phone_numbers.length > 0) {
      tools.push({
        type: 'transfer_call',
        name: 'transfer_call',
        description: 'Transfer the call to a human agent.',
        transfer_destination: {
          type: 'predefined',
          number: agent.phone_numbers[0],
          ignore_e164_validation: true,
        },
        transfer_option: {
          type: 'cold_transfer',
        },
      });
    } else if (businessInfo.phone) {
      tools.push({
        type: 'transfer_call',
        name: 'transfer_call',
        description: 'Transfer the call to a human agent.',
        transfer_destination: {
          type: 'predefined',
          number: businessInfo.phone,
          ignore_e164_validation: true,
        },
        transfer_option: {
          type: 'cold_transfer',
        },
      });
    }

    if (user && user.cal_key && user.event_id) {
      tools.push({
        type: 'book_appointment_cal',
        name: 'book_appointment',
        description: 'Book an appointment for the user',
        cal_api_key: user.cal_key,
        event_type_id: parseInt(user.event_id, 10),
        timezone: businessInfo.timezone || 'America/New_York',
      });
    }

    // 🚀 Step 5: Send PATCH request to update LLM
    const body: Record<string, any> = {
      general_prompt: prompt,
      general_tools: tools,
    };

    if (agent.message) {
      body.begin_message = agent.message;
    }

    const updateRes = await firstValueFrom(
      this.httpService.patch(
        `${process.env.RETELL_AI_API_URL}update-retell-llm/${agent.llm_id}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
          },
        },
      ),
    );

    console.log('✅ Retell update response:', updateRes.data);

    return updateRes.data;
  }

  findAll() {
    return `This action returns all agents`;
  }

  async findOne(userId: string): Promise<any> {
    // Step 1: Find the agent by user_id
    const agent = await this.agentRepo.findOne({
      where: { user: { id: userId } },
      relations: ['language', 'user'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent for user ID ${userId} not found`);
    }
    return agent;
  }

  async update(userId: string, updateAgentDto: UpdateAgentDto): Promise<any> {
    // Step 1: Find the agent using the user_id
    const agent = await this.agentRepo.findOne({
      where: { user: { id: userId } },
      relations: ['language', 'user'],
    });
    if (!agent)
      throw new NotFoundException(`Agent for user ID ${userId} not found`);

    let language = agent.language;

    if (updateAgentDto.language_id) {
      const foundLanguage = await this.languageRepo.findOne({
        where: { id: updateAgentDto.language_id },
      });
      const businessInfo =
        await this.businessInfosService.findOneByUserId(userId);
      const searchQuery = `${businessInfo?.name}, ${businessInfo?.address},`;
      const businessData = await this.businessInfosService.getBusinessInfo(
        searchQuery,
        foundLanguage?.code || 'en',
      );

      await this.businessInfosService.update(
        businessInfo.id,
        {},
        businessData || undefined,
      );
      console.log('📦 Business services:', businessInfo.services);

      if (!foundLanguage)
        throw new NotFoundException(
          `Language with ID ${updateAgentDto.language_id} not found`,
        );

      agent.language = foundLanguage;
      language = foundLanguage;
    }

    const payload: any = {};
    if (updateAgentDto.agent_name)
      payload.agent_name = updateAgentDto.agent_name;
    if (updateAgentDto.voice_id) payload.voice_id = updateAgentDto.voice_id;
    if (language && updateAgentDto.language_id)
      payload.language = language.locale;
    if (updateAgentDto.message) {
      payload.begin_message = updateAgentDto.message;
    }
    // else {
    //   updateAgentDto.message = 'null';
    //   payload.message = 'null';
    // }
    if (updateAgentDto.blocked_numbers)
      payload.blocked_numbers = updateAgentDto.blocked_numbers;
    if (updateAgentDto.emails) payload.emails = updateAgentDto.emails;
    if (updateAgentDto.notes) payload.notes = updateAgentDto.notes;
    if (updateAgentDto.phone_numbers)
      payload.phone_numbers = updateAgentDto.phone_numbers;
    if (updateAgentDto.hangup_if_call_detected !== undefined)
      payload.hangup_if_call_detected = updateAgentDto.hangup_if_call_detected;
    if (updateAgentDto.block_800_number !== undefined)
      payload.block_800_number = updateAgentDto.block_800_number;

    if (process.env.RETELL_WEBHOOK_URL) {
      payload.webhook_url = process.env.RETELL_WEBHOOK_URL;
    }

    payload.post_call_analysis_data = [
      // {
      //   type: 'string',
      //   name: 'user_name',
      //   description: 'The name of the customer.',
      // },
      // {
      //   type: 'string',
      //   name: 'user_email_address',
      //   description: 'The email address of the customer.',
      // },
      // {
      //   type: 'string',
      //   name: 'service_interest',
      //   description: 'The services customer showed interest in.',
      // },
      {
        type: 'string',
        name: 'custom_var_1',
        description: 'Answer 1 given by customer.',
      },
      {
        type: 'string',
        name: 'custom_var_2',
        description: 'Answer 2 given by customer.',
      },
      {
        type: 'string',
        name: 'custom_var_3',
        description: 'Answer 3 given by customer.',
      },
      {
        type: 'string',
        name: 'custom_var_4',
        description: 'Answer 4 given by customer.',
      },
      {
        type: 'string',
        name: 'custom_var_5',
        description: 'Answer 5 given by customer.',
      },
    ];

    // Step 4: Call Retell API to update the agent
    // Prepare the payload for Retell API
    let retellResponse: any;
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${process.env.RETELL_AI_API_URL}update-agent/${agent.retell_agent}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
            },
          },
        ),
      );
      retellResponse = response.data;
    } catch (error) {
      console.error(
        'Error updating agent on Retell:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to update agent on Retell API');
    }

    // Step 5: Update only the fields that were sent in the request
    if (updateAgentDto.agent_name) agent.agent_name = updateAgentDto.agent_name;
    if (updateAgentDto.voice_id) agent.voice_id = updateAgentDto.voice_id;
    if (updateAgentDto.language_id) agent.language = language;
    if (updateAgentDto.message) agent.message = updateAgentDto.message;
    if (updateAgentDto.google_business_url)
      agent.google_business_url = updateAgentDto.google_business_url;
    if (updateAgentDto.ai_number !== undefined)
      agent.ai_number = updateAgentDto.ai_number;
    if (updateAgentDto.blocked_numbers)
      agent.blocked_numbers = updateAgentDto.blocked_numbers;
    if (updateAgentDto.notes) agent.notes = updateAgentDto.notes;
    if (updateAgentDto.emails) agent.emails = updateAgentDto.emails;
    if (updateAgentDto.phone_numbers)
      agent.phone_numbers = updateAgentDto.phone_numbers;
    if (updateAgentDto.hangup_if_call_detected !== undefined)
      agent.hangup_if_call_detected = updateAgentDto.hangup_if_call_detected;
    if (updateAgentDto.block_800_number !== undefined)
      agent.block_800_number = updateAgentDto.block_800_number;

    const savedAgent = await this.agentRepo.save(agent);

    return retellResponse; // ✅ Return the updated response
  }

  remove(id: number) {
    return `This action removes a #${id} agent`;
  }

  async createWebCall(agent_id: string) {
    const agent = await this.agentRepo.findOne({
      where: { id: agent_id },
    });

    if (!agent || !agent.retell_agent) {
      throw new NotFoundException(`Agent not found or has no Retell ID`);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.RETELL_AI_API_URL}v2/create-web-call`,
          { agent_id: agent.retell_agent },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error creating web call:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to create web call token');
    }
  }

  async purchaseNumber(agent_id: string) {
    const agent = await this.agentRepo.findOne({
      where: { id: agent_id },
    });

    if (!agent || !agent.retell_agent) {
      throw new NotFoundException(`Agent not found or has no Retell ID`);
    }

    try {
      // First, fetch the current user's profile to get area code preference if any
      // but for now, we'll let Retell pick a random available number or default to US
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.RETELL_AI_API_URL}create-phone-number`,
          { inbound_agent_id: agent.retell_agent },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
            },
          },
        ),
      );

      const phoneNumber = response.data.phone_number;
      if (phoneNumber) {
        agent.ai_number = phoneNumber;
        await this.agentRepo.save(agent);
        return { success: true, phone_number: phoneNumber };
      }

      throw new Error('Failed to parse phone number from response');
    } catch (error) {
      console.error(
        'Error purchasing phone number:',
        error?.response?.data || error.message,
      );
      
      const errorMessage = error?.response?.data?.message || '';
      throw new Error(
        `Failed to purchase phone number. Please ensure you have added a payment method on your Retell AI dashboard. Details: ${errorMessage}`,
      );
    }
  }

  voices(): Observable<any> {
    if (!process.env.RETELL_AI_API_KEY) {
      // Fallback: return the specific ElevenLabs voices used by the frontend
      const fallbackVoices = [
        {
          voice_id: '11labs-Andrew',
          voice_name: 'Andrew',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'male',
          age: 'Young',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Steve',
          voice_name: 'Steve',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'male',
          age: 'Middle-aged',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Paul',
          voice_name: 'Paul',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'male',
          age: 'Middle-aged',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Chloe',
          voice_name: 'Chloe',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'female',
          age: 'Young',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Marissa',
          voice_name: 'Marissa',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'female',
          age: 'Young',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Zuri',
          voice_name: 'Zuri',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'female',
          age: 'Young',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Gilfoy',
          voice_name: 'Gilfoy',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'male',
          age: 'Middle-aged',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Brian',
          voice_name: 'Brian',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'male',
          age: 'Middle-aged',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Santiago',
          voice_name: 'Santiago',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'male',
          age: 'Young',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Susan',
          voice_name: 'Susan',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'female',
          age: 'Middle-aged',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Evie',
          voice_name: 'Evie',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'female',
          age: 'Young',
          preview_audio_url: '',
        },
        {
          voice_id: '11labs-Paola',
          voice_name: 'Paola',
          provider: 'elevenlabs',
          accent: 'American',
          gender: 'female',
          age: 'Young',
          preview_audio_url: '',
        },
      ];
      return new Observable((subscriber) => {
        subscriber.next(fallbackVoices);
        subscriber.complete();
      });
    }

    return this.httpService
      .get(`${process.env.RETELL_AI_API_URL}list-voices`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
        },
      })
      .pipe(map((response) => response.data));
  }

  getElevenLabsVoices() {
    try {
      return this.httpService
        .get(`${process.env.ELEVENLABS_API_URL}v2/voices`, {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
          params: {
            page_size: 100, // or whatever number you want (max 100)
          },
        })
        .pipe(map((response) => response.data));
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error.message);
      throw new Error('Failed to fetch ElevenLabs voices');
    }
  }

  languages() {
    return this.languageRepo.createQueryBuilder('language').getMany();
  }

  async createsample(voice_id: string, text: string): Promise<Buffer> {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      },
    );

    return Buffer.from(response.data);
  }
}
