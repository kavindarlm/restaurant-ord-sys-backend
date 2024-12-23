import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Cart } from "src/cart/entities/cart.entity";
import { CartItem } from "src/cart_items/entities/cart_item.entity";
import { Category } from "src/category/entities/category.entity";
import { Dish } from "src/dish/entities/dish.entity";
import { Order } from "src/order/entities/order.entity";
import { Payment } from "src/payment/entities/payment.entity";
import { Table } from "src/table/entities/table.entity";
import { User } from "src/user/entities/user.entity";
import { DishPrice } from '../dish/entities/dish_price.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions ={
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
        Cart,CartItem,Category,Dish,Order,Payment,Table,User,DishPrice
    ],
    synchronize: true,
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized : false,
        },
    },
};