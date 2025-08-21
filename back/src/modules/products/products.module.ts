import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuditLogEntity, OrderEntity, ProductEntity, StoreEntity, UserEntity} from "../../entities";
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";
import {StoresService} from "../stores/stores.service";
import { AuditService } from '../audit/audit.service';
import { OrdersService } from '../orders/orders.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, JwtService, UsersService, StoresService, AuditService, OrdersService],
  imports: [TypeOrmModule.forFeature([ProductEntity, UserEntity, StoreEntity, AuditLogEntity, OrderEntity])],
  exports: [ProductsService]
})
export class ProductsModule {}
