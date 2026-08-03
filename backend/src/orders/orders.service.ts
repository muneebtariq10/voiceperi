import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderLookupAudit } from '../entities/order_lookup_audit';
import { OpenCartOrderAdapter } from '../integrations/adapters';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderLookupAudit)
    private readonly auditRepository: Repository<OrderLookupAudit>,
    private readonly orderAdapter: OpenCartOrderAdapter,
  ) {}

  async lookupOrder(
    orderId: number | string,
    requestCorrelationId: string,
    email?: string,
  ) {
    this.logger.log(`[${requestCorrelationId}] Looking up order ${orderId} with email: ${email || 'not provided'}`);

    // Delegate to the Integration Layer adapter
    const result = await this.orderAdapter.getOrderById(orderId);

    const numericOrderId =
      typeof orderId === 'number'
        ? orderId
        : parseInt(String(orderId).replace(/\D/g, ''), 10);

    // Save audit log
    await this.auditRepository.save({
      requestedOrderId: isNaN(numericOrderId) ? 0 : numericOrderId,
      verificationMethod: email ? 'orderId+email_optional' : 'orderId',
      verificationSucceeded: result.found,
      source: 'api',
      requestCorrelationId,
    });

    if (!result.found) {
      this.logger.warn(
        `[${requestCorrelationId}] Verification failed: order ${orderId} not found`,
      );
      return {
        found: false,
        verified: false,
        message: result.message || 'We could not find an order with the provided order ID.',
      };
    }

    this.logger.log(
      `[${requestCorrelationId}] Verification succeeded for order ${orderId}`,
    );

    return {
      found: true,
      verified: true,
      order: result.order,
    };
  }

  async lookupOrdersByEmail(
    email: string,
    requestCorrelationId: string,
  ) {
    this.logger.log(`[${requestCorrelationId}] Looking up orders for email: ${email}`);

    const result = await this.orderAdapter.getOrdersByEmail(email);

    // Save audit log
    await this.auditRepository.save({
      requestedOrderId: 0,
      verificationMethod: 'email',
      verificationSucceeded: result.found,
      source: 'api',
      requestCorrelationId,
    });

    return result;
  }
}
