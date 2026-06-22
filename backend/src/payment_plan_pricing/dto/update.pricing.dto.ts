/* eslint-disable prettier/prettier */
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdatePaymentPlanPricingDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}
