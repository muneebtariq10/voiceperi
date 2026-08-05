import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Headers,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public() // If called from a Retell tool we might need a specific API token
  @Post('lookup')
  @HttpCode(HttpStatus.OK)
  async lookupOrder(
    @Body() body: any,
    @Headers('authorization') authHeader: string,
    @Query('token') queryToken?: string,
  ) {
    const integrationToken = process.env.ORDER_LOOKUP_INTEGRATION_TOKEN;

    if (integrationToken) {
      const isAuthHeaderValid =
        authHeader && authHeader === `Bearer ${integrationToken}`;
      const isQueryTokenValid = queryToken && queryToken === integrationToken;

      if (!isAuthHeaderValid && !isQueryTokenValid) {
        throw new UnauthorizedException('Invalid integration token');
      }
    }

    const args = body?.args || body?.arguments || body || {};

    const rawOrderId =
      args.orderId ??
      args.order_id ??
      args.order ??
      body?.orderId ??
      body?.order_id ??
      body?.order ??
      (typeof body === 'number' || typeof body === 'string' ? body : undefined);

    if (rawOrderId === undefined || rawOrderId === null) {
      return {
        found: false,
        verified: false,
        message: 'We could not find the order ID provided.',
      };
    }

    const rawEmail =
      args.email ??
      args.customerEmail ??
      body?.email ??
      body?.customerEmail ??
      undefined;

    const correlationId = Math.random().toString(36).substring(7);
    return await this.ordersService.lookupOrder(
      rawOrderId,
      correlationId,
      rawEmail,
    );
  }

  @Public()
  @Post('lookup-by-email')
  @HttpCode(HttpStatus.OK)
  async lookupByEmail(@Body() body: any) {
    const args = body?.args || body?.arguments || body || {};

    const email =
      args.email ??
      args.customerEmail ??
      args.customer_email ??
      body?.email ??
      body?.customerEmail ??
      body?.customer_email ??
      undefined;

    const phone =
      args.phone ??
      args.customerPhone ??
      args.telephone ??
      body?.phone ??
      body?.customerPhone ??
      body?.telephone ??
      undefined;

    // CRITICAL: Avoid falling back to body.name as Retell sends function tool name in body.name
    const name =
      args.customerName ??
      args.name ??
      args.company ??
      body?.customerName ??
      body?.company ??
      undefined;

    if (!email && !phone && !name) {
      return {
        found: false,
        message:
          'Could you please provide your email address, phone number, or name so I can look up your account?',
      };
    }

    const correlationId = Math.random().toString(36).substring(7);
    return await this.ordersService.lookupOrdersByEmail(
      email,
      correlationId,
      phone,
      name,
    );
  }
}
