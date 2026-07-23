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
    @Body() body: { orderId: number | string },
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

    if (!body.orderId) {
      return {
        found: false,
        verified: false,
        message: 'We could not find the order ID provided.',
      };
    }

    const correlationId = Math.random().toString(36).substring(7);
    return await this.ordersService.lookupOrder(body.orderId, correlationId);
  }
}
