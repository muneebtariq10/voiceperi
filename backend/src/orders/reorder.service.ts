import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { OpenCartOrderAdapter } from '../integrations/adapters';
import { ProductsService } from '../products/products.service';

export interface ReorderRequest {
  productId?: string;
  productName: string;
  quantity?: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  previousOrderId?: string | number;
  notes?: string;
  color?: string;
  parts?: string;
  shippingAddress?: string;
  company?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  billingStreetAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  ip?: string;
  userAgent?: string;
}

export interface ReorderResult {
  success: boolean;
  message: string;
  referenceId: string;
  liveOrderId?: number | string;
  skippedProducts?: Array<{ product_id: number | string; quantity: number }>;
}

// OpenCart US State → Zone ID Mapping (oc_zone table, country_id=223)
const US_STATE_ZONE_MAP: Record<string, number> = {
  'alabama': 3613, 'al': 3613,
  'alaska': 3614, 'ak': 3614,
  'arizona': 3615, 'az': 3615,
  'arkansas': 3616, 'ar': 3616,
  'california': 3617, 'ca': 3617,
  'colorado': 3618, 'co': 3618,
  'connecticut': 3619, 'ct': 3619,
  'delaware': 3620, 'de': 3620,
  'district of columbia': 3621, 'dc': 3621,
  'florida': 3622, 'fl': 3622,
  'georgia': 3623, 'ga': 3623,
  'hawaii': 3624, 'hi': 3624,
  'idaho': 3625, 'id': 3625,
  'illinois': 3626, 'il': 3626,
  'indiana': 3627, 'in': 3627,
  'iowa': 3628, 'ia': 3628,
  'kansas': 3629, 'ks': 3629,
  'kentucky': 3630, 'ky': 3630,
  'louisiana': 3631, 'la': 3631,
  'maine': 3632, 'me': 3632,
  'maryland': 3633, 'md': 3633,
  'massachusetts': 3634, 'ma': 3634,
  'michigan': 3635, 'mi': 3635,
  'minnesota': 3636, 'mn': 3636,
  'mississippi': 3637, 'ms': 3637,
  'missouri': 3638, 'mo': 3638,
  'montana': 3639, 'mt': 3639,
  'nebraska': 3640, 'ne': 3640,
  'nevada': 3641, 'nv': 3641,
  'new hampshire': 3642, 'nh': 3642,
  'new jersey': 3643, 'nj': 3643,
  'new mexico': 3644, 'nm': 3644,
  'new york': 3645, 'ny': 3645,
  'north carolina': 3646, 'nc': 3646,
  'north dakota': 3647, 'nd': 3647,
  'ohio': 3648, 'oh': 3648,
  'oklahoma': 3649, 'ok': 3649,
  'oregon': 3650, 'or': 3650,
  'pennsylvania': 3651, 'pa': 3651,
  'rhode island': 3652, 'ri': 3652,
  'south carolina': 3653, 'sc': 3653,
  'south dakota': 3654, 'sd': 3654,
  'tennessee': 3655, 'tn': 3655,
  'texas': 3656, 'tx': 3656,
  'utah': 3657, 'ut': 3657,
  'vermont': 3658, 'vt': 3658,
  'virginia': 3659, 'va': 3659,
  'washington': 3660, 'wa': 3660,
  'west virginia': 3661, 'wv': 3661,
  'wisconsin': 3662, 'wi': 3662,
  'wyoming': 3663, 'wy': 3663,
};

// OpenCart Shipping Extension Code Mapping (oc_extension table)
const SHIPPING_CODE_MAP: Record<string, { code: string; method_id: number }> = {
  'free': { code: 'free.free', method_id: 1 },
  'free shipping': { code: 'free.free', method_id: 1 },
  'ground': { code: 'ground.ground', method_id: 2 },
  'two day': { code: 'twoday.twoday', method_id: 3 },
  'next day': { code: 'nextday.nextday', method_id: 4 },
};

function resolveZoneId(stateInput?: string): number {
  if (!stateInput) return 0;
  const key = stateInput.trim().toLowerCase();
  return US_STATE_ZONE_MAP[key] || 0;
}

function resolveShippingCode(method: string): { code: string; method_id: number } {
  const key = method.trim().toLowerCase();
  return SHIPPING_CODE_MAP[key] || SHIPPING_CODE_MAP['ground'];
}

