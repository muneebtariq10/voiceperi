import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order';
import { OrderLookupAudit } from '../entities/order_lookup_audit';
import { OrderStatusMappingService } from './order-status-mapping.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderLookupAudit)
    private readonly auditRepository: Repository<OrderLookupAudit>,
    private readonly statusMappingService: OrderStatusMappingService,
  ) {}

  async lookupOrder(orderId: number, phoneLast4: string, requestCorrelationId: string) {
    this.logger.log(`[${requestCorrelationId}] Looking up order ${orderId}`);

    const order = await this.orderRepository.findOne({
      where: { externalOrderId: orderId },
      relations: ['products', 'history'],
    });

    let verified = false;

    if (order && order.customerPhoneLast4 === phoneLast4) {
      verified = true;
    }

    // Save audit log
    await this.auditRepository.save({
      requestedOrderId: orderId,
      verificationMethod: 'phoneLast4',
      verificationSucceeded: verified,
      source: 'api',
      requestCorrelationId,
    });

    if (!verified || !order) {
      this.logger.warn(`[${requestCorrelationId}] Verification failed for order ${orderId}`);
      return {
        found: false,
        verified: false,
        message: 'We could not verify the order details provided.',
      };
    }

    // Prepare latest issue from history
    let latestIssue: string | null = null;
    let needsReview = false;

    if (order.history && order.history.length > 0) {
      // Sort history descending
      const sortedHistory = order.history.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
      
      for (const history of sortedHistory) {
        if (history.sanitizedComment && history.sanitizedComment.includes('Address not found or not deliverable')) {
           latestIssue = 'Address not found or not deliverable';
           break;
        }
      }
    }

    const mappedStatusMessage = this.statusMappingService.mapStatus(order.statusName, latestIssue);

    if (order.statusName === 'TESTING' || latestIssue) {
        needsReview = true;
    }

    this.logger.log(`[${requestCorrelationId}] Verification succeeded for order ${orderId}`);

    return {
      found: true,
      verified: true,
      order: {
        orderId: order.externalOrderId,
        status: order.statusName,
        statusMessage: mappedStatusMessage,
        date: order.dateAdded ? order.dateAdded.toISOString().split('T')[0] : null,
        currency: order.currencyCode,
        subtotal: order.subtotal,
        shipping: order.shippingTotal,
        discount: order.discountTotal,
        total: order.grandTotal,
        shippingMethod: order.shippingMethod,
        products: order.products?.map((p) => ({
          name: p.name,
          quantity: p.quantity,
        })) || [],
        latestIssue: latestIssue ? this.statusMappingService.mapStatus(order.statusName, latestIssue) : null,
        requiresHumanReview: needsReview,
      },
    };
  }
}
