import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload dish image
   * POST /upload/dish
   * Body: form-data with 'file' field
   */
  @Post('dish')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async uploadDishImage(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const imageUrl = await this.uploadService.uploadDishImage(file);

    return {
      success: true,
      message: 'Dish image uploaded successfully',
      data: {
        imageUrl,
      },
    };
  }

  /**
   * Upload category image
   * POST /upload/category
   * Body: form-data with 'file' field
   */
  @Post('category')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async uploadCategoryImage(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const imageUrl = await this.uploadService.uploadCategoryImage(file);

    return {
      success: true,
      message: 'Category image uploaded successfully',
      data: {
        imageUrl,
      },
    };
  }

  /**
   * Generic upload endpoint
   * POST /upload
   * Body: form-data with 'file' field
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async uploadFile(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadFile(file);

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        imageUrl: result.url,
        path: result.path,
      },
    };
  }
}
