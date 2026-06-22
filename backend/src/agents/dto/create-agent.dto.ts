import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAgentDto {
  @IsNotEmpty()
  agent_name: string;

  @IsNotEmpty()
  voice_id: string;

  @IsNotEmpty()
  @IsUUID()
  language_id: string;

  @IsNotEmpty()
  user_id: string;

  google_business_url?: string;
}
