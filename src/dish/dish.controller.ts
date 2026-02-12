import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { FileValidationPipe } from '../upload/pipes/file-validation.pipe';
import { memoryStorage } from 'multer';

@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  create(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body() createDishDto: CreateDishDto,
  ) {
    return this.dishService.create(createDishDto, file);
  }

  @Get()
  findAll() {
    return this.dishService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishService.findOne(+id);
  }

  @Get('category/:category_id')
  findByCategoryId(@Param('category_id') category_id: string) {
    return this.dishService.findByCategoryId(+category_id);
  }

  @Post('toggle-availability/:id')
  toggleAvailability(@Param('id') id: string) {
    return this.dishService.toggleAvailability(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishService.update(+id, updateDishDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishService.remove(+id);
  }
}
