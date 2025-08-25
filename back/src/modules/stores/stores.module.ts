import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AuditLogEntity,
  StoreEntity,
  UserEntity,
  ProductEntity,
  OrderEntity,
} from '../../entities';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsModule } from '../products/products.module';

@Module({
  controllers: [StoresController],
  providers: [
    StoresService,
    JwtService,
    UsersService,
    AuditService,
    OrdersService,
    ProductsService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      StoreEntity,
      UserEntity,
      AuditLogEntity,
      ProductEntity,
      OrderEntity,
    ]),
  ],
  exports: [StoresService],
})
export class StoresModule {}
