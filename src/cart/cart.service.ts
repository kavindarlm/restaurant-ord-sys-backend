import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Table } from 'src/table/entities/table.entity';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Table) private readonly tableRepository: Repository<Table>,  // Inject TableRepository
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const table = await this.tableRepository.findOne({ where: { table_id: createCartDto.table_id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${createCartDto.table_id} not found`);
    }
    const cart = this.cartRepository.create({ ...createCartDto, table });
    return await this.cartRepository.save(cart);
  }

  /**
   * Create cart using encrypted table ID (for customer-facing endpoints)
   */
  async createWithEncryptedTableId(createCartDto: CreateCartDto, encryptedTableId: string): Promise<{ cart: Cart; encryptedCartId: string }> {
    try {
      // Decrypt and validate table ID
      const tableId = this.encryptionService.decrypt(encryptedTableId);
      
      const table = await this.tableRepository.findOne({ where: { table_id: tableId } });
      if (!table) {
        throw new NotFoundException(`Table not found or invalid`);
      }
      
      const cart = this.cartRepository.create({ ...createCartDto, table });
      const savedCart = await this.cartRepository.save(cart);
      
      // Return encrypted cart ID for future requests
      const encryptedCartId = this.encryptionService.encrypt(savedCart.cart_id);
      
      return { cart: savedCart, encryptedCartId };
    } catch (error) {
      throw new NotFoundException('Invalid table identifier');
    }
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

  /**
   * Find cart by encrypted ID (for customer-facing endpoints)
   */
  async findOneByEncryptedId(encryptedId: string): Promise<Cart> {
    try {
      const cartId = this.encryptionService.decrypt(encryptedId);
      return await this.findOne(cartId);
    } catch (error) {
      throw new NotFoundException('Invalid cart identifier');
    }
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
