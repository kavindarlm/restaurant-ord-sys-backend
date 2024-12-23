import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Table } from 'src/table/entities/table.entity'; 

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Table) private readonly tableRepository: Repository<Table>,  // Inject TableRepository
  ) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const table = await this.tableRepository.findOne({ where: { table_id: createCartDto.table_id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${createCartDto.table_id} not found`);
    }
    const cart = this.cartRepository.create({ ...createCartDto, table });
    return await this.cartRepository.save(cart);
  }

  async findAll(): Promise<Cart[]> {
    return await this.cartRepository.find({ relations: ['cartItems'] });
  }

  async findOne(id: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { cart_id: id },
      relations: ['cartItems'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }

    return cart;
  }

  async getCartById(id: number): Promise<Cart> {
    return this.findOne(id);
  }

  async update(id: number, updateCartDto: UpdateCartDto): Promise<Cart> {
    await this.cartRepository.update(id, updateCartDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const cart = await this.findOne(id);
    await this.cartRepository.softRemove(cart);
  }
}
