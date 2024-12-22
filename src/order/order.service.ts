import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { PaymentService } from '../payment/payment.service';  // Import PaymentService
import { CartService } from '../cart/cart.service';  // Import CartService
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly paymentService: PaymentService,
    private readonly cartService: CartService,
  ) {}

  // Create order after payment is made
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Step 1: Save payment details
    const payment = await this.paymentService.createPayment(createOrderDto.payment);

    // Step 2: Retrieve cart information by cart_id (sent from frontend)
    const cart = await this.cartService.getCartById(createOrderDto.cart_id);

    if (!cart) {
      throw new Error('Cart not found');
    }

    // Step 3: Create the order and link payment and cart
    const order = this.orderRepository.create({
      order_status: 'Pending',  // or other statuses as needed
      payment_id: payment.payment_id,
      cart_id: createOrderDto.cart_id,
      totale_price: createOrderDto.total_price,  // Assuming cart has total_price
      is_deleted: false,
      payment,
      cart,
    });

    return await this.orderRepository.save(order);
  }
}
