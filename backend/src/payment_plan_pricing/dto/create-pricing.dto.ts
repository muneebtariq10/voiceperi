/* eslint-disable prettier/prettier */
import { IsNumber, IsPositive, IsInt, IsString } from 'class-validator';

export class CreatePaymentPlanPricingDto {
  @IsString()
  type: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  plan_id: number;
}
