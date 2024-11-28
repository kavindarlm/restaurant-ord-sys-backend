import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Dish } from "../../dish/entities/dish.entity";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    category_id : number;

    @Column({nullable: false, default: 'New Category'})
    category_name : string;

    @Column({}) 
    category_description : string;

    @OneToMany(() => Dish, dish => dish.category)
    dishes: Dish[];
}
