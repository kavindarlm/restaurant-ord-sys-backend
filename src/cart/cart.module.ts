import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Table } from 'src/table/entities/table.entity';
import { TableModule } from 'src/table/table.module';


@Module({
  imports: [TypeOrmModule.forFeature([Cart, Table]),
TableModule],
  controllers: [CartController],
  providers: [CartService], // Add TableRepository to providers
  exports: [CartService],
})
export class CartModule {}
 