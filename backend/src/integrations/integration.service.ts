import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { Repository } from 'typeorm';
import { Agent } from 'src/entities/agent';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,
    private readonly httpService: HttpService,
  ) {}

  async saveEvent(
    userId: string,
    eventId: string,
    key: string,
    eventName: string,
  ): Promise<any> {
    if (!eventId) {
      throw new HttpException('Event ID is required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    const agentInfo = await this.agentRepo.findOne({
      where: { user: { id: userId } },
    });

    const formattedEventName = eventName.replace(/\s+/g, '_');

    if (!agentInfo?.llm_id) {
      throw new BadRequestException('LLM ID not found');
    }

    let existingTools: any[] = [];
    try {
      const getResponse = await firstValueFrom(
        this.httpService.get(
          `${process.env.RETELL_AI_API_URL}get-retell-llm/${agentInfo.llm_id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
            },
          },
        ),
      );
      if (getResponse.data && Array.isArray(getResponse.data.general_tools)) {
        existingTools = getResponse.data.general_tools.filter(
          (t: any) => t.type !== 'check_availability_cal',
        );
      }
    } catch (err: unknown) {
      console.warn(
        'Could not fetch existing Retell LLM tools, falling back to default tools',
      );
      existingTools = [
        {
          type: 'end_call',
          name: 'end_call',
          description: 'End the call with user.',
        },
      ];
    }

    const updatedTools = [
      ...existingTools,
      {
        type: 'check_availability_cal',
        name: formattedEventName,
        cal_api_key: key,
        event_type_id: Number(eventId),
      },
    ];

    const updateResponse = await firstValueFrom(
      this.httpService.patch(
        `${process.env.RETELL_AI_API_URL}update-retell-llm/${agentInfo.llm_id}`,
        {
          general_tools: updatedTools,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
          },
        },
      ),
    );

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.event_id = eventId;
    user.cal_key = key;

    await this.userRepo.save(user);

    return { message: 'Event saved successfully', user };
  }
}
