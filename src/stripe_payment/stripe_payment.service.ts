import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe'; // Importing directly
import * as dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { DishPrice } from 'src/dish/entities/dish_price.entity';
import { SecurityLoggerService } from 'src/security-logging/security-logger.service';

dotenv.config();

@Injectable()
export class StripePaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,

    @InjectRepository(DishPrice)
    private dishPriceRepo: Repository<DishPrice>,

    private readonly securityLogger: SecurityLoggerService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  // Create a payment intent
  async createPaymentIntent(cartId: number, currency: string, totalAmount: number) {
    const cart = await this.cartRepo.findOne({
      where: { cart_id: cartId, is_deleted: false },
    });

    if (!cart) {
      throw new BadRequestException('Invalid cart id');
    }

    const cartItems = await this.cartItemRepo.find({
      where: {
        cart: { cart_id: cartId },
        is_deleted: false,
      },
      relations: ['dish'],
    });

    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }

    let total = 0;

    for (const item of cartItems) {

      // --- get one price of that dish (ignore size for now) ---
      const priceRecord = await this.dishPriceRepo.findOne({
        where: {
          dish: { dish_id: item.dish_id },
        },
      });

      if (!priceRecord) {
        throw new BadRequestException(
          `Price not found for dish ${item.dish_id}`,
        );
      }

      total += item.quantity * priceRecord.price;
    }

    const amountInCents = Math.round(total * 100);

    if (Math.abs(total - totalAmount) > 0.01) {
      this.securityLogger.logPriceMismatch(
        String(cartId),
        total,         
        totalAmount     
      );
      throw new BadRequestException('Cart total mismatch detected');
    }

    if (amountInCents < 50 && currency === 'usd') {
      throw new BadRequestException('Amount too small for Stripe');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({

        amount: amountInCents, // Amount in cents
        currency: currency,

        metadata: {
          cartId: String(cartId),
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        amount: total,        // for UI display only
        cartId: cartId,
      };
    } catch (error) {
      if (error) {
          throw new BadRequestException(`Error creating payment intent: ${error.message}`);
      }
    }
  }
}
