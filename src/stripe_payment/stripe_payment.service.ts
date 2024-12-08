import { Injectable } from '@nestjs/common';
import Stripe from 'stripe'; // Importing directly

@Injectable()
export class StripePaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe('sk_test_51QRSxBRvJVs0SdRcGXOoKmClH1LOu0oZ0HHkXSrGkcRmNL7XoeBRcu9W3EqyJyyHLXhgnajdQE79zAF1OC4FksU400nhpehCRK', {
      apiVersion: '2024-11-20.acacia', // Use the correct version
    });
  }

  // Create a payment intent
  async createPaymentIntent(amount: number, currency: string) {
    console.log('Creating payment intent'+amount);
    if (amount < 50 && currency === 'usd') { // Example: Minimum for USD is 50 cents
      // throw new Error('The amount must be greater than or equal to the minimum chargeable amount.');
    }
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        
        amount: amount * 100, // Amount in cents
        currency: currency,
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      // throw new Error(`Error creating payment intent: ${error.message}`);
    }
  }
}
