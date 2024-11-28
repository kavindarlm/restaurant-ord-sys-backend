import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne, Unique } from "typeorm";
import { CartItem } from "../../cart_items/entities/cart_item.entity";
import { Order } from "../../order/entities/order.entity";
import { Table } from "../../table/entities/table.entity";

@Entity('carts')
@Unique(['table', 'is_active'])
export class Cart {
    @PrimaryGeneratedColumn()
    cart_id : number;

    @Column({})
    cart_status : string;

    @OneToMany(() => CartItem, cartItem => cartItem.cart)
    cartItems: CartItem[];

    @OneToOne(() => Order, order => order.cart)
    order: Order;

    @ManyToOne(() => Table, table => table.carts)
    table: Table;

    @Column({ default: false })
    is_active: boolean;
}
