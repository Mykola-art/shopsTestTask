import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {StoreEntity, UserEntity} from "../../entities";
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";

@Module({
  controllers: [StoresController],
  providers: [StoresService, JwtService, UsersService],
  imports: [TypeOrmModule.forFeature([StoreEntity, UserEntity])],
  exports: [StoresService]
})
export class StoresModule {}
