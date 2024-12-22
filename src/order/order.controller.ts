import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { UpdateOrderStateDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Endpoint to create an order
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  // Endpoint to retrieve order details
  @Get(':id')
  async getOrderDetails(@Param('id') id: string) {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      throw new Error('Invalid order ID');
    }

    return this.orderService.getOrderDetails(orderId);
  }

  // Endpoint to retrieve all orders
  @Get()
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }
  
  // Update the state of the order
  @Patch('state/:order_id')
  async updateOrderState(
    @Param('order_id') order_id: number,
    @Body() updateOrderStateDto: UpdateOrderStateDto,
  ) {
    return this.orderService.updateOrderState(order_id, updateOrderStateDto);
  }

  @Get('pendingcount/count')
  async getPendingOrdersCount(): Promise<number> {
    const count = await this.orderService.getPendingOrdersCount();
    return  count ;
  }
  
  // Endpoint to get daily income
  @Get('dailyincome/income')
  async getDailyIncome(): Promise<number> {
    const income = await this.orderService.getDailyIncome();
    return income;
  }
  
  // Endpoint to get daily completed orders
  @Get('dailycompletedorders/total')
  async getDailyCompletedOrders(): Promise<Order[]> {
    const completedOrders = await this.orderService.getDailyCompletedOrders();
    return completedOrders;
  }

  // Endpoint to get the count of daily completed orders
  @Get('dailycompletedorderscount/count')
  async getDailyCompletedOrdersCount(): Promise<number> {
    const count = await this.orderService.getDailyCompletedOrdersCount();
    return  count ;
  }

  @Get('weeklyincome/byDays')
  async getWeeklyIncomeByDay(): Promise<{ day: string; income: number }[]> {
    const weeklyIncome = await this.orderService.getWeeklyIncomeByDay();
    return weeklyIncome;
  }
}
