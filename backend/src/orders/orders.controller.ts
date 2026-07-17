import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Headers,
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
    @Body() body: { orderId: number; phoneLast4: string },
    @Headers('authorization') authHeader: string,
  ) {
    const integrationToken = process.env.ORDER_LOOKUP_INTEGRATION_TOKEN;
    
    if (integrationToken) {
      if (!authHeader || authHeader !== `Bearer ${integrationToken}`) {
         throw new UnauthorizedException('Invalid integration token');
      }
    }

    if (!body.orderId || !body.phoneLast4) {
      return {
        found: false,
        verified: false,
        message: 'We could not verify the order details provided.',
      };
    }

    const correlationId = Math.random().toString(36).substring(7);
    return await this.ordersService.lookupOrder(body.orderId, body.phoneLast4, correlationId);
  }
}
