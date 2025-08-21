import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {UsersService} from "../users/users.service";
import {JwtModule} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuditLogEntity, UserEntity} from "../../entities";
import {ConfigModule} from "@nestjs/config";
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, AuditService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forFeature([UserEntity, AuditLogEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '6h' },
    }),
  ]
})
export class AuthModule {}
