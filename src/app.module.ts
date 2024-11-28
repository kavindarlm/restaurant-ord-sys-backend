import { Module } from '@nestjs/common';
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

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig),CategoryModule, DishModule, TableModule, OrderModule, UserModule, CartModule, PaymentModule, CartItemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
