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
import { DishModule } from 'src/dish/dish.module';
import { Table } from 'src/table/entities/table.entity';
import { TableModule } from 'src/table/table.module';
import { EncryptionService } from 'src/common/encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order,Payment,Cart,Table]),
    PaymentModule,  // Add PaymentModule to imports
    CartModule,
    DishModule,
    TableModule // Add CartModule to imports
  ],
  controllers: [OrderController],
  providers: [OrderService, CartService, EncryptionService],
  exports: [OrderService],
})
export class OrderModule {}
