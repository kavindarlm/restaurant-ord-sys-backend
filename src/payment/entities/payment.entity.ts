import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    payment_id : number;

    @Column({})
    customer_name : string;

    @Column({})
    customer_email : string;

    @Column({default: false})
    is_deleted: boolean;
}
