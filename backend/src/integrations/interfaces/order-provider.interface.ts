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
   * Check if the provider is available (API reachable).
   */
  isAvailable(): Promise<boolean>;
}
