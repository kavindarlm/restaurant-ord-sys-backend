import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { Cart } from 'src/cart/entities/cart.entity';
import { EncryptionService } from 'src/common/encryption.service';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(createCartItemDto: CreateCartItemDto): Promise<CartItem> {
    const { quantity, dish_id, cart_id, is_deleted } = createCartItemDto;

    // decrypt cart_id and convert to number
    const decryptedCartId = this.encryptionService.decrypt(cart_id);
  
    // Find the associated cart
    const cart = await this.cartRepository.findOne({
      where: { cart_id: Number(decryptedCartId), is_deleted: false, is_active: true },
      relations: ['cartItems'],
    });
  
    if (!cart) {
      throw new NotFoundException('Cart not found or inactive.');
    }
  
    // Create the CartItem
    const cartItem = this.cartItemRepository.create({
      quantity,
      dish_id,
      is_deleted: is_deleted ?? false,
      cart,
    });
  
    return this.cartItemRepository.save(cartItem);
  }
  

  async findAll(): Promise<CartItem[]> {
    return await this.cartItemRepository.find({ relations: ['cart', 'dish'] });
  }

  async findOne(id: number): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { cart_item_id: id },
      relations: ['cart', 'dish'],
    });

    if (!cartItem) {
      throw new NotFoundException(`CartItem with ID ${id} not found`);
    }

    return cartItem;
  }

  async update(id: number, updateCartItemDto: UpdateCartItemDto): Promise<CartItem> {
    await this.cartItemRepository.update(id, updateCartItemDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const cartItem = await this.findOne(id);
    await this.cartItemRepository.softRemove(cartItem);
  }
}
