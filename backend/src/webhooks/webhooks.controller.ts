/* eslint-disable prettier/prettier */
// src/payment/payment.controller.ts
import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { BillingHistoryService } from 'src/billing_history/billing_history.service';
import Stripe from 'stripe';
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION as any,
});

@Controller('webhook')
export class StripeWebhookController {
  constructor(private readonly billingHistoryService: BillingHistoryService) {}

  @Public()
  @Post()
  async handleStripeEvent(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    // 1) Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        endpointSecret,
      );
      console.log('⏺️ Received raw Stripe event:', event);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2) Handle the event
    try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('📦 Event: checkout.session.completed');
            // Store customer, subscription, plan, etc.
            await this.billingHistoryService.handleCheckoutSessionCompleted(session);
          
            break;
          }
        //  case 'invoice.paid':{
        //  await this.billingHistoryService.handleInvoicePaid(event.data.object as Stripe.Invoice);
        //  break;
        //  }
          default:
            console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error('❗Error handling Stripe event:', err);
      }

    // 3) Acknowledge receipt
    return res.status(200).json({ received: true });
  }
}
