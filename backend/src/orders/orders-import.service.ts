import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order';
import { OrderProduct } from '../entities/order_product';
import { OrderHistory } from '../entities/order_history';
import * as fs from 'fs';
import * as path from 'path';
import { OrderStatusMappingService } from './order-status-mapping.service';

@Injectable()
export class OrdersImportService implements OnModuleInit {
  private readonly logger = new Logger(OrdersImportService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly productRepository: Repository<OrderProduct>,
    @InjectRepository(OrderHistory)
    private readonly historyRepository: Repository<OrderHistory>,
    private readonly statusMappingService: OrderStatusMappingService,
  ) {}

  async onModuleInit() {
    const candidatePaths = [
      path.join(process.cwd(), 'data', 'printez-orders.json'),
      path.join(process.cwd(), 'backend', 'data', 'printez-orders.json'),
      path.join(__dirname, '..', '..', 'data', 'printez-orders.json'),
      path.join(__dirname, '..', '..', '..', 'data', 'printez-orders.json'),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      this.logger.log(`Auto-seeding orders from ${foundPath} on startup...`);
      try {
        await this.importOrders(foundPath, false);
      } catch (e: any) {
        this.logger.error(`Error auto-seeding orders: ${e?.message || e}`);
      }
    } else {
      this.logger.warn('No printez-orders.json found for auto-seeding.');
    }
  }

  async importOrders(filePath: string, dryRun: boolean = false) {
    this.logger.log(`Starting import from ${filePath} (Dry Run: ${dryRun})`);

    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    let ordersData: any[];

    try {
      ordersData = JSON.parse(fileContent);
      if (!Array.isArray(ordersData)) {
        throw new Error('JSON is not an array');
      }
    } catch (err) {
      this.logger.error(`Failed to parse JSON: ${err.message}`);
      return;
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    // Use query runner for transactions
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    for (const record of ordersData) {
      if (!record.order_id) {
        this.logger.warn(`Skipping record with no order_id`);
        skipped++;
        continue;
      }

      await queryRunner.startTransaction();

      try {
        let order = await queryRunner.manager.findOne(Order, {
          where: { externalOrderId: record.order_id },
        });

        const isUpdate = !!order;

        if (!order) {
          order = new Order();
          order.externalOrderId = record.order_id;
        }

        order.orderType = record.type;
        order.statusId = record.order_status_id;
        order.statusName = record.order_status_name;
        order.currencyCode = record.currency_code;
        order.subtotal = record.ez_review?.sub_total || 0;
        order.shippingTotal =
          record.totals?.find((t: any) => t.code === 'shipping')?.value || 0;
        order.discountTotal = record.ez_review?.ez_discount || 0;
        order.grandTotal = record.total;
        order.shippingMethod = record.shipping_address?.method;
        order.paymentMethod = record.payment?.method;
        order.dateAdded = new Date(record.date_added);
        order.dateModified = new Date(record.date_modified);
        order.customerEmailNormalized = record.customer?.email?.toLowerCase();
        order.externalCustomerId = record.customer?.customer_id;
        order.reorderId = record.reorder_id || null;
        order.vendorId = record.vendor_id || null;
        order.representativeId = record.representativeid || null;

        // --- Customer Info ---
        order.customerFirstName = record.customer?.firstname || null;
        order.customerLastName = record.customer?.lastname || null;
        order.customerEmail = record.customer?.email || null;
        order.customerPhone = record.customer?.telephone || null;

        // --- Shipping Address ---
        order.shippingFirstName = record.shipping_address?.firstname || null;
        order.shippingLastName = record.shipping_address?.lastname || null;
        order.shippingCompany = record.shipping_address?.company || null;
        order.shippingAddress1 = record.shipping_address?.address_1 || null;
        order.shippingAddress2 = record.shipping_address?.address_2 || null;
        order.shippingCity = record.shipping_address?.city || null;
        order.shippingZone = record.shipping_address?.zone || null;
        order.shippingPostcode = record.shipping_address?.postcode || null;
        order.shippingCountry = record.shipping_address?.country || null;

        // --- Billing Address ---
        order.billingFirstName = record.payment?.firstname || null;
        order.billingLastName = record.payment?.lastname || null;
        order.billingCompany = record.payment?.company || null;
        order.billingAddress1 = record.payment?.address_1 || null;
        order.billingAddress2 = record.payment?.address_2 || null;
        order.billingCity = record.payment?.city || null;
        order.billingZone = record.payment?.zone || null;
        order.billingPostcode = record.payment?.postcode || null;
        order.billingCountry = record.payment?.country || null;

        // Save phone last 4 digits for verification
        const phone = record.customer?.telephone;
        if (phone) {
          const digits = phone.replace(/\\D/g, '');
          order.customerPhoneLast4 =
            digits.length >= 4 ? digits.slice(-4) : digits;
        }

        const postcode = record.shipping_address?.postcode;
        if (postcode) {
          order.shippingPostcodeNormalized = postcode
            .replace(/\\s/g, '')
            .toUpperCase();
        }

        if (!dryRun) {
          order = await queryRunner.manager.save(Order, order);
        }

        // Import Products
        if (record.products && Array.isArray(record.products)) {
          // If updating, delete old products first (simplification)
          if (isUpdate && !dryRun) {
            await queryRunner.manager.delete(OrderProduct, {
              order: { id: order.id },
            });
          }

          for (const prod of record.products) {
            const product = new OrderProduct();
            product.order = order;
            product.externalOrderProductId = prod.order_product_id;
            product.externalProductId = prod.product_id;

            // Decode HTML entities in name
            product.name = prod.name
              ? prod.name.replace(/&amp;/g, '&')
              : prod.name;
            product.model = prod.model;
            product.quantity = prod.quantity;
            product.unitPrice = prod.price;
            product.total = prod.total;
            product.type = prod.type;

            // Store product options (size, color, variant, etc.)
            if (
              prod.options &&
              Array.isArray(prod.options) &&
              prod.options.length > 0
            ) {
              product.normalizedOptions = prod.options.map((opt: any) => ({
                name: opt.name,
                value: opt.value,
              }));
            }

            if (!dryRun) {
              await queryRunner.manager.save(OrderProduct, product);
            }
          }
        }

        // Import History
        if (record.history && Array.isArray(record.history)) {
          if (isUpdate && !dryRun) {
            await queryRunner.manager.delete(OrderHistory, {
              order: { id: order.id },
            });
          }

          for (const hist of record.history) {
            const sanitizedComment =
              this.statusMappingService.mapHistoryComment(hist.comment);

            if (sanitizedComment) {
              const history = new OrderHistory();
              history.order = order;
              history.statusId = hist.order_status_id;
              history.statusName = hist.order_status_name;
              history.dateAdded = new Date(hist.date_added);
              history.sanitizedComment = sanitizedComment;

              if (!dryRun) {
                await queryRunner.manager.save(OrderHistory, history);
              }
            }
          }
        }

        await queryRunner.commitTransaction();

        if (isUpdate) updated++;
        else imported++;
      } catch (err) {
        this.logger.error(
          `Failed to import order ${record.order_id}: ${err.message}`,
        );
        await queryRunner.rollbackTransaction();
        skipped++;
      }
    }

    await queryRunner.release();

    this.logger.log(
      `Import Complete. Imported: ${imported}, Updated: ${updated}, Skipped: ${skipped}`,
    );
  }
}
