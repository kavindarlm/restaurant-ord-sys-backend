import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Cart } from "../../cart/entities/cart.entity";
import { Payment } from "../../payment/entities/payment.entity";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    order_id : number;

    @Column({})
    order_status : string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    order_time : Date;

    @Column({})
    payment_id: number;

    @Column({})
    cart_id : number;

    @Column({})
    totale_price : number;

    @Column({default: false})
    is_deleted: boolean;

    @OneToOne(() => Cart)
    @JoinColumn({ name: 'cart_id' })
    cart: Cart;

    @OneToOne(() => Payment)
    @JoinColumn({ name: 'payment_id' })
    payment: Payment;

}
