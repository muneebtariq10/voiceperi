import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order';
import { OrderProduct } from '../entities/order_product';
import { OrderHistory } from '../entities/order_history';
import { OrderLookupAudit } from '../entities/order_lookup_audit';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ReorderController } from './reorder.controller';
import { OrderStatusMappingService } from './order-status-mapping.service';
import { OrdersImportService } from './orders-import.service';
import { ReorderService } from './reorder.service';
import { OpenCartOrderAdapter } from '../integrations/adapters';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderProduct,
      OrderHistory,
      OrderLookupAudit,
    ]),
  ],
  controllers: [OrdersController, ReorderController],
  providers: [
    OrdersService,
    OrderStatusMappingService,
    OrdersImportService,
    ReorderService,
    OpenCartOrderAdapter,
  ],
  exports: [OrdersService, OrdersImportService, ReorderService],
})
export class OrdersModule {}
