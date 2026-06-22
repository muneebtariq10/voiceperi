import { Agent } from 'src/entities/agent';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentDto } from './create-agent.dto';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @IsOptional()
  agent_name: string;

  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsUUID()
  @IsOptional()
  language_id?: string;

  @IsString()
  @IsOptional()
  voice_id?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  blocked_numbers?: string[] | null;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  emails?: string[]; // Should be an array, not a string

  @IsString()
  @IsOptional()
  google_business_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notes?: string[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phone_numbers?: string[] | null;

  @IsOptional()
  @IsBoolean()
  hangup_if_call_detected?: boolean;

  @IsOptional()
  @IsBoolean()
  block_800_number?: boolean;
}
