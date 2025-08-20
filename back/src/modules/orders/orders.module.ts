import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {JwtService} from "@nestjs/jwt";
import {OrderEntity, ProductEntity, UserEntity} from "../../entities";
import {UsersService} from "../users/users.service";
import {ProductsService} from "../products/products.service";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, JwtService, UsersService, ProductsService],
  imports: [TypeOrmModule.forFeature([OrderEntity, UserEntity, ProductEntity])]
})
export class OrdersModule {}
