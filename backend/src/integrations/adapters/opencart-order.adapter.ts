import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order';
import {
  IOrderProvider,
  OrderLookupResult,
  OrderListResult,
  OrderData,
  OrderProductData,
  CreateOrderPayload,
  CreateOrderResult,
  ReorderOperationResult,
} from '../interfaces';
import { OrderStatusMappingService } from '../../orders/order-status-mapping.service';

/**
 * OpenCartOrderAdapter — Retrieves and creates order data for PrintEZ via live OpenCart Agent API.
 *
 * Handles three live endpoints:
 * 1. Get an order — agentapi/order|get&order_id=12345
 * 2. Create a new order — agentapi/order|insert
 * 3. Reorder a past order — agentapi/order|reorder
 *
 * Includes seamless fallback to local database repository for test orders and network resilience.
 */
@Injectable()
export class OpenCartOrderAdapter implements IOrderProvider {
  private readonly logger = new Logger(OpenCartOrderAdapter.name);

  private readonly baseUrl =
    'https://www.printez.com/index.php?route=agentapi/order';

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly statusMappingService: OrderStatusMappingService,
  ) {}

  private getAuthHeaders() {
    const token =
      process.env.PRINTEZ_API_KEY ||
      process.env.AGENT_API_TOKEN ||
      '5c4faefcfc742ee848f1aa2f385f237aec5e70c6fcd7d5b3c8e082e426c51b54';
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

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

    this.logger.log(
      `🌐 Querying live PrintEZ Agent API for Order #${numericOrderId}...`,
    );

    // 1. Attempt fetching directly from live PrintEZ Agent API (agentapi/order|get)
    try {
      const response = await fetch(
        `${this.baseUrl}|get&order_id=${numericOrderId}`,
        { headers: { Authorization: this.getAuthHeaders().Authorization } },
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.order) {
          this.logger.log(
            `✅ Successfully retrieved live Order #${numericOrderId} from PrintEZ API`,
          );
          return {
            found: true,
            order: this.formatLiveOrder(data.order),
          };
        }
      } else {
        this.logger.warn(
          `Live API query for Order #${numericOrderId} returned HTTP ${response.status}. Checking local database fallback...`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Error connecting to live PrintEZ Order API: ${error?.message}. Checking local database fallback...`,
      );
    }

    // 2. Fallback: query local database (seeded from JSON / offline support)
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

    this.logger.log(
      `📦 Order #${numericOrderId} found in local database repository.`,
    );
    return {
      found: true,
      order: this.formatOrder(order),
    };
  }

  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    this.logger.log(
      `🛒 Creating brand new order via PrintEZ live Agent API (agentapi/order|insert)...`,
    );

    try {
      const response = await fetch(`${this.baseUrl}|insert`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (
        (response.status === 201 || response.status === 200) &&
        data &&
        data.success &&
        data.order
      ) {
        this.logger.log(
          `🎉 Live Order #${data.order.order_id} created successfully via Agent API!`,
        );
        return {
          success: true,
          order: this.formatLiveOrder(data.order),
          message: `Order successfully placed with PrintEZ reference ID #${data.order.order_id}.`,
        };
      }

      const errorCode = data?.error?.code || `HTTP_${response.status}`;
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        'Failed to process new order insertion on PrintEZ server.';

      this.logger.error(
        `❌ PrintEZ API Order Insertion Error [${errorCode}]: ${errorMessage}`,
      );
      return {
        success: false,
        error: { code: errorCode, message: errorMessage },
        message: errorMessage,
      };
    } catch (error) {
      this.logger.error(
        `❌ Network error while creating PrintEZ order: ${error?.message}`,
        error?.stack,
      );
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error?.message || 'Network communication error.',
        },
        message: 'Unable to communicate with PrintEZ servers at this time.',
      };
    }
  }

  async reorderPastOrder(
    sourceOrderId: number | string,
    comment?: string,
    customerId?: number,
    ip?: string,
    userAgent?: string,
  ): Promise<ReorderOperationResult> {
    const numericSourceId =
      typeof sourceOrderId === 'number'
        ? sourceOrderId
        : parseInt(String(sourceOrderId).replace(/\D/g, ''), 10);

    this.logger.log(
      `🔄 Processing live repeat order (reorder) against Source Order #${numericSourceId} via PrintEZ Agent API...`,
    );

    const requestBody: Record<string, any> = {
      source_order_id: numericSourceId,
      comment:
        comment || 'Repeat order placed via VoicePeri AI voice concierge',
      ip: ip || '127.0.0.1',
      user_agent:
        userAgent || 'VoicePeri AI Telephony Concierge / PrintEZ Assistant',
    };

    if (customerId && !isNaN(customerId)) {
      requestBody.customer_id = customerId;
    }

    try {
      const response = await fetch(`${this.baseUrl}|reorder`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      const data = await response.json().catch(() => null);

      if (
        (response.status === 201 || response.status === 200) &&
        data &&
        data.success &&
        data.order
      ) {
        const newOrderId = data.order.order_id;
        const skipped = data.order.skipped_products || [];
        this.logger.log(
          `🚀 Live Reorder created! New Order ID #${newOrderId} generated from Source #${numericSourceId}. Skipped discontinued products count: ${skipped.length}`,
        );

        const mappedOrder = this.formatLiveOrder(data.order);
        return {
          success: true,
          order: {
            ...mappedOrder,
            source_order_id: numericSourceId,
            skipped_products: skipped,
          },
          message: `Repeat order successfully generated under brand new Order #${newOrderId}!`,
        };
      }

      const errorCode = data?.error?.code || `HTTP_${response.status}`;
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        `Could not reorder from source order #${numericSourceId}.`;

      this.logger.error(
        `❌ PrintEZ API Reorder Error [${errorCode}]: ${errorMessage}`,
      );
      return {
        success: false,
        error: { code: errorCode, message: errorMessage },
        message: errorMessage,
      };
    } catch (error) {
      this.logger.error(
        `❌ Network error while processing reorder for source #${numericSourceId}: ${error?.message}`,
        error?.stack,
      );
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error?.message || 'Network error during reorder API call.',
        },
        message: 'Unable to communicate with PrintEZ servers for reordering.',
      };
    }
  }

  async getOrdersByCustomer(
    email?: string,
    phone?: string,
    name?: string,
  ): Promise<OrderListResult> {
    if (!email && !phone && !name) {
      return {
        found: false,
        message:
          'Please provide an email address, contact phone number, or customer name to search for orders.',
      };
    }

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.products', 'products')
      .orderBy('order.dateAdded', 'DESC')
      .take(10);

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (email && email.trim().length >= 3) {
      const normalizedEmail = email
        .toLowerCase()
        .trim()
        .replace(/\s+at\s+/g, '@')
        .replace(/\s+dot\s+/g, '.');
      conditions.push('order.customerEmailNormalized = :email');
      parameters.email = normalizedEmail;

      const localPart = normalizedEmail.split('@')[0];
      if (localPart && localPart.length >= 4) {
        conditions.push('LOWER(order.customerEmail) LIKE :emailPrefix');
        parameters.emailPrefix = `${localPart.slice(0, 4)}%`;
      }
    }

    if (phone) {
      const normalizedPhone = phone
        .toString()
        .toLowerCase()
        .replace(/\bzero\b/gi, '0')
        .replace(/\bone\b/gi, '1')
        .replace(/\btwo\b/gi, '2')
        .replace(/\bthree\b/gi, '3')
        .replace(/\bfour\b/gi, '4')
        .replace(/\bfive\b/gi, '5')
        .replace(/\bsix\b/gi, '6')
        .replace(/\bseven\b/gi, '7')
        .replace(/\beight\b/gi, '8')
        .replace(/\bnine\b/gi, '9');
      const digits = normalizedPhone.replace(/\D/g, '');
      if (digits.length >= 4) {
        const last4 = digits.slice(-4);
        conditions.push(
          '(order.customerPhoneLast4 = :last4 OR order.customerPhone LIKE :phonePattern)',
        );
        parameters.last4 = last4;
        parameters.phonePattern = `%${last4}%`;
      }
    }

    if (name && name.trim().length >= 3) {
      const cleanName = name
        .trim()
        .toLowerCase()
        .replace(/\bsonny\b/gi, 'saleh')
        .replace(/\bsahli\b/gi, 'saleh');
      const words = cleanName.split(/\s+/).filter((w) => w.length >= 2);
      words.forEach((word, idx) => {
        const paramName = `nameWord_${idx}`;
        const prefixParam = `namePrefix_${idx}`;
        conditions.push(
          `(LOWER(order.customerFirstName) LIKE :${paramName} OR LOWER(order.customerLastName) LIKE :${paramName} OR LOWER(order.shippingCompany) LIKE :${paramName} OR LOWER(order.customerFirstName) LIKE :${prefixParam})`,
        );
        parameters[paramName] = `%${word}%`;
        parameters[prefixParam] = `${word.slice(0, 3)}%`;
      });
    }

    if (conditions.length === 0) {
      return {
        found: false,
        message:
          'Please provide a valid email, phone number (at least 4 digits), or customer name.',
      };
    }

    qb.where(`(${conditions.join(' OR ')})`, parameters);

    const orders = await qb.getMany();

    if (!orders || orders.length === 0) {
      return {
        found: false,
        message:
          'No previous orders found matching the provided email, phone number, or customer name.',
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

  async getOrdersByEmail(email: string): Promise<OrderListResult> {
    return this.getOrdersByCustomer(email);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}|get&order_id=0`, {
        headers: { Authorization: this.getAuthHeaders().Authorization },
      });
      // A 400 (missing/bad ID) or 404 (not found) confirms the server endpoint is active and reachable
      return (
        response.status === 200 ||
        response.status === 400 ||
        response.status === 404
      );
    } catch {
      try {
        const count = await this.orderRepository.count();
        return count >= 0;
      } catch {
        return false;
      }
    }
  }

  /**
   * Transforms a live PrintEZ Agent API JSON order object into standardized OrderData.
   */
  private formatLiveOrder(apiOrder: any): OrderData {
    const historySummary: string[] = [];
    let latestIssue: string | null = null;
    let needsReview = false;

    if (Array.isArray(apiOrder.history)) {
      for (const h of apiOrder.history) {
        const commentStr = String(h.comment || '');
        if (commentStr && commentStr.includes('Address not found')) {
          latestIssue = 'Address not found or not deliverable';
        }
        if (h.order_status || commentStr) {
          const dateStr = h.date_added
            ? String(h.date_added).split(' ')[0]
            : '';
          historySummary.push(
            `${dateStr}: ${h.order_status || ''} ${commentStr}`.trim(),
          );
        }
      }
    }

    const statusName =
      apiOrder.order_status ||
      (apiOrder.order_status_id === 0
        ? 'Pending (Awaiting Payment)'
        : 'Unknown');
    const mappedStatusMessage = this.statusMappingService.mapStatus(
      statusName,
      latestIssue,
    );

    if (statusName === 'TESTING' || statusName === 'Pending' || latestIssue) {
      needsReview = true;
    }

    const customer = apiOrder.customer || {};
    const shipping = apiOrder.shipping || {};
    const payment = apiOrder.payment || {};

    const shippingAddressParts = [
      shipping.address_1,
      shipping.city,
      shipping.zone,
      shipping.postcode,
      shipping.country,
    ].filter((p) => p && String(p).trim() !== '');

    const billingAddressParts = [
      payment.address_1,
      payment.city,
      payment.zone,
      payment.postcode,
      payment.country,
    ].filter((p) => p && String(p).trim() !== '');

    const products: OrderProductData[] = (apiOrder.products || []).map(
      (p: any) => ({
        productId: p.product_id,
        name: p.name || 'Unknown Product',
        model: p.model || undefined,
        quantity: Number(p.quantity) || 1,
        unitPrice: Number(p.price) || 0,
        total: Number(p.total) || 0,
        options: (p.options || []).map((o: any) => ({
          name: o.name || 'Option',
          value: String(o.value || ''),
        })),
      }),
    );

    let subtotal = 0;
    let shippingCost = 0;
    if (Array.isArray(apiOrder.totals)) {
      for (const t of apiOrder.totals) {
        if (t.code === 'sub_total' || t.code === 'subtotal')
          subtotal = Number(t.value) || 0;
        if (t.code === 'shipping') shippingCost = Number(t.value) || 0;
      }
    }

    const computedSubtotal =
      subtotal || products.reduce((acc, p) => acc + (p.total || 0), 0);

    return {
      orderId: apiOrder.order_id,
      orderType: apiOrder.type || 'Online',
      status: statusName,
      statusMessage: mappedStatusMessage,
      dateOrdered: apiOrder.date_added
        ? String(apiOrder.date_added).split(' ')[0]
        : undefined,
      dateLastUpdated: apiOrder.date_modified
        ? String(apiOrder.date_modified).split(' ')[0]
        : undefined,
      currency: apiOrder.currency_code || 'USD',
      subtotal: computedSubtotal,
      shippingCost,
      discount: 0,
      total: Number(apiOrder.total) || 0,
      customerName:
        customer.firstname && customer.lastname
          ? `${customer.firstname} ${customer.lastname}`
          : null,
      customerEmail: customer.email || null,
      customerPhone: customer.telephone || null,
      shippingMethod: shipping.method || null,
      shippingAddress:
        shippingAddressParts.length > 0
          ? shippingAddressParts.join(', ')
          : null,
      shippingRecipient:
        shipping.firstname && shipping.lastname
          ? `${shipping.firstname} ${shipping.lastname}`
          : null,
      shippingCompany: shipping.company || null,
      billingAddress:
        billingAddressParts.length > 0 ? billingAddressParts.join(', ') : null,
      billingName:
        payment.firstname && payment.lastname
          ? `${payment.firstname} ${payment.lastname}`
          : null,
      billingCompany: payment.company || null,
      paymentMethod: payment.method || null,
      products,
      historySummary:
        historySummary.length > 0
          ? historySummary
          : ['Order recorded in live PrintEZ catalog.'],
      isReorder:
        (apiOrder.reorder_id && Number(apiOrder.reorder_id) > 0) ||
        apiOrder.type === 'Reorder',
      reorderId: apiOrder.reorder_id ? Number(apiOrder.reorder_id) : null,
      latestIssue: latestIssue
        ? this.statusMappingService.mapStatus(statusName, latestIssue)
        : null,
      requiresHumanReview: needsReview,
    };
  }

  /**
   * Format a database Order entity into standardized OrderData shape.
   */
  private formatOrder(order: Order): OrderData {
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

    const shippingAddressParts = [
      order.shippingAddress1,
      order.shippingAddress2,
      order.shippingCity,
      order.shippingZone,
      order.shippingPostcode,
      order.shippingCountry,
    ].filter((p) => p && p.trim() !== '');

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
        billingAddressParts.length > 0 ? billingAddressParts.join(', ') : null,
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
