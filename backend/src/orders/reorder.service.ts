import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  OpenCartOrderAdapter,
  ShopifyOrderAdapter,
} from '../integrations/adapters';
import { ProductsService } from '../products/products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent';
import { BusinessInformation } from '../entities/business_information';
import { BrandConfig } from '../config/brand.config';

export interface ReorderRequest {
  agentId?: string;
  callId?: string;
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
  alabama: 3613,
  al: 3613,
  alaska: 3614,
  ak: 3614,
  arizona: 3615,
  az: 3615,
  arkansas: 3616,
  ar: 3616,
  california: 3617,
  ca: 3617,
  colorado: 3618,
  co: 3618,
  connecticut: 3619,
  ct: 3619,
  delaware: 3620,
  de: 3620,
  'district of columbia': 3621,
  dc: 3621,
  florida: 3622,
  fl: 3622,
  georgia: 3623,
  ga: 3623,
  hawaii: 3624,
  hi: 3624,
  idaho: 3625,
  id: 3625,
  illinois: 3626,
  il: 3626,
  indiana: 3627,
  in: 3627,
  iowa: 3628,
  ia: 3628,
  kansas: 3629,
  ks: 3629,
  kentucky: 3630,
  ky: 3630,
  louisiana: 3631,
  la: 3631,
  maine: 3632,
  me: 3632,
  maryland: 3633,
  md: 3633,
  massachusetts: 3634,
  ma: 3634,
  michigan: 3635,
  mi: 3635,
  minnesota: 3636,
  mn: 3636,
  mississippi: 3637,
  ms: 3637,
  missouri: 3638,
  mo: 3638,
  montana: 3639,
  mt: 3639,
  nebraska: 3640,
  ne: 3640,
  nevada: 3641,
  nv: 3641,
  'new hampshire': 3642,
  nh: 3642,
  'new jersey': 3643,
  nj: 3643,
  'new mexico': 3644,
  nm: 3644,
  'new york': 3645,
  ny: 3645,
  'north carolina': 3646,
  nc: 3646,
  'north dakota': 3647,
  nd: 3647,
  ohio: 3648,
  oh: 3648,
  oklahoma: 3649,
  ok: 3649,
  oregon: 3650,
  or: 3650,
  pennsylvania: 3651,
  pa: 3651,
  'rhode island': 3652,
  ri: 3652,
  'south carolina': 3653,
  sc: 3653,
  'south dakota': 3654,
  sd: 3654,
  tennessee: 3655,
  tn: 3655,
  texas: 3656,
  tx: 3656,
  utah: 3657,
  ut: 3657,
  vermont: 3658,
  vt: 3658,
  virginia: 3659,
  va: 3659,
  washington: 3660,
  wa: 3660,
  'west virginia': 3661,
  wv: 3661,
  wisconsin: 3662,
  wi: 3662,
  wyoming: 3663,
  wy: 3663,
};

// OpenCart Shipping Extension Code Mapping (oc_extension table)
const SHIPPING_CODE_MAP: Record<string, { code: string; method_id: number }> = {
  free: { code: 'free.free', method_id: 1 },
  'free shipping': { code: 'free.free', method_id: 1 },
  ground: { code: 'ground.ground', method_id: 2 },
  'two day': { code: 'twoday.twoday', method_id: 3 },
  'next day': { code: 'nextday.nextday', method_id: 4 },
};

function resolveZoneId(stateInput?: string): number {
  if (!stateInput) return 0;
  const key = stateInput.trim().toLowerCase();
  return US_STATE_ZONE_MAP[key] || 0;
}

function resolveShippingCode(method: string): {
  code: string;
  method_id: number;
} {
  const key = method.trim().toLowerCase();
  return SHIPPING_CODE_MAP[key] || SHIPPING_CODE_MAP['ground'];
}

