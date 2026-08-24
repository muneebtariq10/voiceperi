/**
 * IOrderProvider — Interface for order data retrieval.
 *
 * Any ecommerce platform adapter (OpenCart, Shopify, WooCommerce, etc.)
 * must implement this interface to provide order data to VoicePeri services.
 */

export interface OrderLookupResult {
  found: boolean;
  order?: OrderData;
  message?: string;
}

export interface OrderData {
  orderId: number | string;
  orderType?: string;
  status: string;
  statusMessage?: string;
  dateOrdered?: string;
  dateLastUpdated?: string;
  currency?: string;
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  couponCode?: string | null;
  couponDiscount?: number | null;
  total?: number;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingMethod?: string | null;
  shippingAddress?: string | null;
  shippingRecipient?: string | null;
  shippingCompany?: string | null;
  billingAddress?: string | null;
  billingName?: string | null;
  billingCompany?: string | null;
  paymentMethod?: string | null;
  products?: OrderProductData[];
  historySummary?: string[];
  isReorder?: boolean;
  reorderId?: number | null;
  latestIssue?: string | null;
  requiresHumanReview?: boolean;
}

export interface OrderProductData {
  productId?: number | string;
  name: string;
  model?: string;
  quantity: number;
  unitPrice?: number;
  total?: number;
  options?: Array<{ name: string; value: string }>;
}

export interface OrderListResult {
  found: boolean;
  orders?: Array<{
    orderId: number | string;
    status: string;
    dateOrdered?: string;
    total?: number;
    productSummary?: string;
  }>;
  message?: string;
}

export interface CreateOrderPayload {
  customer?: {
    firstname: string;
    lastname: string;
    email: string;
    telephone?: string;
  };
  customer_id?: number;
  products: Array<{
    product_id: number;
    quantity?: number;
    options?: Array<{
      product_option_id?: number;
      product_option_value_id?: number;
      name?: string;
      value?: string;
      [key: string]: any;
    }>;
    parts?: string;
    color?: string;
    model?: string;
    [key: string]: any;
  }>;
  payment_address?: {
    address_1?: string;
    city?: string;
    postcode?: string;
    country_id?: number;
    zone_id?: number;
    [key: string]: any;
  };
  shipping_address?: {
    address_1?: string;
    city?: string;
    postcode?: string;
    country_id?: number;
    zone_id?: number;
    [key: string]: any;
  };
  shipping_method?: string;
  payment_method?: string;
  ip?: string;
  user_agent?: string;
  reorder_id?: number | string;
  source_order_id?: number | string;
  previous_order_id?: number | string;
  comment?: string;
  businessId?: string;
  [key: string]: any;
}

export interface CreateOrderResult {
  success: boolean;
  order?: OrderData;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export interface ReorderOperationResult {
  success: boolean;
  order?: OrderData & {
    source_order_id?: number | string;
    skipped_products?: Array<{
      product_id: number | string;
      quantity: number;
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export interface IOrderProvider {
  /**
   * Look up a single order by its ID.
   */
  getOrderById(orderId: number | string): Promise<OrderLookupResult>;

  /**
   * Look up orders by customer email address.
   * Returns a summary list of recent orders.
   */
  getOrdersByEmail(email: string): Promise<OrderListResult>;

  /**
   * Look up orders by customer email address, telephone number, or customer name.
   * Supports fallback searching when voice ASR transcription causes slight email typos.
   */
  getOrdersByCustomer(
    email?: string,
    phone?: string,
    name?: string,
  ): Promise<OrderListResult>;

  /**
   * Create a brand new order in the e-commerce engine (e.g. agentapi/order|insert).
   */
  createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult>;

  /**
   * Reorder a previous order by duplicating its line items at current live catalog prices (e.g. agentapi/order|reorder).
   */
  reorderPastOrder(
    sourceOrderId: number | string,
    comment?: string,
    customerId?: number,
    ip?: string,
    userAgent?: string,
  ): Promise<ReorderOperationResult>;

  /**
   * Check if the provider is available (API reachable).
   */
  isAvailable(): Promise<boolean>;
}
