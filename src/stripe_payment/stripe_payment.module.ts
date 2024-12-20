// src/payment/stripe_payment.module.ts
import { Module } from '@nestjs/common';
import { StripePaymentService } from './stripe_payment.service';
import { StripePaymentController } from './stripe_payment.controller';


@Module({
  controllers: [StripePaymentController],
  providers: [StripePaymentService],
})
export class StripePaymentModule {}
