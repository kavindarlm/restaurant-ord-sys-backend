import { Controller, Post, Body } from '@nestjs/common';
import {  StripePaymentService } from './stripe_payment.service';



@Controller('payments')
export class StripePaymentController {
  constructor(private readonly paymentService: StripePaymentService) {}

  // Endpoint to create a payment intent
  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number, currency: string }) {
    const { amount, currency } = body
 
    // Call service to create a payment intent
    const paymentIntent = await this.paymentService.createPaymentIntent(amount, currency);
    return paymentIntent;
  }
}
