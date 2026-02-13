import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports : [TypeOrmModule.forFeature([Category]), UploadModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
