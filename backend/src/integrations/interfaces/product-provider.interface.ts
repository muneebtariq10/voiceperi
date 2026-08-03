/**
 * IProductProvider — Interface for product catalog retrieval.
 *
 * Any ecommerce platform adapter (OpenCart, Shopify, WooCommerce, etc.)
 * must implement this interface to provide product data to VoicePeri services.
 */

export interface ProductRecord {
  productId: string;
  name: string;
  description: string;
  price: string;
  sku: string;
  category: string;
  url: string;
  priceFrom?: boolean;
  minimumQuantity?: number;
  descriptionTruncated?: boolean;
}

export interface IProductProvider {
  /**
   * Fetch all products from the catalog.
   * Used for initial cache population and periodic sync.
   */
  fetchAllProducts(): Promise<ProductRecord[]>;

  /**
   * Check if the provider is available (API reachable).
   */
  isAvailable(): Promise<boolean>;
}
