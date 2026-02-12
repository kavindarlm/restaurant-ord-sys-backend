import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './entities/dish.entity';
import { DishPrice } from './entities/dish_price.entity';
import { Category } from '../category/entities/category.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, DishPrice, Category]), UploadModule],
  controllers: [DishController],
  providers: [DishService],
  exports: [DishService, TypeOrmModule],
})
export class DishModule {}
