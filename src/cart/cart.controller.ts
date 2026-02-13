import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Admin endpoints - use numeric IDs (keep existing functionality)
  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }

  // Customer-facing endpoints - use encrypted IDs for security
  @Post('table/:encryptedTableId')
  async createCartForTable(
    @Param('encryptedTableId') encryptedTableId: string,
    @Body() createCartDto: CreateCartDto
  ) {
    try {
      const result = await this.cartService.createWithEncryptedTableId(
        createCartDto,
        encryptedTableId
      );
      return {
        message: 'Cart created successfully',
        encryptedCartId: result.encryptedCartId,
        cart: result.cart
      };
    } catch (error) {
      throw new BadRequestException('Invalid table identifier or cart creation failed');
    }
  }

  @Get('secure/:encryptedCartId')
  async findCartByEncryptedId(@Param('encryptedCartId') encryptedCartId: string) {
    try {
      return await this.cartService.findOneByEncryptedId(encryptedCartId);
    } catch (error) {
      throw new BadRequestException('Invalid cart identifier');
    }
  }
}
