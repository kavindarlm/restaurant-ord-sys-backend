import { CreatePaymentDto } from "src/payment/dto/create-payment.dto";


export class CreateOrderDto {
  cart_id: number;  // cart_id sent from frontend\
  total_price: number;  // total_price sent from frontend
  payment: CreatePaymentDto;  // Nested payment details from frontend
}
