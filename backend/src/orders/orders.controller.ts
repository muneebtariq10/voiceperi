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

    const rawOrderId =
      body?.orderId ??
      body?.order_id ??
      body?.order ??
      body?.args?.orderId ??
      body?.args?.order_id ??
      body?.arguments?.orderId ??
      body?.arguments?.order_id ??
      (typeof body === 'number' || typeof body === 'string' ? body : undefined);

    if (rawOrderId === undefined || rawOrderId === null) {
      return {
        found: false,
        verified: false,
        message: 'We could not find the order ID provided.',
      };
    }

    const rawEmail =
      body?.email ??
      body?.customerEmail ??
      body?.args?.email ??
      body?.args?.customerEmail ??
      body?.arguments?.email ??
      body?.arguments?.customerEmail ??
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
    const email =
      body?.email ??
      body?.customerEmail ??
      body?.customer_email ??
      body?.args?.email ??
      body?.args?.customerEmail ??
      body?.arguments?.email ??
      body?.arguments?.customerEmail ??
      undefined;

    const phone =
      body?.phone ??
      body?.customerPhone ??
      body?.telephone ??
      body?.args?.phone ??
      body?.args?.customerPhone ??
      body?.arguments?.phone ??
      body?.arguments?.customerPhone ??
      undefined;

    const name =
      body?.customerName ??
      body?.name ??
      body?.company ??
      body?.args?.customerName ??
      body?.args?.name ??
      body?.arguments?.customerName ??
      body?.arguments?.name ??
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
