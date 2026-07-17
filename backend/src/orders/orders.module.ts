import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order';
import { OrderProduct } from '../entities/order_product';
import { OrderHistory } from '../entities/order_history';
import { OrderLookupAudit } from '../entities/order_lookup_audit';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderStatusMappingService } from './order-status-mapping.service';
import { OrdersImportService } from './orders-import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderProduct,
      OrderHistory,
      OrderLookupAudit,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderStatusMappingService, OrdersImportService],
  exports: [OrdersService, OrdersImportService],
})
export class OrdersModule {}
