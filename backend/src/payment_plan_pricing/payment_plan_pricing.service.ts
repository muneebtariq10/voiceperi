/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentPlanPricing, PricingInterval } from 'src/entities/payment_plans_pricing';
import { Repository } from 'typeorm';
import { CreatePaymentPlanPricingDto } from './dto/create-pricing.dto';
import { UpdatePaymentPlanPricingDto } from './dto/update.pricing.dto';


@Injectable()
export class PaymentPlanPricingService {
  constructor(
    @InjectRepository(PaymentPlanPricing)
    private readonly pricingRepository: Repository<PaymentPlanPricing>,
  ) {}

  async findAll(query: Record<string, any>): Promise<PaymentPlanPricing[]> {
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    return this.pricingRepository.find({ take: limit, skip });
  }

  async findOne(id: number): Promise<PaymentPlanPricing | null> {
    return this.pricingRepository.findOneBy({ id });
  }

  async create(dto: CreatePaymentPlanPricingDto): Promise<PaymentPlanPricing> {
    const newPricing = this.pricingRepository.create({
      type: dto.type as PricingInterval,
      price: dto.price,
      plan: { id: dto.plan_id },
    });

    return await this.pricingRepository.save(newPricing);
  }

  async update(id: number, dto: UpdatePaymentPlanPricingDto): Promise<PaymentPlanPricing> {
    const pricing = await this.pricingRepository.findOneBy({ id });
    if (!pricing) {
      throw new NotFoundException('Payment Plan Pricing not found');
    }

    Object.assign(pricing, dto);
    return await this.pricingRepository.save(pricing);
  }

  async remove(id: number) {
    return await this.pricingRepository.delete(id);
  }
}
