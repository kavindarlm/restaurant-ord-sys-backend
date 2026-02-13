import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { PaymentService } from '../payment/payment.service';  // Import PaymentService
import { CartService } from '../cart/cart.service';  // Import CartService
import { CreateOrderDto } from './dto/create-order.dto';
import { DishService } from 'src/dish/dish.service';
import { UpdateOrderStateDto } from './dto/update-order.dto';
import { EncryptionService } from 'src/common/encryption.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly paymentService: PaymentService,
    private readonly cartService: CartService,
    private readonly dishService: DishService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // Create order after payment is made
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Step 1: Save payment details
    const payment = await this.paymentService.createPayment(createOrderDto.payment);

    //decrypt cart_id and convert to number
    const decryptedCartId = this.encryptionService.decrypt(createOrderDto.cart_id);

    // Step 2: Retrieve cart information by cart_id (sent from frontend)
    const cart = await this.cartService.getCartById(decryptedCartId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    // Step 3: Create the order and link payment and cart
    const order = this.orderRepository.create({
      order_status: 'Pending',  // or other statuses as needed
      payment_id: payment.payment_id,
      cart_id: decryptedCartId,
      totale_price: createOrderDto.total_price,  // Assuming cart has total_price
      is_deleted: false,
      payment,
      cart,
      order_time: new Date(),  // Set the order_time to the current date and time
    });

    return await this.orderRepository.save(order);
  }

  // Retrieve all orders
  async getOrderDetails(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { order_id: orderId, is_deleted: false },
      relations: ['cart', 'cart.cartItems', 'cart.table'],
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    const { order_id, order_status, cart } = order;
    const tableNo = cart.table?.table_name || 'Unknown';
    const orderItems = cart.cartItems.map(item => ({
      item_id: item.cart_item_id,
      quantity: item.quantity,
      price: item.dish.dishPrices,
    }));

    return {
      order_id,
      order_status,
      table_no: tableNo,
      order_items: orderItems,
    };
  }

  async getAllOrders(): Promise<any[]> {
    const orders = await this.orderRepository.find({
      relations: ['cart', 'cart.cartItems', 'cart.table'],
    });

    // Map orders with dish names
    const mappedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await Promise.all(
          order.cart.cartItems.map(async (item) => {
            const dishName = await this.dishService.getDishNameById(item.dish_id);
            return {
              cart_item_id: item.cart_item_id,
              dish_name: dishName,
              quantity: item.quantity,
            };
          }),
        );

        return {
          order_id: order.order_id,
          order_status: order.order_status,
          order_items: orderItems,
          table_no: order.cart.table.table_id,
          order_time: order.order_time
        };
      }),
    );

    return mappedOrders;
  }

  // Method to update the order state
  async updateOrderState(order_id: number, updateOrderStateDto: UpdateOrderStateDto): Promise<Order> {
    // Find the order by ID
    const order = await this.orderRepository.findOne({ where: { order_id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${order_id} not found`);
    }

    // Update the order state
    order.order_status = updateOrderStateDto.order_status;

    // Save the updated order
    await this.orderRepository.save(order);

    return order;
  }

  // Method to get the count of pending orders
  async getPendingOrdersCount(): Promise<number> {
    try {
      const count = await this.orderRepository.count({
        where: {
          order_status: 'Pending',
          is_deleted: false,  // Exclude deleted orders
        },
      });
      return count;
    } catch (e) {
      throw new Error('Error fetching pending orders count'+e);
    }
  }

  // Method to get daily income (sum of total_price for orders today)
  async getDailyIncome(): Promise<number> {
    try {
      const today = new Date();
      // Set the time for today to 00:00:00
      today.setHours(0, 0, 0, 0);
      
      // Set the time for the next day to 23:59:59
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Query for orders placed today with a status of 'Completed' or 'Paid'
      const income = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totale_price)', 'totalIncome')
        // .where('order.order_status = :status', { status: 'Complete' })
        .andWhere('order.order_time >= :today', { today: today.toISOString() })
        .andWhere('order.order_time < :tomorrow', { tomorrow: tomorrow.toISOString() })
        .getRawOne();
      
      // Return the total income for today (or 0 if no orders)
      return income.totalIncome ? parseFloat(income.totalIncome) : 0;
    } catch (error) {
      throw new Error('Error fetching daily income'+error);
    }
  }

  // Method to get daily completed orders
  async getDailyCompletedOrders(): Promise<Order[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // Set time to 00:00:00

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);  // Set time to 23:59:59

      // Query for completed orders placed today
      const completedOrders = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.order_status = :status', { status: 'Complete' })
        .andWhere('order.order_time >= :today', { today: today.toISOString() })
        .andWhere('order.order_time < :tomorrow', { tomorrow: tomorrow.toISOString() })
        .getMany();

      return completedOrders;
    } catch (error) {
      throw new Error('Error fetching daily completed orders'+error);
    }
  }

  // Method to get the count of daily completed orders
  async getDailyCompletedOrdersCount(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // Set time to 00:00:00

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);  // Set time to 23:59:59

      // Query for completed orders placed today
      const count = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.order_status = :status', { status: 'Complete' })
        .andWhere('order.order_time >= :today', { today: today.toISOString() })
        .andWhere('order.order_time < :tomorrow', { tomorrow: tomorrow.toISOString() })
        .getCount();  // Get the count instead of fetching all orders

      return count;
    } catch (error) {
      throw new Error('Error fetching daily completed orders count'+error);
    }
  }

  // Method to get weekly income by days (Mon-Sun)
  async getWeeklyIncomeByDay(): Promise<{ day: string; income: number }[]> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday of last week
      startOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7); // Set to next Sunday
      endOfWeek.setHours(23, 59, 59, 999); // Set time to 23:59:59

      // Query to get the total income grouped by day of the week for the past 7 days
      const weeklyIncome = await this.orderRepository
        .createQueryBuilder('order')
        .select('DAYOFWEEK(order.order_time) AS dayOfWeek') // Use DAYOFWEEK() here
        .addSelect('SUM(order.totale_price)', 'totalIncome')
        // .where('order.order_status = :status', { status: 'Complete' })
        .andWhere('order.order_time >= :startOfWeek', { startOfWeek: startOfWeek.toISOString() })
        .andWhere('order.order_time <= :endOfWeek', { endOfWeek: endOfWeek.toISOString() })
        .groupBy('dayOfWeek')
        .getRawMany();

      // Map the result to the days of the week (Mon-Sun)
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const result = daysOfWeek.map((day, index) => {
        const income = weeklyIncome.find(
          (incomeRecord) => incomeRecord.dayOfWeek === index + 1,
        );
        return {
          day,
          income: income ? parseFloat(income.totalIncome) : 0,
        };
      });

      return result;
    } catch (error) {
      throw new Error('Error fetching weekly income by day'+error);
    }
  }
}
