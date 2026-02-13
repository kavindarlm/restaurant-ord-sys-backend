import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './entities/dish.entity';
import { DishPrice } from './entities/dish_price.entity';
import { Category } from '../category/entities/category.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(DishPrice)
    private dishPriceRepository: Repository<DishPrice>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private uploadService: UploadService,
  ) {}

  async create(createDishDto: CreateDishDto, file?: Express.Multer.File) {
    const { dish_name, dish_description, category_id, prices } = createDishDto;
    
    // Upload image to Supabase if file is provided
    let dish_image_url = null;
    if (file) {
      dish_image_url = await this.uploadService.uploadDishImage(file);
    }

    // Parse prices if it's a JSON string (from form-data)
    let parsedPrices: { size: string, price: number }[];
    if (typeof prices === 'string') {
      try {
        parsedPrices = JSON.parse(prices);
      } catch (error) {
        throw new BadRequestException('Invalid prices format. Must be valid JSON array.');
      }
    } else {
      parsedPrices = prices;
    }

    // Get category and create dish
    const category = await this.categoryRepository.findOneBy({ category_id });
    if (!category) {
      throw new BadRequestException(`Category with id ${category_id} not found`);
    }

    const dish = this.dishRepository.create({ dish_name, dish_description, dish_image_url, category });
    await this.dishRepository.save(dish);

    // Create dish prices
    const dishPrices = parsedPrices.map(price => this.dishPriceRepository.create({ ...price, dish }));
    await this.dishPriceRepository.save(dishPrices);

    return {
      success: true,
      message: 'Dish created successfully',
      data: dish,
    };
  }

  async findAll() {
    return await this.dishRepository.find({ relations: ['category', 'dishPrices'] });
  }

  async findByCategoryId(category_id: number) {
    const dishes = await this.dishRepository.find({
      where: { category: { category_id } },
      relations: ['category', 'dishPrices'],
    });
    return dishes.map(dish => ({
      ...dish,
      category_id: dish.category.category_id,
    }));
  }

  findOne(id: number) {
    return this.dishRepository.findOne({ where: { dish_id: id }, relations: ['category', 'dishPrices'] });
  }

  async toggleAvailability(id: number) {
    const dish = await this.dishRepository.findOne({ where: { dish_id: id } });
    if (dish) {
      dish.is_available = !dish.is_available;
      await this.dishRepository.save(dish);
    }
    return dish;
  }

  update(id: number, updateDishDto: UpdateDishDto) {
    return `This action updates a #${id} dish`;
  }

  remove(id: number) {
    return `This action removes a #${id} dish`;
  }

  async getDishNameById(dishId: number): Promise<string> {
    const dish = await this.dishRepository.findOne({
      where: { dish_id: dishId },
    });
    return dish?.dish_name || 'Unknown Dish';
  }
}
