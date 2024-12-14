import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Cart } from "../../cart/entities/cart.entity";

@Entity('tables')
export class Table {
    @PrimaryGeneratedColumn()
    table_id : number;

    @Column({nullable: false, default: 'New Table'})
    table_name : string;

    @Column({ type: 'text', nullable: true })
    qr_code: string;

    @OneToMany(() => Cart, cart => cart.table)
    carts: Cart[];
}
