import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private uploadService: UploadService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, file?: Express.Multer.File): Promise<any> {
    // Upload image to Supabase if file is provided
    let category_image_url = null;
    if (file) {
      category_image_url = await this.uploadService.uploadCategoryImage(file);
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      category_image_url,
    });
    const savedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category created successfully',
      data: savedCategory,
    };
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepository.find();
    return categories;
  }

  async findOne(id: number): Promise<{ name: string, description: string }> {
    const category = await this.categoryRepository.findOne({ where: { category_id: id } });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return { name: category.category_name, description: category.category_description };
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