@Injectable()
export class ReorderService {
  private readonly logger = new Logger(ReorderService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly orderAdapter: OpenCartOrderAdapter,
    private readonly shopifyAdapter: ShopifyOrderAdapter,
    private readonly productsService: ProductsService,
    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,
    @InjectRepository(BusinessInformation)
    private readonly businessInfoRepo: Repository<BusinessInformation>,
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
    let businessId: string | undefined = undefined;
    let isShopify = false;
    let activeAdapter: any = this.orderAdapter; // IOrderProvider

    if (request.agentId) {
      try {
        const agent = await this.agentRepo.findOne({
          where: { retell_agent: request.agentId },
          relations: ['user'],
        });
        if (agent?.user?.id) {
          const business = await this.businessInfoRepo.findOne({
            where: { user_id: { id: agent.user.id } },
          });
          if (business) {
            businessId = String(business.id);
            if (
              business.shopifyStoreUrl &&
              (business.shopifyAccessToken ||
                (business.shopifyClientId && business.shopifyClientSecret))
            ) {
              this.logger.log(
                `Shopify credentials detected for business ${business.name}. Routing to Shopify Order Adapter...`,
              );
              activeAdapter = this.shopifyAdapter;
              isShopify = true;
            }
          }
        }
      } catch (err) {
        this.logger.warn(
          `Failed to lookup business routing info for agent ${request.agentId}: ${err?.message}`,
        );
      }
    }

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
        const reorderRes = await activeAdapter.reorderPastOrder(
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

    // ─── SHOPIFY ORDER PATH ─────────────────────────────────────────────
    if (!liveReorderSucceeded && isShopify) {
      this.logger.log(
        `🟢 Shopify order path activated for ${request.productName}`,
      );

      const nameParts = (request.customerName || 'Valued Customer')
        .trim()
        .split(/\s+/);
      const firstname = nameParts[0] || 'Customer';
      const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Build a human-readable note with all collected details
      const noteParts: string[] = [];
      noteParts.push(
        request.notes ||
          `Phone order placed by AI concierge for ${request.productName}`,
      );
      if (request.quantity && request.quantity > 1)
        noteParts.push(`Quantity: ${request.quantity}`);
      if (request.company) noteParts.push(`Company: ${request.company}`);
      if (request.parts) noteParts.push(`Parts: ${request.parts}`);
      if (request.color) noteParts.push(`Color: ${request.color}`);
      if (request.shippingMethod)
        noteParts.push(`Shipping Method: ${request.shippingMethod}`);
      if (request.paymentMethod)
        noteParts.push(`Payment Method: ${request.paymentMethod}`);
      if (request.previousOrderId)
        noteParts.push(`Reorder of previous order #${request.previousOrderId}`);
      const orderNote = noteParts.join(' | ');

      // For Shopify, the product_id from Retell may be a Shopify variant GID or a numeric variant ID.
      // If it's a plain number, we pass it as-is and let the adapter prefix with gid://shopify/ProductVariant/
      const shopifyProductId = request.productId || '0';

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
          }
        : undefined;

      try {
        const createRes = await this.shopifyAdapter.createOrder({
          customer: {
            firstname,
            lastname,
            email: request.customerEmail,
            telephone: request.customerPhone || '',
          },
          products: [
            {
              product_id: Number(shopifyProductId) || 0,
              quantity: request.quantity || 1,
            },
          ],
          ...(shippingPayload ? { shipping_address: shippingPayload } : {}),
          comment: orderNote,
          businessId,
        } as any);

        if (createRes.success && createRes.order) {
          liveOrderId = createRes.order.orderId;
          referenceId = String(createRes.order.orderId);
          const invoiceMsg = createRes.message?.includes('Invoice URL')
            ? ` ${createRes.message.split('Invoice URL: ')[1] || ''}`
            : '';
          customMessage = `Great news! Your order for ${request.productName} has been created as a Draft Order in our store${request.previousOrderId ? ` (based on previous order #${request.previousOrderId})` : ''}. You will receive a secure payment invoice at ${request.customerEmail} shortly so you can complete checkout!`;
          this.logger.log(
            `🎉 Shopify Draft Order created successfully! ID: ${liveOrderId}`,
          );
        } else {
          this.logger.warn(
            `Shopify Draft Order creation returned error: ${createRes.error?.message}`,
          );
        }
      } catch (err) {
        this.logger.warn(
          `Error creating Shopify draft order: ${err?.message}. Falling back to manual capture.`,
        );
      }
    }

    // ─── OPENCART / PRINTEZ ORDER PATH ──────────────────────────────────
    if (!liveReorderSucceeded && !isShopify) {
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
          const effectiveMultiplier =
            numericQuantity >= 50 ? 1 : numericQuantity;
          calcTotal = Number(
            (catalogUnitPrice * effectiveMultiplier).toFixed(2),
          );
        }

        const nameParts = (request.customerName || 'Valued Customer')
          .trim()
          .split(/\s+/);
        const firstname = nameParts[0] || 'Customer';
        const lastname =
          nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Order';

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

        const shippingZoneId = resolveZoneId(request.state);
        const billingZoneId = resolveZoneId(
          request.billingState || request.state,
        );

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

        const productOptions: Array<Record<string, any>> = [];
        let apiOptions: any[] = [];
        try {
          apiOptions =
            await this.productsService.getProductOptions(numericProductId);
        } catch (err) {
          this.logger.warn(
            `Could not fetch product options for #${numericProductId}: ${err?.message}`,
          );
        }

        const matchOptionValue = (
          requestedName: string,
          requestedValue: string,
        ): Record<string, any> | null => {
          const normalizedName = requestedName.toLowerCase().trim();
          const normalizedValue = requestedValue.toLowerCase().trim();

          for (const optGroup of apiOptions) {
            const groupName = String(optGroup.name || '').toLowerCase();
            const nameMatches =
              groupName.includes(normalizedName) ||
              normalizedName.includes(groupName.replace(/^\d+\s*/, '')) ||
              (normalizedName.includes('part') && groupName.includes('part')) ||
              (normalizedName.includes('color') &&
                groupName.includes('color')) ||
              (normalizedName.includes('quantity') &&
                groupName.includes('quantity')) ||
              (normalizedName.includes('qty') && groupName.includes('qty'));

            if (nameMatches && Array.isArray(optGroup.values)) {
              for (const val of optGroup.values) {
                const valName = String(val.name || '')
                  .toLowerCase()
                  .trim();
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

        if (request.parts) {
          const matched = matchOptionValue('Parts', String(request.parts));
          if (matched) {
            productOptions.push(matched);
          } else {
            productOptions.push({
              name: 'Parts',
              value: String(request.parts),
              type: 'select',
            });
          }
        }

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

        if (
          numericQuantity > 1 &&
          !productOptions.some(
            (o) =>
              String(o.name || '')
                .toLowerCase()
                .includes('quantity') ||
              String(o.name || '')
                .toLowerCase()
                .includes('qty'),
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
            shippingTitle = 'Ground';
            shippingFee = Math.max(
              11.99,
              Number((calcTotal * 0.17).toFixed(2)),
            );
          }

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
                quantity: 1,
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
                      extension: 'opencart',
                    },
                    {
                      code: 'shipping',
                      title: shippingTitle,
                      value: shippingFee,
                      sort_order: 2,
                      extension: 'opencart',
                    },
                    {
                      code: 'tax',
                      title: taxTitle,
                      value: taxFee,
                      sort_order: 3,
                      extension: 'opencart',
                    },
                    {
                      code: 'total',
                      title: 'Total',
                      value: finalOrderTotal!,
                      sort_order: 4,
                      extension: 'opencart',
                    },
                  ],
                }
              : {}),
            // --- OpenCart metadata fields ---
            type: numericPreviousId ? 'By Call' : 'By Call',
            language_id: 1,
            currency_id: 2,
            currency_code: 'USD',
            currency_value: 1.0,
            store_id: 0,
            store_name: 'PrintEZ.com',
            store_url: 'https://www.printez.com/',
            ip: request.ip || '127.0.0.1',
            forwarded_ip: request.ip || '127.0.0.1',
            user_agent:
              request.userAgent ||
              `${BrandConfig.conciergeName} / PrintEZ Assistant`,
            ...(numericPreviousId && !isNaN(numericPreviousId)
              ? {
                  reorder_id: numericPreviousId,
                  source_order_id: numericPreviousId,
                  previous_order_id: numericPreviousId,
                }
              : {}),
            comment: orderComment,
            businessId,
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

    // ─── EMAIL NOTIFICATIONS ────────────────────────────────────────────
    if (isShopify) {
      // Send Sonervant branded emails for Shopify orders
      try {
        await this.sendShopifyStoreOwnerNotification(
          request,
          referenceId,
          liveOrderId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send Shopify store owner notification for ${referenceId}`,
          error?.stack,
        );
      }
      try {
        await this.sendShopifyCustomerConfirmation(
          request,
          referenceId,
          liveOrderId,
          customMessage,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send Shopify customer confirmation for ${referenceId}`,
          error?.stack,
        );
      }
    } else {
      // Send PrintEZ-specific emails for OpenCart orders
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
      <p style="margin-top: 16px; color: #666;">This order was captured by the ${BrandConfig.fullName} Voice Agent during a live customer call. Please ensure the customer completes payment via their secure checkout link.</p>
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

  // ═══════════════════════════════════════════════════════════════════════
  // SHOPIFY — Sonervant Branded Email Templates
  // ═══════════════════════════════════════════════════════════════════════

  private async sendShopifyStoreOwnerNotification(
    request: ReorderRequest,
    referenceId: string,
    liveOrderId?: number | string,
  ) {
    // Send to the store owner's support email (or a configured operations email)
    let ownerEmail = process.env.VOICEPERI_OPERATIONS_EMAIL || '';
    if (!ownerEmail && request.agentId) {
      try {
        const agent = await this.agentRepo.findOne({
          where: { retell_agent: request.agentId },
          relations: ['user'],
        });
        ownerEmail = agent?.user?.email || '';
      } catch (_) {
        // ignore error if agent user not found
      }
    }
    if (!ownerEmail) {
      this.logger.warn(
        'No store owner email found for Shopify notification. Skipping.',
      );
      return;
    }

    const subject = `🛍️ New AI Voice Order — ${request.productName} | ${request.customerName}`;

    const fullAddress = [
      request.streetAddress || request.shippingAddress,
      request.city,
      request.state,
      request.zipCode,
    ]
      .filter(Boolean)
      .join(', ');

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 25px 15px; background-color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #065f46 0%, #047857 55%, #059669 100%); padding: 32px 36px; color: #ffffff;">
        <span style="display: inline-block; background-color: rgba(167,243,208,0.2); border: 1px solid rgba(167,243,208,0.4); color: #d1fae5; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.8px; margin-bottom: 12px;">🤖 AI VOICE ORDER</span>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">New Order from ${BrandConfig.fullName}</h1>
        <p style="margin: 6px 0 0; font-size: 14px; color: #d1fae5;">A customer just placed an order during an AI voice call.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 36px;">
        ${
          liveOrderId
            ? `<div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
          <span style="font-size: 14px; font-weight: 700; color: #065f46;">✅ Shopify Draft Order Created — ID: ${liveOrderId}</span>
        </div>`
            : `<div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
          <span style="font-size: 14px; font-weight: 700; color: #92400e;">⚠️ Draft Order could not be auto-created. Please process manually.</span>
        </div>`
        }
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <tr style="background-color: #f1f5f9;">
            <td style="padding: 12px 18px; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;" colspan="2">Order Details</td>
          </tr>
          <tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; width: 40%;">Product</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${request.productName}</td></tr>
          <tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Quantity</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${request.quantity || 1}</td></tr>
          <tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Customer</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${request.customerName}</td></tr>
          <tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Email</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #2563eb;">${request.customerEmail}</td></tr>
          ${request.customerPhone ? `<tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Phone</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${request.customerPhone}</td></tr>` : ''}
          ${request.company ? `<tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Company</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${request.company}</td></tr>` : ''}
          ${fullAddress ? `<tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Shipping Address</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${fullAddress}</td></tr>` : ''}
          ${request.notes ? `<tr><td style="padding: 12px 18px; font-weight: 600; color: #64748b;">Notes</td><td style="padding: 12px 18px; color: #0f172a;">${request.notes}</td></tr>` : ''}
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color: #0f172a; padding: 24px 36px; text-align: center;">
        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #f8fafc;">${BrandConfig.conciergeName}</p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">Automated order capture powered by AI telephony</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await this.mailerService.sendMail({ to: ownerEmail, subject, html });
    this.logger.log(
      `✅ Shopify store owner notification sent to ${ownerEmail} for ${referenceId}`,
    );
  }

  private async sendShopifyCustomerConfirmation(
    request: ReorderRequest,
    referenceId: string,
    liveOrderId?: number | string,
    customMessage?: string,
  ) {
    const subject = `Your Order Confirmation — #${referenceId}`;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 25px 15px; background-color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #0b0f19 0%, #1e1b4b 55%, #312e81 100%); padding: 36px 40px; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff;">Thank You for Your Order!</h1>
        <p style="margin: 8px 0 0; font-size: 15px; color: #cbd5e1;">Hi ${request.customerName}, we've received your order.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px 40px;">
        <p style="font-size: 15px; color: #334155; line-height: 1.7; margin: 0 0 24px;">
          ${customMessage || `We've received your order for <strong>${request.productName}</strong> and it's being processed.`}
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
          <tr style="background-color: #f1f5f9;">
            <td style="padding: 12px 18px; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;" colspan="2">Your Order Summary</td>
          </tr>
          <tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; width: 40%;">Order Reference</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #4f46e5;">#${referenceId}</td></tr>
          <tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Product</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${request.productName}</td></tr>
          <tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Quantity</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${request.quantity || 1}</td></tr>
          ${request.shippingMethod ? `<tr><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">Shipping</td><td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${request.shippingMethod}</td></tr>` : ''}
          ${request.notes ? `<tr><td style="padding: 12px 18px; font-weight: 600; color: #64748b;">Notes</td><td style="padding: 12px 18px; color: #0f172a;">${request.notes}</td></tr>` : ''}
        </table>
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">📧 You will receive a secure payment invoice via email shortly to complete your purchase.</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #0f172a; padding: 24px 36px; text-align: center;">
        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #f8fafc;">Powered by ${BrandConfig.fullName}</p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">Intelligent Voice Commerce Platform</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await this.mailerService.sendMail({
      to: request.customerEmail,
      subject,
      html,
    });

    this.logger.log(
      `✅ Shopify customer confirmation sent to ${request.customerEmail} for #${referenceId}`,
    );
  }
}
