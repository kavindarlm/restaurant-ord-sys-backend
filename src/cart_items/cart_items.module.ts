import { Module } from '@nestjs/common';
import { CartItemService } from './cart_items.service';
import { CartItemController } from './cart_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart_item.entity';
import { Cart } from 'src/cart/entities/cart.entity';
 // Ensure this import is correct

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Cart])], // Add Repository to imports
  controllers: [CartItemController],
  providers: [CartItemService],
})
export class CartItemsModule {}
