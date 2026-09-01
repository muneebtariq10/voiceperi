import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderLookupAudit } from '../entities/order_lookup_audit';
import { Agent } from '../entities/agent';
import { BusinessInformation } from '../entities/business_information';
import {
  OpenCartOrderAdapter,
  ShopifyOrderAdapter,
} from '../integrations/adapters';
import {
  IOrderProvider,
  OrderLookupResult,
  OrderListResult,
} from '../integrations/interfaces';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderLookupAudit)
    private readonly auditRepository: Repository<OrderLookupAudit>,
    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,
    @InjectRepository(BusinessInformation)
    private readonly businessInfoRepo: Repository<BusinessInformation>,
    private readonly openCartAdapter: OpenCartOrderAdapter,
    private readonly shopifyAdapter: ShopifyOrderAdapter,
  ) {}

  private async resolveAdapter(agentId?: string): Promise<{
    adapter: IOrderProvider;
    businessId?: string;
    isShopify: boolean;
  }> {
    if (agentId) {
      try {
        const agent = await this.agentRepo.findOne({
          where: { retell_agent: agentId },
          relations: ['user'],
        });
        if (agent?.user?.id) {
          const business = await this.businessInfoRepo.findOne({
            where: { user_id: { id: agent.user.id } },
          });
          if (
            business?.shopifyStoreUrl &&
            (business.shopifyAccessToken ||
              (business.shopifyClientId && business.shopifyClientSecret))
          ) {
            this.logger.log(
              `🛍️ Routing order queries to Shopify for business: ${business.name} (Store: ${business.shopifyStoreUrl})`,
            );
            return {
              adapter: this.shopifyAdapter,
              businessId: business.id,
              isShopify: true,
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(
          `Failed to resolve business for agent ${agentId}: ${err?.message}`,
        );
      }
    }
    return { adapter: this.openCartAdapter, isShopify: false };
  }

  async lookupOrder(
    orderId: number | string,
    requestCorrelationId: string,
    email?: string,
    agentId?: string,
  ) {
    this.logger.log(
      `[${requestCorrelationId}] Looking up order ${orderId} (Email: ${email || 'not provided'}, Agent: ${agentId || 'N/A'})`,
    );

    const { adapter, businessId, isShopify } =
      await this.resolveAdapter(agentId);
    let result: OrderLookupResult;

    if (isShopify) {
      result = await this.shopifyAdapter.getOrderById(orderId, businessId);
      // Fallback to OpenCart if not found
      if (!result.found) {
        this.logger.log(
          `[${requestCorrelationId}] Not found in Shopify, trying OpenCart fallback...`,
        );
        const fallback = await this.openCartAdapter.getOrderById(orderId);
        if (fallback.found) result = fallback;
      }
    } else {
      result = await adapter.getOrderById(orderId);
    }

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
        message:
          result.message ||
          'We could not find an order with the provided order ID.',
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
    email: string | undefined,
    requestCorrelationId: string,
    phone?: string,
    name?: string,
    agentId?: string,
  ) {
    this.logger.log(
      `[${requestCorrelationId}] Looking up orders - Email: ${email || 'N/A'}, Phone: ${phone || 'N/A'}, Name: ${name || 'N/A'}, Agent: ${agentId || 'N/A'}`,
    );

    const { adapter, businessId, isShopify } =
      await this.resolveAdapter(agentId);
    let result: OrderListResult;

    if (isShopify) {
      result = await this.shopifyAdapter.getOrdersByCustomer(
        email,
        phone,
        name,
        businessId,
      );
      if (!result.found) {
        const fallback = await this.openCartAdapter.getOrdersByCustomer(
          email,
          phone,
          name,
        );
        if (fallback.found) result = fallback;
      }
    } else {
      result = await adapter.getOrdersByCustomer(email, phone, name);
    }

    // Save audit log
    await this.auditRepository.save({
      requestedOrderId: 0,
      verificationMethod: email ? 'email' : phone ? 'phone' : 'name',
      verificationSucceeded: result.found,
      source: 'api',
      requestCorrelationId,
    });

    return result;
  }
}
