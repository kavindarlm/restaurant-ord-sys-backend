import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './entities/dish.entity';
import { DishPrice } from './entities/dish_price.entity';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(DishPrice)
    private dishPriceRepository: Repository<DishPrice>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createDishDto: CreateDishDto) {
    const { dish_name, dish_description, dish_image_url, category_id, prices } = createDishDto;
    const category = await this.categoryRepository.findOneBy({ category_id });
    const dish = this.dishRepository.create({ dish_name, dish_description, dish_image_url, category });
    await this.dishRepository.save(dish);

    const dishPrices = prices.map(price => this.dishPriceRepository.create({ ...price, dish }));
    await this.dishPriceRepository.save(dishPrices);

    return dish;
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
