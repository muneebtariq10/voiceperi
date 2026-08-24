import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order';
import { OrderProduct } from '../entities/order_product';
import { OrderHistory } from '../entities/order_history';
import { OrderLookupAudit } from '../entities/order_lookup_audit';
import { Agent } from '../entities/agent';
import { BusinessInformation } from '../entities/business_information';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ReorderController } from './reorder.controller';
import { OrderStatusMappingService } from './order-status-mapping.service';
import { OrdersImportService } from './orders-import.service';
import { ReorderService } from './reorder.service';
import { OpenCartOrderAdapter, ShopifyOrderAdapter } from '../integrations/adapters';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderProduct,
      OrderHistory,
      OrderLookupAudit,
      Agent,
      BusinessInformation,
    ]),
    ProductsModule,
  ],
  controllers: [OrdersController, ReorderController],
  providers: [
    OrdersService,
    OrderStatusMappingService,
    OrdersImportService,
    ReorderService,
    OpenCartOrderAdapter,
    ShopifyOrderAdapter,
  ],
  exports: [OrdersService, OrdersImportService, ReorderService],
})
export class OrdersModule {}
