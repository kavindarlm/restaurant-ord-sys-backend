import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { Category } from "../../category/entities/category.entity";
import { CartItem } from "../../cart_items/entities/cart_item.entity";

@Entity('dishes')
export class Dish {
    @PrimaryGeneratedColumn()
    dish_id : number;

    @Column({nullable: false, default: 'New Dish'})
    dish_name : string;

    @Column({})
    dish_price : number;

    @Column({})
    dish_description : string;

    @Column({})
    dish_image_url : string;

    @ManyToOne(() => Category, category => category.dishes)
    category: Category;

    @OneToMany(() => CartItem, cartItem => cartItem.dish)
    cartItems: CartItem[];
}
