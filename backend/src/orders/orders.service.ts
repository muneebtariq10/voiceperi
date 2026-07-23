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

  async lookupOrder(orderId: number | string, requestCorrelationId: string) {
    this.logger.log(`[${requestCorrelationId}] Looking up order ${orderId}`);

    const numericOrderId =
      typeof orderId === 'number'
        ? orderId
        : parseInt(String(orderId).replace(/\D/g, ''), 10);

    const order = isNaN(numericOrderId)
      ? null
      : await this.orderRepository.findOne({
          where: { externalOrderId: numericOrderId },
          relations: ['products', 'history'],
        });

    const verified = !!order;

    // Save audit log
    await this.auditRepository.save({
      requestedOrderId: isNaN(numericOrderId) ? 0 : numericOrderId,
      verificationMethod: 'orderId',
      verificationSucceeded: verified,
      source: 'api',
      requestCorrelationId,
    });

    if (!order) {
      this.logger.warn(
        `[${requestCorrelationId}] Verification failed for order ${orderId}`,
      );
      return {
        found: false,
        verified: false,
        message: 'We could not find an order with the provided order ID.',
      };
    }

    // Prepare latest issue from history
    let latestIssue: string | null = null;
    let needsReview = false;

    // Build history summary
    const historySummary: string[] = [];

    if (order.history && order.history.length > 0) {
      // Sort history ascending (oldest first for chronological summary)
      const sortedHistory = order.history.sort((a, b) => {
        const timeA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const timeB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return timeA - timeB;
      });

      for (const history of sortedHistory) {
        if (
          history.sanitizedComment &&
          history.sanitizedComment.includes(
            'Address not found or not deliverable',
          )
        ) {
          latestIssue = 'Address not found or not deliverable';
        }

        if (history.sanitizedComment) {
          const dateStr = history.dateAdded
            ? new Date(history.dateAdded).toISOString().split('T')[0]
            : 'Unknown date';
          historySummary.push(`${dateStr}: ${history.sanitizedComment}`);
        }
      }
    }

    const mappedStatusMessage = this.statusMappingService.mapStatus(
      order.statusName,
      latestIssue,
    );

    if (order.statusName === 'TESTING' || latestIssue) {
      needsReview = true;
    }

    this.logger.log(
      `[${requestCorrelationId}] Verification succeeded for order ${orderId}`,
    );

    const formattedDate = order.dateAdded
      ? new Date(order.dateAdded).toISOString().split('T')[0]
      : null;

    const formattedModifiedDate = order.dateModified
      ? new Date(order.dateModified).toISOString().split('T')[0]
      : null;

    // Build shipping address string
    const shippingAddressParts = [
      order.shippingAddress1,
      order.shippingAddress2,
      order.shippingCity,
      order.shippingZone,
      order.shippingPostcode,
      order.shippingCountry,
    ].filter((p) => p && p.trim() !== '');
    const shippingAddressFormatted =
      shippingAddressParts.length > 0 ? shippingAddressParts.join(', ') : null;

    // Build billing address string
    const billingAddressParts = [
      order.billingAddress1,
      order.billingAddress2,
      order.billingCity,
      order.billingZone,
      order.billingPostcode,
      order.billingCountry,
    ].filter((p) => p && p.trim() !== '');
    const billingAddressFormatted =
      billingAddressParts.length > 0 ? billingAddressParts.join(', ') : null;

    return {
      found: true,
      verified: true,
      order: {
        orderId: order.externalOrderId,
        orderType: order.orderType || 'Online',
        status: order.statusName,
        statusMessage: mappedStatusMessage,
        dateOrdered: formattedDate,
        dateLastUpdated: formattedModifiedDate,
        currency: order.currencyCode,
        subtotal: order.subtotal,
        shippingCost: order.shippingTotal,
        discount: order.discountTotal,
        total: order.grandTotal,

        // Customer Info
        customerName:
          order.customerFirstName && order.customerLastName
            ? `${order.customerFirstName} ${order.customerLastName}`
            : null,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,

        // Shipping
        shippingMethod: order.shippingMethod || null,
        shippingAddress: shippingAddressFormatted,
        shippingRecipient:
          order.shippingFirstName && order.shippingLastName
            ? `${order.shippingFirstName} ${order.shippingLastName}`
            : null,
        shippingCompany: order.shippingCompany || null,

        // Billing
        billingAddress: billingAddressFormatted,
        billingName:
          order.billingFirstName && order.billingLastName
            ? `${order.billingFirstName} ${order.billingLastName}`
            : null,
        billingCompany: order.billingCompany || null,

        // Payment
        paymentMethod: order.paymentMethod || null,

        // Products with full details
        products:
          order.products?.map((p) => ({
            name: p.name,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            total: p.total,
            options: p.normalizedOptions || [],
          })) || [],

        // History
        historySummary:
          historySummary.length > 0 ? historySummary : ['No order updates.'],

        // Flags
        isReorder: !!order.reorderId,
        reorderId: order.reorderId || null,
        latestIssue: latestIssue
          ? this.statusMappingService.mapStatus(order.statusName, latestIssue)
          : null,
        requiresHumanReview: needsReview,
      },
    };
  }
}
