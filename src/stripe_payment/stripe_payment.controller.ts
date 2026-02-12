import { Controller, Post, Body } from '@nestjs/common';
import {  StripePaymentService } from './stripe_payment.service';



@Controller('payments')
export class StripePaymentController {
  constructor(private readonly paymentService: StripePaymentService) {}

  // Endpoint to create a payment intent
  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { cartId: number, currency: string, totalAmount: number }) {
    const { cartId, currency, totalAmount } = body;
 
    // Call service to create a payment intent
    const paymentIntent = await this.paymentService.createPaymentIntent(cartId, currency, totalAmount);
    return paymentIntent;
  }
}
