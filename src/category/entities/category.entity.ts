import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Dish } from "../../dish/entities/dish.entity";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    category_id : number;

    @Column({nullable: false,})
    category_name : string;

    @Column({ nullable: true })
    category_image_url : string;

    @Column({ nullable: true }) 
    category_description : string;

    @Column({default: false})
    is_deleted: boolean;

    @OneToMany(() => Dish, dish => dish.category)
    dishes: Dish[];
}
