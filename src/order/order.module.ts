import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { PaymentModule } from '../payment/payment.module';  // Import PaymentModule
import { CartModule } from '../cart/cart.module';  // Import CartModule
import { Payment } from 'src/payment/entities/payment.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartService } from 'src/cart/cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order,Payment,Cart]),
    PaymentModule,  // Add PaymentModule to imports
    CartModule,  // Add CartModule to imports
  ],
  controllers: [OrderController],
  providers: [OrderService, CartService],
  exports: [OrderService],
})
export class OrderModule {}
