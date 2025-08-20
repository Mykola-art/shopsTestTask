import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {envValidationSchema} from "./config/env.validation";
import {typeormModuleOptions} from "./config/typeorm.config";
import {UsersModule} from "./modules/users/users.module";
import {AuthModule} from "./modules/auth/auth.module";
import { StoresModule } from './modules/stores/stores.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => typeormModuleOptions(config),
    }),
    UsersModule,
    AuthModule,
    StoresModule,
    ProductsModule
  ]
})
export class AppModule {}