@Injectable()
export class ReorderService {
  private readonly logger = new Logger(ReorderService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly orderAdapter: OpenCartOrderAdapter,
    private readonly productsService: ProductsService,
  ) {}

  async captureReorder(request: ReorderRequest): Promise<ReorderResult> {
    let referenceId = `RO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    let liveOrderId: number | string | undefined = undefined;
    let customMessage: string | undefined = undefined;
    let skippedProducts: Array<{
      product_id: number | string;
      quantity: number;
    }> = [];

    this.logger.log(
      `📦 Processing order/reorder capture: ${request.productName} x${request.quantity || 1} for ${request.customerName} (${request.customerEmail}) via IP ${request.ip || 'unknown'}`,
    );

    let liveReorderSucceeded = false;

    // 1. Attempt Live Reorder API if a previousOrderId is provided and it is an un-modified identical reorder (agentapi/order|reorder)
    if (
      request.previousOrderId &&
      !request.quantity &&
      !request.shippingMethod &&
      !request.streetAddress
    ) {
      this.logger.log(
        `🔄 Identical Previous Order #${request.previousOrderId} detected! Executing live PrintEZ Agent reorder API...`,
      );
      try {
        const reorderRes = await this.orderAdapter.reorderPastOrder(
          request.previousOrderId,
          request.notes ||
            `Reorder via AI voice concierge for ${request.productName}`,
          undefined,
          request.ip,
          request.userAgent,
        );

        if (reorderRes.success && reorderRes.order) {
          liveOrderId = reorderRes.order.orderId;
          referenceId = String(liveOrderId);
          skippedProducts = reorderRes.order.skipped_products || [];
          liveReorderSucceeded = true;

          let skippedMsg = '';
          if (skippedProducts.length > 0) {
            skippedMsg = ` Note: ${skippedProducts.length} discontinued line item(s) from order #${request.previousOrderId} were excluded from the brand new order.`;
          }

          customMessage = `Great news! Your repeat order has been instantly created in our live PrintEZ catalog under new Order ID #${liveOrderId}! All line items have been re-priced at current catalog rates.${skippedMsg} Our operations team is forwarding your secure checkout payment link directly to ${request.customerEmail}.`;
          this.logger.log(
            `🎉 Live Reorder successful! Generated new order ID: ${liveOrderId}`,
          );
        } else {
          this.logger.warn(
            `Live Reorder API returned error (${reorderRes.error?.code}): ${reorderRes.error?.message}. Falling back to live order insertion with reorder_id...`,
          );
        }
      } catch (err) {
        this.logger.warn(
          `Error invoking live reorder API: ${err?.message}. Falling back to live order insertion with reorder_id...`,
        );
      }
    }

    // 2. If it is a new order, modified reorder, or if reorderPastOrder fallback was triggered, execute Live Order Insertion (agentapi/order|insert)
    if (!liveReorderSucceeded) {
      let numericProductId: number | undefined;
      let catalogUnitPrice: number | undefined;
      try {
        const pricingRes = await this.productsService.resolveProductPricing(
          request.productId,
          request.productName,
        );
        numericProductId = pricingRes.id;
        catalogUnitPrice = pricingRes.price;
      } catch (err) {
        this.logger.warn(
          `Failed resolving product ID/pricing for ${request.productId}: ${err?.message}`,
        );
      }

      if (
        !numericProductId &&
        request.productId &&
        /^\d+$/.test(String(request.productId).trim())
      ) {
        const fallbackId = parseInt(String(request.productId).trim(), 10);
        if (!isNaN(fallbackId) && fallbackId > 0) numericProductId = fallbackId;
      }

      if (numericProductId && numericProductId > 0) {
        this.logger.log(
          `🛒 Resolved OpenCart Product ID (${numericProductId}) for "${request.productName || request.productId}"! Executing live PrintEZ Agent Order Insertion API...`,
        );

        const numericQuantity =
          request.quantity && request.quantity > 0
            ? Number(request.quantity)
            : 1;

        // Calculate checkout pricing estimations (honoring package lot tiers vs individual items)
        let calcTotal: number | undefined = undefined;
        if (catalogUnitPrice && catalogUnitPrice > 0) {
          // If numericQuantity >= 50 (e.g., 100, 250, 500, 1000 check bundle lots), the catalog price is ALREADY the lot package price!
          // We only multiply if ordering individual retail units (< 50, e.g., 2 separate receipt books).
          const effectiveMultiplier =
            numericQuantity >= 50 ? 1 : numericQuantity;
          calcTotal = Number(
            (catalogUnitPrice * effectiveMultiplier).toFixed(2),
          );
        }

        // PrintEZ requires firstname and lastname when creating a new customer account via email
        const nameParts = (request.customerName || 'Valued Customer')
          .trim()
          .split(/\s+/);
        const firstname = nameParts[0] || 'Customer';
        const lastname =
          nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Order';

        // Build comprehensive order comment with all collected details and calculated checkout pricing
        const commentParts: string[] = [];
        commentParts.push(
          request.notes ||
            `Phone order placed by AI concierge for ${request.productName}`,
        );
        if (calcTotal !== undefined && catalogUnitPrice !== undefined) {
          commentParts.push(
            `Estimated Total: $${calcTotal.toFixed(2)} (${numericQuantity} unit(s) @ $${catalogUnitPrice.toFixed(2)})`,
          );
        }
        if (request.company) commentParts.push(`Company: ${request.company}`);
        if (request.parts) commentParts.push(`Parts: ${request.parts}`);
        if (request.color) commentParts.push(`Color: ${request.color}`);
        if (request.shippingMethod)
          commentParts.push(`Shipping Method: ${request.shippingMethod}`);
        if (request.paymentMethod)
          commentParts.push(`Payment Method: ${request.paymentMethod}`);

        const fullShipAddress =
          [
            request.streetAddress || request.shippingAddress,
            request.city,
            request.state,
            request.zipCode,
          ]
            .filter(Boolean)
            .join(', ') ||
          request.shippingAddress ||
          '';
        if (fullShipAddress)
          commentParts.push(`Shipping Address: ${fullShipAddress}`);

        const fullBillAddress = [
          request.billingStreetAddress,
          request.billingCity,
          request.billingState,
          request.billingZipCode,
        ]
          .filter(Boolean)
          .join(', ');
        if (fullBillAddress && fullBillAddress !== fullShipAddress) {
          commentParts.push(`Billing Address: ${fullBillAddress}`);
        }

        const orderComment = commentParts.join(' | ');
        const cleanShippingMethod = request.shippingMethod || 'Ground';
        const cleanPaymentMethod = request.paymentMethod || 'Credit Card';

        // Construct structured OpenCart shipping and payment addresses with embedded method names
        // Resolve OpenCart zone IDs for shipping and payment states
        const shippingZoneId = resolveZoneId(request.state);
        const billingZoneId = resolveZoneId(request.billingState || request.state);


        const shippingPayload = fullShipAddress
          ? {
              firstname,
              lastname,
              company: request.company || '',
              address_1:
                request.streetAddress ||
                request.shippingAddress ||
                fullShipAddress,
              city: request.city || '',
              postcode: request.zipCode || '',
              zone: request.state || '',
              zone_id: shippingZoneId,
              country: 'United States',
              country_id: 223,
              shipping_method: cleanShippingMethod,
            }
          : undefined;

        const paymentPayload = {
          firstname,
          lastname,
          company: request.company || '',
          address_1:
            request.billingStreetAddress ||
            request.streetAddress ||
            request.shippingAddress ||
            fullShipAddress,
          city: request.billingCity || request.city || '',
          postcode: request.billingZipCode || request.zipCode || '',
          zone: request.billingState || request.state || '',
          zone_id: billingZoneId,
          country: 'United States',
          country_id: 223,
          payment_method: cleanPaymentMethod,
        };

        const numericPreviousId = request.previousOrderId
          ? typeof request.previousOrderId === 'number'
            ? request.previousOrderId
            : parseInt(String(request.previousOrderId).replace(/\D/g, ''), 10)
          : undefined;

        // Build product options with real OpenCart numeric IDs from the live PrintEZ API
        // This ensures options are stored in oc_order_option (not silently dropped)
        const productOptions: Array<Record<string, any>> = [];
        let apiOptions: any[] = [];
        try {
          apiOptions = await this.productsService.getProductOptions(numericProductId);
        } catch (err) {
          this.logger.warn(`Could not fetch product options for #${numericProductId}: ${err?.message}`);
        }

        /**
         * matchOptionValue — Fuzzy-matches a customer's requested value (e.g. "3", "red", "blue")
         * against the live API option groups. Returns the matched { product_option_id, product_option_value_id, name, value, type, price }.
         */
        const matchOptionValue = (
          requestedName: string,
          requestedValue: string,
        ): Record<string, any> | null => {
          const normalizedName = requestedName.toLowerCase().trim();
          const normalizedValue = requestedValue.toLowerCase().trim();

          for (const optGroup of apiOptions) {
            const groupName = String(optGroup.name || '').toLowerCase();
            // Match by option group name (e.g., "1 Part" contains "part", "Color" contains "color")
            const nameMatches =
              groupName.includes(normalizedName) ||
              normalizedName.includes(groupName.replace(/^\d+\s*/, '')) ||
              (normalizedName.includes('part') && groupName.includes('part')) ||
              (normalizedName.includes('color') && groupName.includes('color')) ||
              (normalizedName.includes('quantity') && groupName.includes('quantity')) ||
              (normalizedName.includes('qty') && groupName.includes('qty'));

            if (nameMatches && Array.isArray(optGroup.values)) {
              for (const val of optGroup.values) {
                const valName = String(val.name || '').toLowerCase().trim();
                if (
                  valName === normalizedValue ||
                  valName.includes(normalizedValue) ||
                  normalizedValue.includes(valName)
                ) {
                  this.logger.log(
                    `🎯 Matched option "${requestedName}=${requestedValue}" → product_option_id=${optGroup.product_option_id}, product_option_value_id=${val.product_option_value_id} (price: $${val.price})`,
                  );
                  return {
                    product_option_id: optGroup.product_option_id,
                    product_option_value_id: val.product_option_value_id,
                    name: optGroup.name,
                    value: val.name,
                    type: optGroup.type || 'select',
                    price: val.price || 0,
                  };
                }
              }
              // If no exact value match but group matched, use first value as fallback
              if (optGroup.values.length > 0) {
                const firstVal = optGroup.values[0];
                this.logger.warn(
                  `⚠️ Option "${requestedName}=${requestedValue}" matched group "${optGroup.name}" but no exact value match. Using first value: "${firstVal.name}" (price: $${firstVal.price})`,
                );
                return {
                  product_option_id: optGroup.product_option_id,
                  product_option_value_id: firstVal.product_option_value_id,
                  name: optGroup.name,
                  value: firstVal.name,
                  type: optGroup.type || 'select',
                  price: firstVal.price || 0,
                };
              }
            }
          }
          return null;
        };

        // Resolve "Parts" option (e.g., customer says "3 parts" → product_option_value_id for "3")
        if (request.parts) {
          const matched = matchOptionValue('Parts', String(request.parts));
          if (matched) {
            productOptions.push(matched);
          } else {
            // Fallback: send human-readable option (will be in comment, but may not save to oc_order_option)
            productOptions.push({
              name: 'Parts',
              value: String(request.parts),
              type: 'select',
            });
          }
        }

        // Resolve "Color" option
        if (request.color) {
          const matched = matchOptionValue('Color', String(request.color));
          if (matched) {
            productOptions.push(matched);
          } else {
            productOptions.push({
              name: 'Color',
              value: String(request.color),
              type: 'select',
            });
          }
        }

        // Resolve "Quantity" / "Qty" option
        if (
          numericQuantity > 1 &&
          !productOptions.some(
            (o) =>
              String(o.name || '').toLowerCase().includes('quantity') ||
              String(o.name || '').toLowerCase().includes('qty'),
          )
        ) {
          const matched = matchOptionValue('Quantity', String(numericQuantity));
          if (matched) {
            productOptions.push(matched);
          } else {
            productOptions.push({
              name: 'Quantity Tier',
              value: String(numericQuantity),
              type: 'select',
            });
          }
        }

        // Notes are always free-text (no API lookup needed)
        if (request.notes) {
          productOptions.push({
            name: 'Customization Notes',
            value: String(request.notes),
            type: 'text',
          });
        }

        // --- REAL-TIME OPENCART FINANCIAL CALCULATION ENGINE (SHIPPING & TAX MATH) ---
        let shippingTitle = cleanShippingMethod;
        let shippingFee = 0;
        let taxFee = 0;
        let taxTitle = 'Tax';
        let finalOrderTotal = calcTotal;

        if (calcTotal !== undefined) {
          const destStateStr = String(
            request.state || request.shippingAddress || request.city || '',
          ).trim();
          const isAlaskaHawaii = /\b(ak|alaska|hi|hawaii)\b/i.test(
            destStateStr,
          );

          const lowerMethod = cleanShippingMethod.toLowerCase();
          if (
            !isAlaskaHawaii &&
            (lowerMethod.includes('free') ||
              (lowerMethod.includes('ground') && calcTotal >= 150))
          ) {
            shippingTitle = 'Free Shipping';
            shippingFee = 0.0;
          } else if (
            isAlaskaHawaii ||
            lowerMethod.includes('two') ||
            lowerMethod.includes('2')
          ) {
            shippingTitle = 'Two day';
            shippingFee = Math.max(55.0, Number((calcTotal * 0.65).toFixed(2)));
          } else if (
            lowerMethod.includes('next') ||
            lowerMethod.includes('air') ||
            lowerMethod.includes('overnight') ||
            lowerMethod.includes('express')
          ) {
            shippingTitle = 'Next day';
            shippingFee = Math.max(79.99, Number((calcTotal * 0.8).toFixed(2)));
          } else {
            // Default Standard Ground Shipping (17% of subtotal, $11.99 minimum) for 48 contiguous states
            shippingTitle = 'Ground';
            shippingFee = Math.max(
              11.99,
              Number((calcTotal * 0.17).toFixed(2)),
            );
          }

          // Verified New York State Sales Tax Rate (8.25% of item sub-total) using exact word boundaries to prevent substring bugs (e.g. Sunnyvale)
          if (/\b(ny|new\s*york)\b/i.test(destStateStr)) {
            taxFee = Number((calcTotal * 0.0825).toFixed(2));
            taxTitle = 'NY Sales Tax (8.25%)';
          }

          finalOrderTotal = Number(
            (calcTotal + shippingFee + taxFee).toFixed(2),
          );
          this.logger.log(
            `🧮 Calculated OpenCart Totals — Sub-Total: $${calcTotal.toFixed(2)}, Shipping (${shippingTitle}): $${shippingFee.toFixed(2)}, Tax (${taxTitle}): $${taxFee.toFixed(2)} => Total: $${finalOrderTotal.toFixed(2)}`,
          );
        }

        // Resolve OpenCart shipping extension code and method ID (after shippingTitle is finalized)
        const shippingCodeInfo = resolveShippingCode(shippingTitle);

        try {
          const createRes = await this.orderAdapter.createOrder({
            customer: {
              firstname,
              lastname,
              email: request.customerEmail,
              telephone: request.customerPhone || '555-0000',
            },
            products: [
              {
                product_id: numericProductId,
                quantity: 1, // Supervisor directive: Always pass 1 root lot package to prevent OpenCart 100x/250x overcharges
                ...(catalogUnitPrice !== undefined
                  ? { price: catalogUnitPrice, total: calcTotal }
                  : {}),
                options: productOptions,
                parts: request.parts || undefined,
                color: request.color || undefined,
              },
            ],
            ...(shippingPayload ? { shipping_address: shippingPayload } : {}),
            payment_address: paymentPayload,
            shipping_method: cleanShippingMethod,
            shipping_code: shippingCodeInfo.code,
            shiping_method_id: shippingCodeInfo.method_id,
            payment_method: cleanPaymentMethod,
            payment_code: 'cod',
            ...(calcTotal !== undefined
              ? {
                  sub_total: calcTotal,
                  total: finalOrderTotal,
                  totals: [
                    {
                      code: 'sub_total',
                      title: 'Sub-Total',
                      value: calcTotal,
                      sort_order: 1,
                    },
                    {
                      code: 'shipping',
                      title: shippingTitle,
                      value: shippingFee,
                      sort_order: 2,
                    },
                    {
                      code: 'tax',
                      title: taxTitle,
                      value: taxFee,
                      sort_order: 3,
                    },
                    {
                      code: 'total',
                      title: 'Total',
                      value: finalOrderTotal!,
                      sort_order: 4,
                    },
                  ],
                }
              : {}),
            // --- OpenCart metadata fields ---
            type: numericPreviousId ? 'By Call' : 'By Call',
            language_id: 1,
            currency_id: 2,
            currency_code: 'USD',
            currency_value: 1.00000000,
            store_id: 0,
            store_name: 'PrintEZ.com',
            store_url: 'https://www.printez.com/',
            ip: request.ip || '127.0.0.1',
            forwarded_ip: request.ip || '127.0.0.1',
            user_agent:
              request.userAgent ||
              'VoicePeri AI Telephony Concierge / PrintEZ Assistant',
            ...(numericPreviousId && !isNaN(numericPreviousId)
              ? {
                  reorder_id: numericPreviousId,
                  source_order_id: numericPreviousId,
                  previous_order_id: numericPreviousId,
                }
              : {}),
            comment: orderComment,
          } as any);

          if (createRes.success && createRes.order) {
            liveOrderId = createRes.order.orderId;
            referenceId = String(liveOrderId);
            const priceText =
              calcTotal !== undefined
                ? ` with an estimated total of $${calcTotal.toFixed(2)} (${numericQuantity} @ $${catalogUnitPrice?.toFixed(2)} each)`
                : '';
            customMessage = request.previousOrderId
              ? `Great news! Your repeat order (based on previous order #${request.previousOrderId}) has been registered in our live PrintEZ catalog under official Order ID #${liveOrderId}${priceText}. Our team will email your secure checkout link directly to ${request.customerEmail}!`
              : `Excellent! Your order for ${request.productName} has been directly registered in our live PrintEZ catalog under official Order ID #${liveOrderId}${priceText}. Our team will email your secure checkout link directly to ${request.customerEmail}!`;
            this.logger.log(
              `🎉 Live New Order insertion successful! Generated Order ID: ${liveOrderId} (Reorder Source: ${numericPreviousId || 'none'})`,
            );
          } else {
            this.logger.warn(
              `Live Order Insertion API returned error (${createRes.error?.code}): ${createRes.error?.message}. Falling back to manual capture...`,
            );
          }
        } catch (err) {
          this.logger.warn(
            `Error invoking live order insertion API: ${err?.message}. Falling back to manual capture.`,
          );
        }
      }
    }

    // 3. Send notification to PrintEZ operations team
    try {
      await this.sendOperationsNotification(
        request,
        referenceId,
        liveOrderId,
        skippedProducts,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send operations notification for ${referenceId}`,
        error?.stack,
      );
    }

    // 4. Send confirmation email directly to customer
    try {
      await this.sendCustomerConfirmation(
        request,
        referenceId,
        liveOrderId,
        customMessage,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send customer confirmation for ${referenceId}`,
        error?.stack,
      );
    }

    const finalMessage =
      customMessage ||
      `Your reorder request for ${request.productName} has been recorded with reference ID ${referenceId}. Our order processing team will verify your account details and send a checkout confirmation link directly to ${request.customerEmail}.`;

    return {
      success: true,
      message: finalMessage,
      referenceId,
      ...(liveOrderId ? { liveOrderId, skippedProducts } : {}),
    };
  }

  private async sendOperationsNotification(
    request: ReorderRequest,
    referenceId: string,
    liveOrderId?: number | string,
    skippedProducts?: Array<any>,
  ) {
    const operationsEmail =
      process.env.PRINTEZ_OPERATIONS_EMAIL || 'orders@printez.com';

    const subject = `🔄 Voice Agent Order/Reorder ${referenceId} — ${request.productName}`;

    const skippedHtml =
      skippedProducts && skippedProducts.length > 0
        ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #d9534f;">Skipped Discontinued Items</td><td style="padding: 8px; border: 1px solid #ddd; color: #d9534f;">${JSON.stringify(skippedProducts)}</td></tr>`
        : '';

    const html = `
      <h2>New Order/Reorder Request from Voice Agent</h2>
      <p style="color: green; font-weight: bold;">${liveOrderId ? `⚡ PROCESSED LIVE VIA PRINTEZ AGENT API — OFFICIAL ORDER ID: #${liveOrderId}` : '⚠️ RECORDED FOR MANUAL CHECKOUT DISPATCH'}</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Reference / Order ID</td><td style="padding: 8px; border: 1px solid #ddd;">${referenceId}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Product</td><td style="padding: 8px; border: 1px solid #ddd;">${request.productName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Item/Model #</td><td style="padding: 8px; border: 1px solid #ddd;">${request.productId || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Quantity</td><td style="padding: 8px; border: 1px solid #ddd;">${request.quantity || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Name</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerName}</td></tr>
        ${request.company ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Company</td><td style="padding: 8px; border: 1px solid #ddd;">${request.company}</td></tr>` : ''}
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Email</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerEmail}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer Phone</td><td style="padding: 8px; border: 1px solid #ddd;">${request.customerPhone || 'Not provided'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Previous Order ID</td><td style="padding: 8px; border: 1px solid #ddd;">${request.previousOrderId || 'N/A (new order)'}</td></tr>
        ${request.parts ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Parts</td><td style="padding: 8px; border: 1px solid #ddd;">${request.parts}</td></tr>` : ''}
        ${request.color ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Color</td><td style="padding: 8px; border: 1px solid #ddd;">${request.color}</td></tr>` : ''}
        ${request.shippingMethod ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Shipping Method</td><td style="padding: 8px; border: 1px solid #ddd;">${request.shippingMethod}</td></tr>` : ''}
        ${request.paymentMethod ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Method</td><td style="padding: 8px; border: 1px solid #ddd;">${request.paymentMethod}</td></tr>` : ''}
        ${request.streetAddress || request.shippingAddress ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Shipping Address</td><td style="padding: 8px; border: 1px solid #ddd;">${[request.streetAddress || request.shippingAddress, request.city, request.state, request.zipCode].filter(Boolean).join(', ')}</td></tr>` : ''}
        ${request.billingStreetAddress ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Billing Address</td><td style="padding: 8px; border: 1px solid #ddd;">${[request.billingStreetAddress, request.billingCity, request.billingState, request.billingZipCode].filter(Boolean).join(', ')}</td></tr>` : ''}
        ${skippedHtml}
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Notes</td><td style="padding: 8px; border: 1px solid #ddd;">${request.notes || 'None'}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666;">This order was captured by the VoicePeri AI Voice Agent during a live customer call. Please ensure the customer completes payment via their secure checkout link.</p>
    `;

    await this.mailerService.sendMail({
      to: operationsEmail,
      subject,
      html,
    });

    this.logger.log(
      `✅ Operations notification sent to ${operationsEmail} for ${referenceId}`,
    );
  }

  private async sendCustomerConfirmation(
    request: ReorderRequest,
    referenceId: string,
    liveOrderId?: number | string,
    customMessage?: string,
  ) {
    const subject = `PrintEZ Order/Reorder Confirmation — #${referenceId}`;

    const html = `
      <h2>Thank you for your order, ${request.customerName}!</h2>
      <p>${customMessage || `We have received your reorder request for <strong>${request.productName}</strong>.`}</p>
      <p><strong>Official Order/Reference ID:</strong> #${referenceId}</p>
      <p><strong>Product:</strong> ${request.productName}</p>
      <p><strong>Quantity:</strong> ${request.quantity || '1'}</p>
      ${request.company ? `<p><strong>Company:</strong> ${request.company}</p>` : ''}
      ${request.parts ? `<p><strong>Parts:</strong> ${request.parts}</p>` : ''}
      ${request.color ? `<p><strong>Color:</strong> ${request.color}</p>` : ''}
      ${request.shippingMethod ? `<p><strong>Shipping Method:</strong> ${request.shippingMethod}</p>` : ''}
      ${request.paymentMethod ? `<p><strong>Payment Method:</strong> ${request.paymentMethod}</p>` : ''}
      ${request.streetAddress || request.shippingAddress ? `<p><strong>Shipping Address:</strong> ${[request.streetAddress || request.shippingAddress, request.city, request.state, request.zipCode].filter(Boolean).join(', ')}</p>` : ''}
      ${request.billingStreetAddress ? `<p><strong>Billing Address:</strong> ${[request.billingStreetAddress, request.billingCity, request.billingState, request.billingZipCode].filter(Boolean).join(', ')}</p>` : ''}
      <hr style="border: none; border-top: 1px solid #eee; my: 16px;" />
      <p>Our order processing engine will verify your order options and forward your secure payment link directly to your inbox so you can finalize checkout.</p>
      <p>If you have questions, simply reply to this email or call us at <strong>+1 845-782-5832</strong>.</p>
      <p>Thank you for choosing PrintEZ!</p>
    `;

    await this.mailerService.sendMail({
      to: request.customerEmail,
      subject,
      html,
    });

    this.logger.log(
      `✅ Customer confirmation sent to ${request.customerEmail} for #${referenceId}`,
    );
  }
}
