/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsObject, IsNotEmpty, IsEnum, IsNumber, IsArray, ValidateNested} from 'class-validator';
import { PricingInterval } from 'src/entities/payment_plans_pricing';

class PricingDto {
  @IsEnum(PricingInterval)
  type: PricingInterval;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsEnum(['percentage', 'value'])
  discount_type?: 'percentage' | 'value';

  @IsOptional()
  @IsNumber()
  discount?: number | null;
}
export class CreatePaymentPlanDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  is_popular: boolean; // Whether the plan is marked as popular

  // Validate features as an object
  @IsOptional()
  @IsObject()
  features?: {
    minutes?: number;
    price_per_minute?: number; 
    zapier_integration?: boolean;
    smart_spam_detection?: boolean;
    crm_integration?: boolean;
    custom_agent_training?: boolean;
    advance_call_transfer?: boolean;
    appointment_links?: boolean;
    advance_appointment_booking?: boolean;
  };

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  pricing: PricingDto[] | null; // Allow null or undefined for pricing array
}
