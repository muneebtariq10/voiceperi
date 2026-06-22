import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessinfoDto } from './create-businessinfo.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateBusinessinfoDto extends PartialType(CreateBusinessinfoDto) {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    address?: string;
    @IsOptional()
    @IsString()
    profile?: string;
  
    @IsOptional()
    @IsString()
    phone?: string;
  
    @IsOptional()
    @IsString()
    timezone?: string;
  
    @IsOptional()
    @IsString()
    overview?: string;
  
    @IsOptional()
    @IsArray()
    services?: string[];
  
    @IsOptional()
    @IsArray()
    business_hours?: string[];
  
}
