import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Cart } from "../../cart/entities/cart.entity";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    order_id : number;

    @Column({})
    order_status : string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    order_time : Date;

    @Column({default: false})
    payment_status : boolean;

    @Column({})
    cart_id : number;

    @Column({})
    totale_price : number;

    @OneToOne(() => Cart)
    @JoinColumn({ name: 'cart_id' })
    cart: Cart;

}
