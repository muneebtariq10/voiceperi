/* eslint-disable prettier/prettier */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
import { PaymentPlanPricingService } from './payment_plan_pricing.service';
import { PaymentPlanPricing } from 'src/entities/payment_plans_pricing';
import { CreatePaymentPlanPricingDto } from './dto/create-pricing.dto';
import { UpdatePaymentPlanPricingDto } from './dto/update.pricing.dto';
import { Public } from 'src/auth/decorators/public.decorator';
  
  @Controller('pricing')
  export class PaymentPlanPricingController {
    constructor(private pricingService: PaymentPlanPricingService) {}
  
    @Get()
    async findAll(@Query() query: Record<string, any>): Promise<PaymentPlanPricing[]> {
      return this.pricingService.findAll(query);
    }
  
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<PaymentPlanPricing> {
      const pricing = await this.pricingService.findOne(id);
      if (!pricing) {
        throw new Error(`PaymentPlanPricing with id ${id} not found`);
      }
      return pricing;
    }
  
    @Public()
    @Post()
    // @UseGuards(AuthGuard())
    async create(
      @Body() dto: CreatePaymentPlanPricingDto,
    ): Promise<PaymentPlanPricing> {
      return this.pricingService.create(dto);
    }
  
    @Put(':id')
    @UseGuards(AuthGuard())
    async update(
      @Param('id') id: number,
      @Body() dto: UpdatePaymentPlanPricingDto,
    ): Promise<PaymentPlanPricing> {
      return this.pricingService.update(id, dto);
    }
  
    @Delete(':id')
    @UseGuards(AuthGuard())
    async remove(@Param('id') id: number): Promise<void> {
      await this.pricingService.remove(id);
    }
  }
  