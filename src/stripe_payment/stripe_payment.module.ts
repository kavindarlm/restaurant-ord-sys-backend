// src/payment/stripe_payment.module.ts
import { Module } from '@nestjs/common';
import { StripePaymentService } from './stripe_payment.service';
import { StripePaymentController } from './stripe_payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { DishPrice } from 'src/dish/entities/dish_price.entity';
import { LoggerModule } from '../security-logging/logger.module';
import { EncryptionService } from 'src/common/encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,  
      DishPrice,
    ]),
    LoggerModule,
  ],
  controllers: [StripePaymentController], 
  providers: [StripePaymentService, EncryptionService],
})
export class StripePaymentModule {}
