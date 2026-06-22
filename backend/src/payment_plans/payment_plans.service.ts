/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentPlan } from 'src/entities/payment_plans';
import { CreatePaymentPlanDto } from './dto/create-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-plan.dto';
import Stripe from 'stripe';
import { User } from 'src/entities/user';
import { BillingHistory } from 'src/entities/billing_history';
import { PaymentPlanPricing } from 'src/entities/payment_plans_pricing';
@Injectable()
export class PaymentPlanService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentPlan)
    private readonly paymentPlanRepository: Repository<PaymentPlan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BillingHistory)
    private readonly userPaymentsRepository: Repository<BillingHistory>,
    @InjectRepository(PaymentPlanPricing)
    private readonly paymentPlanPricing: Repository<PaymentPlanPricing>,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined.');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: process.env.STRIPE_API_VERSION as any,
    });
  }

  async create(createPaymentPlanDto: CreatePaymentPlanDto): Promise<PaymentPlan> {
    // Step 1: Create the Stripe product for the plan
    const product = await this.stripe.products.create({
      name: createPaymentPlanDto.title,
      description: 'Subscription plan with multiple pricing options',
    });
  
    // Step 2: Save the plan first without Stripe price IDs
    const paymentPlan = this.paymentPlanRepository.create({
      ...createPaymentPlanDto,
      stripe_product_id: product.id,
    });
  
    const savedPlan = await this.paymentPlanRepository.save(paymentPlan);
  
    // Step 3: Create Stripe prices for each interval
    const pricingList = await Promise.all(
      (createPaymentPlanDto.pricing || []).map(async (priceOption) => {
        const stripePrice = await this.stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(
           this.applyDiscount(priceOption.price, priceOption.discount, priceOption.discount_type) * 100
          ), // USD cents
          currency: 'usd',
          recurring: { interval: priceOption.type },
        });
  
        const newPricing = this.paymentPlanPricing.create({
          type: priceOption.type,
          price: priceOption.price,
          stripe_price_id: stripePrice.id,
          discount_type: priceOption.discount_type || 'percentage',
          discount: priceOption.discount || null,
          plan: savedPlan,
        });
        return await this.paymentPlanPricing.save(newPricing);
      }),
    );
    //return savedPlan;
    return {
      ...savedPlan,
      pricings: pricingList,
    };
  }
  
  async createCheckoutSession(planId: number, selectedPlan: string, userId: string): Promise<{ id: string }> {
    const paymentPlan = await this.paymentPlanRepository.findOne({
      where: { id: planId },
      relations: ['pricings'],
    });
  
    if (!paymentPlan) {
      throw new BadRequestException('Payment plan not found.');
    }
  
    // Find the pricing that matches the selected plan (monthly/yearly)
    const pricing = paymentPlan.pricings.find(p => p.type === selectedPlan as typeof p.type);
    const pricingId = pricing?.id;
    if (!pricing || !pricing.stripe_price_id) {
      throw new BadRequestException(`No ${selectedPlan} pricing available.`);
    }
  
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: pricing.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}success`,
        cancel_url: `${process.env.FRONTEND_URL}dashboard/settings`,
        subscription_data: {
          metadata: {
            userId: userId.toString(),
            planId: planId.toString(),
            pricingId: pricingId?.toString() || null,
          },
        },
      });
  
      if (!session.id) {
        throw new BadRequestException('Stripe session ID is null.');
      }
  
      return { id: session.id };
    } catch (error) {
      throw new BadRequestException('Error creating checkout session: ' + error.message);
    }
  }
  
  // Get all payment plans
  async findAll(): Promise<PaymentPlan[]> {
    return this.paymentPlanRepository.find({ relations: ['pricings'] });
  }

  // Get a payment plan by ID
  async findOne(id: number): Promise<PaymentPlan> {
    const paymentPlan = await this.paymentPlanRepository.findOne({ where: { id }, relations: ['pricings'] });
    if (!paymentPlan) {
      throw new NotFoundException(`Payment plan with ID ${id} not found`);
    }
    return paymentPlan;
  }

  async update(id: number, updatePaymentPlanDto: UpdatePaymentPlanDto): Promise<PaymentPlan> {
    const existingPlan = await this.paymentPlanRepository.findOne({
      where: { id },
      relations: ['pricings'],
    });
  
    if (!existingPlan) {
      throw new NotFoundException(`Payment plan with ID ${id} not found`);
    }
  
    // Update Stripe product name if changed
    if (
      updatePaymentPlanDto.title &&
      updatePaymentPlanDto.title !== existingPlan.title &&
      existingPlan.stripe_product_id
    ) {
      await this.stripe.products.update(existingPlan.stripe_product_id, {
        name: updatePaymentPlanDto.title,
      });
    }
  
    // Create new pricing list and only deactivate Stripe prices if price changed
    const newPricings = await Promise.all(
      (updatePaymentPlanDto.pricing || []).map(async (priceOption) => {
        const existingMatch = existingPlan.pricings.find(
          (p) => p.type === priceOption.type
        );
  
        const hasChanged =
                !existingMatch || // No previous match found
                Math.round(Number(existingMatch.price) * 100) !== Math.round(Number(priceOption.price) * 100) || // Price changed (accounting for float precision)
                existingMatch.discount_type !== priceOption.discount_type || // Discount type changed
                Number(existingMatch.discount ?? 0) !== Number(priceOption.discount ?? 0); // Discount value changed (handles null)

  
        if (existingMatch && hasChanged && existingMatch.stripe_price_id) {
          await this.stripe.prices.update(existingMatch.stripe_price_id, { active: false });
        }
  
        if (hasChanged) {
          const stripePrice = await this.stripe.prices.create({
            product: existingPlan.stripe_product_id,
            unit_amount: Math.round(
              this.applyDiscount(priceOption.price, priceOption.discount, priceOption.discount_type) * 100
             ),
            currency: 'usd',
            recurring: { interval: priceOption.type },
          });
  
          if (existingMatch) {
            // Update existing DB record
            existingMatch.price = priceOption.price;
            existingMatch.discount_type = priceOption.discount_type || 'percentage';
            existingMatch.discount = priceOption.discount || null;
            existingMatch.stripe_price_id = stripePrice.id;
            return this.paymentPlanPricing.save(existingMatch);
          } else {
            // Create new DB record (for a totally new pricing type)
            const newPricing = this.paymentPlanPricing.create({
              type: priceOption.type,
              price: priceOption.price,
              stripe_price_id: stripePrice.id,
              discount_type: priceOption.discount_type || 'percentage',
              discount: priceOption.discount || null,
              plan: existingPlan,
            });
            return this.paymentPlanPricing.save(newPricing);
          }
          
        }
  
        return existingMatch;
      }),
    );
  
    // Remove undefined/null if a price wasn't changed and matched existing one
    const filteredPricings = newPricings.filter(Boolean);
  
    // Merge updates into existing plan
    this.paymentPlanRepository.merge(existingPlan, {
      ...updatePaymentPlanDto,
    });
    
    // Only update pricings if there are actual new entries
    if (filteredPricings.some((p) => !existingPlan.pricings.includes(p))) {
      existingPlan.pricings = filteredPricings;
    }
  
    return this.paymentPlanRepository.save(existingPlan);
  }
  
  applyDiscount(price: number, discount?: number | null, type?: 'percentage' | 'value'): number {
    if (!discount || discount === 0) return price;
  
    if (type === 'percentage') {
      return price - (price * discount) / 100;
    }
  
    if (type === 'value') {
      return price - discount;
    }
  
    return price;
  }
  
  


  async remove(id: number): Promise<void> {
    const paymentPlan = await this.paymentPlanRepository.findOne({
      where: { id },
      relations: ['pricings'],
    });
  
    if (!paymentPlan) {
      throw new NotFoundException(`Payment plan with ID ${id} not found`);
    }
  
    // Deactivate Stripe prices
    for (const pricing of paymentPlan.pricings) {
      if (pricing.stripe_price_id) {
        try {
          await this.stripe.prices.update(pricing.stripe_price_id, { active: false });
        } catch (err) {
          console.warn(`Stripe price ${pricing.stripe_price_id} could not be deactivated`, err.message);
        }
      }
    }
    if (paymentPlan.stripe_product_id) {
      try {
        await this.stripe.products.update(paymentPlan.stripe_product_id, { active: false });
      } catch (err) {
        console.warn(`Stripe product ${paymentPlan.stripe_product_id} could not be archived`, err.message);
      }
    }
  
    await this.paymentPlanPricing.delete({ plan: { id } });
    await this.paymentPlanRepository.delete(id);
  } 
  
}
