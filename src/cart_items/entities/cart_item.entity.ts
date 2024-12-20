import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Dish } from "../../dish/entities/dish.entity";
import { Cart } from "../../cart/entities/cart.entity";

@Entity("cart_items")
export class CartItem {
    @PrimaryGeneratedColumn({}) 
    cart_item_id: number;

    @Column()
    quantity: number;

    @Column()
    dish_id: number;

    @Column({default: false})
    is_deleted: boolean;

    @ManyToOne(() => Dish, dish => dish.cartItems)
    dish: Dish;

    @ManyToOne(() => Cart, cart => cart.cartItems)
    cart: Cart;
}
