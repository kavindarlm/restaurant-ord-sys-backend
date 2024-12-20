
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Dish } from "./dish.entity";

@Entity('dish_prices')
export class DishPrice {
    @PrimaryGeneratedColumn()
    price_id: number;

    @Column({nullable: false})
    size: string;

    @Column({nullable: false})
    price: number;

    @ManyToOne(() => Dish, dish => dish.dishPrices)
    dish: Dish;
}