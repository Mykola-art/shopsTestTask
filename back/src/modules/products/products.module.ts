import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProductEntity, StoreEntity, UserEntity} from "../../entities";
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";
import {StoresService} from "../stores/stores.service";

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, JwtService, UsersService, StoresService],
  imports: [TypeOrmModule.forFeature([ProductEntity, UserEntity, StoreEntity])],
  exports: [ProductsService]
})
export class ProductsModule {}
