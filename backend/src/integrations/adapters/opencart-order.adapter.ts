import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order';
import {
  IOrderProvider,
  OrderLookupResult,
  OrderListResult,
} from '../interfaces';
import { OrderStatusMappingService } from '../../orders/order-status-mapping.service';

/**
 * OpenCartOrderAdapter — Retrieves order data for PrintEZ.
 *
 * Current implementation: reads from local PostgreSQL (seeded from JSON).
 * Future implementation: will call PrintEZ OpenCart Order API directly.
 *
 * When the live Order API becomes available, swap the getOrderById/getOrdersByEmail
 * methods to call the API instead of the local database.
 */
@Injectable()
export class OpenCartOrderAdapter implements IOrderProvider {
  private readonly logger = new Logger(OpenCartOrderAdapter.name);

  // TODO: Set these from environment variables once PrintEZ provides the Order API
  // private readonly orderApiUrl = 'https://www.printez.com/index.php?route=agentapi/order|info';
  // private readonly orderListApiUrl = 'https://www.printez.com/index.php?route=agentapi/order|list';

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly statusMappingService: OrderStatusMappingService,
  ) {}

  async getOrderById(orderId: number | string): Promise<OrderLookupResult> {
    const numericOrderId =
      typeof orderId === 'number'
        ? orderId
        : parseInt(String(orderId).replace(/\D/g, ''), 10);

    if (isNaN(numericOrderId)) {
      return {
        found: false,
        message: 'Invalid order ID format.',
      };
    }

    // TODO: When PrintEZ Order API is available, call it here instead of querying local DB
    // const apiResult = await this.fetchOrderFromApi(numericOrderId);
    // if (apiResult) return apiResult;

    // Fallback: query local database (seeded from JSON)
    const order = await this.orderRepository.findOne({
      where: { externalOrderId: numericOrderId },
      relations: ['products', 'history'],
    });

    if (!order) {
      return {
        found: false,
        message: 'We could not find an order with the provided order ID.',
      };
    }

    return {
      found: true,
      order: this.formatOrder(order),
    };
  }

  async getOrdersByEmail(email: string): Promise<OrderListResult> {
    if (!email || !email.includes('@')) {
      return {
        found: false,
        message: 'Please provide a valid email address.',
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // TODO: When PrintEZ Order API is available, call it here
    // const apiResult = await this.fetchOrdersByEmailFromApi(normalizedEmail);
    // if (apiResult) return apiResult;

    // Fallback: query local database
    const orders = await this.orderRepository.find({
      where: { customerEmailNormalized: normalizedEmail },
      order: { dateAdded: 'DESC' },
      take: 10,
      relations: ['products'],
    });

    if (!orders || orders.length === 0) {
      return {
        found: false,
        message: 'No orders found for this email address.',
      };
    }

    return {
      found: true,
      orders: orders.map((o) => ({
        orderId: o.externalOrderId,
        status: o.statusName || 'Unknown',
        dateOrdered: o.dateAdded
          ? new Date(o.dateAdded).toISOString().split('T')[0]
          : undefined,
        total: o.grandTotal,
        productSummary:
          o.products
            ?.map((p) => p.name)
            .slice(0, 3)
            .join(', ') || 'No products listed',
      })),
    };
  }

  async isAvailable(): Promise<boolean> {
    // TODO: When live API is available, ping the endpoint
    // For now, check if local DB has orders
    try {
      const count = await this.orderRepository.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Format an Order entity into the standardized OrderData shape.
   */
  private formatOrder(order: Order) {
    // Build history summary
    const historySummary: string[] = [];
    let latestIssue: string | null = null;
    let needsReview = false;

    if (order.history && order.history.length > 0) {
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

    // Build shipping address
    const shippingAddressParts = [
      order.shippingAddress1,
      order.shippingAddress2,
      order.shippingCity,
      order.shippingZone,
      order.shippingPostcode,
      order.shippingCountry,
    ].filter((p) => p && p.trim() !== '');

    // Build billing address
    const billingAddressParts = [
      order.billingAddress1,
      order.billingAddress2,
      order.billingCity,
      order.billingZone,
      order.billingPostcode,
      order.billingCountry,
    ].filter((p) => p && p.trim() !== '');

    return {
      orderId: order.externalOrderId,
      orderType: order.orderType || 'Online',
      status: order.statusName,
      statusMessage: mappedStatusMessage,
      dateOrdered: order.dateAdded
        ? new Date(order.dateAdded).toISOString().split('T')[0]
        : undefined,
      dateLastUpdated: order.dateModified
        ? new Date(order.dateModified).toISOString().split('T')[0]
        : undefined,
      currency: order.currencyCode,
      subtotal: order.subtotal,
      shippingCost: order.shippingTotal,
      discount: order.discountTotal,
      couponCode: order.couponCode || null,
      couponDiscount: order.couponDiscount || null,
      total: order.grandTotal,
      customerName:
        order.customerFirstName && order.customerLastName
          ? `${order.customerFirstName} ${order.customerLastName}`
          : null,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingMethod: order.shippingMethod || null,
      shippingAddress:
        shippingAddressParts.length > 0
          ? shippingAddressParts.join(', ')
          : null,
      shippingRecipient:
        order.shippingFirstName && order.shippingLastName
          ? `${order.shippingFirstName} ${order.shippingLastName}`
          : null,
      shippingCompany: order.shippingCompany || null,
      billingAddress:
        billingAddressParts.length > 0
          ? billingAddressParts.join(', ')
          : null,
      billingName:
        order.billingFirstName && order.billingLastName
          ? `${order.billingFirstName} ${order.billingLastName}`
          : null,
      billingCompany: order.billingCompany || null,
      paymentMethod: order.paymentMethod || null,
      products:
        order.products?.map((p) => ({
          productId: p.externalProductId,
          name: p.name,
          model: p.model,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          total: p.total,
          options: p.normalizedOptions || [],
        })) || [],
      historySummary:
        historySummary.length > 0 ? historySummary : ['No order updates.'],
      isReorder: !!order.reorderId,
      reorderId: order.reorderId || null,
      latestIssue: latestIssue
        ? this.statusMappingService.mapStatus(order.statusName, latestIssue)
        : null,
      requiresHumanReview: needsReview,
    };
  }
}
