import { Module } from '@nestjs/common';
import { LoggerModule } from './security-logging/logger.module';
import { LoggerService } from './security-logging/logger.service';
import { SecurityLoggerService } from './security-logging/security-logger.service';
import { LoggingInterceptor } from './security-logging/logging.interceptor';
import { HttpExceptionFilter } from './security-logging/http-exception.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { DishModule } from './dish/dish.module';
import { TableModule } from './table/table.module';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CartItemsModule } from './cart_items/cart_items.module';
import { StripePaymentModule } from './stripe_payment/stripe_payment.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot(typeOrmConfig),CategoryModule, DishModule, TableModule, OrderModule, UserModule, CartModule, PaymentModule, CartItemsModule,StripePaymentModule,LoggerModule],
  controllers: [AppController],
  providers: [ AppService,
    LoggerService,
    SecurityLoggerService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
