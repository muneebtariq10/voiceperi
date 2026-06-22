/* eslint-disable prettier/prettier */
/* billing-history.service.ts */
import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BillingHistory } from 'src/entities/billing_history';
@Injectable()
export class BillingHistoryService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(BillingHistory)
    private billingRepo: Repository<BillingHistory>,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: process.env.STRIPE_API_VERSION as any,
    });
  }
  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      // Fetch full subscription
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      const invoice = await this.stripe.invoices.retrieve(
        session.invoice as string,
      );
      const subscriptionItem = subscription.items.data[0];
      const currentPeriodStart = subscriptionItem.current_period_start;
      const currentPeriodEnd = subscriptionItem.current_period_end;
      const subscription_status = subscription.status;
      const billingType = subscriptionItem.price.recurring?.interval;
      const { userId, planId, pricingId } = subscription.metadata || {};
      if (!userId || !planId || !pricingId) {
        throw new Error('Missing subscription.metadata.userId or planId');
      }

      const periodStartSec = currentPeriodStart;
      const periodEndSec = currentPeriodEnd;

      // const existing = await this.billingRepo.findOneBy({
      //   stripe_payment_id: paymentId,
      // });

      // if (existing) {
      //   console.log('⚠️ Duplicate billing record, skipping.');
      //   return;
      // }

      const billing = this.billingRepo.create({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        amount: invoice.amount_paid / 100,
        invoice_status: invoice.status,
        subscription_status,
        type: billingType,
        current_period_start: new Date(periodStartSec * 1000),
        current_period_end: new Date(periodEndSec * 1000),
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        payment_method: subscription.default_payment_method || null,
        invoice_url: invoice.hosted_invoice_url || null,
        invoice_pdf_url: invoice.invoice_pdf || null,
        user: { id: userId },
        paymentPlan: { id: parseInt(planId, 10) },
        PaymentPlanPricing: { id: parseInt(pricingId, 10) },
      } as DeepPartial<BillingHistory>);

      await this.billingRepo.save(billing);
      console.log('💾 Saved billing history via checkout.session.completed');
    } catch (err) {
      console.error('❗Error in handleCheckoutSessionCompleted:', err);
    }
  }

  /** Handles subscription invoice payments */
  // async handleInvoicePaid(invoice: Stripe.Invoice) {
  //   try {
  //     const inv: any = invoice;

  //     // 1) Subscription ID
  //     const subscriptionId = inv.subscription as string;
  //     if (!subscriptionId) {
  //       throw new Error('invoice.subscription is missing');
  //     }

  //     // 2) Retrieve subscription (for metadata and, if available, periods)
  //     const subscription: any = await this.stripe.subscriptions.retrieve(subscriptionId);
  //     console.log('🔍 Raw subscription object:', JSON.stringify(subscription, null, 2));

  //     const subscriptionItem = subscription.items.data[0]; // Assuming one item
  //     const currentPeriodStart = subscriptionItem.current_period_start;
  //     const currentPeriodEnd = subscriptionItem.current_period_end;
  //     const subscription_status = subscription.status;
  //     const billingType = subscriptionItem.price.recurring?.interval;
  //     console.log("🔎 Subscription metadata:", subscription.metadata);

  //     const { userId, planId,pricingId } = subscription.metadata || {};
  //     if (!userId || !planId || !pricingId) {
  //       throw new Error('Missing subscription.metadata.userId or planId');
  //     }
  //     const periodStartSec: number =currentPeriodStart ;
  //     const periodEndSec:   number = currentPeriodEnd;

  //     if (!periodStartSec || !periodEndSec) {
  //       throw new Error('Cannot determine billing period dates');
  //     }

  //     // 4) Pick a payment ID
  //     const paymentId: string = inv.charge || inv.payment_intent || '';
  //     const existing = await this.billingRepo.findOneBy({
  //       stripe_payment_id: paymentId,
  //     });

  //     if (existing) {
  //       console.log('⚠️ Duplicate event. Billing record already exists.');
  //       return;
  //     }
  //     // 5) Build and save the record
  //     const billing = this.billingRepo.create({
  //       stripe_customer_id:     inv.customer as string,
  //       stripe_subscription_id: subscription.id,
  //       stripe_payment_id:      paymentId,
  //       amount:                 inv.amount_paid / 100,
  //       invoice_status:                 inv.status,
  //       type: billingType,
  //       subscription_status:    subscription_status,
  //       current_period_start:   new Date(periodStartSec * 1000),
  //       current_period_end:     new Date(periodEndSec   * 1000),
  //       canceled_at: subscription.canceled_at
  //         ? new Date(subscription.canceled_at * 1000)
  //         : null,
  //       payment_method: subscription.default_payment_method || null,
  //       invoice_url:     inv.hosted_invoice_url || null,
  //       invoice_pdf_url: inv.invoice_pdf || null,
  //       // relations
  //       user: { id: userId },
  //       paymentPlan: { id: parseInt(planId, 10) },
  //       PaymentPlanPricing: { id: parseInt(pricingId, 10) },
  //     } as any);

  //     await this.billingRepo.save(billing);
  //     console.log('💾 Saved billing history for invoice event');
  //   } catch (err) {
  //     console.error('❗Error in handleInvoicePaid:', err);
  //   }
  // }

  async getByUserId(userId: string): Promise<BillingHistory[]> {
    if (!userId) {
      console.error('User ID is undefined or invalid.');
      throw new BadRequestException('User ID is required.');
    }

    return this.billingRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'paymentPlan', 'PaymentPlanPricing'],
    });
  }
}
