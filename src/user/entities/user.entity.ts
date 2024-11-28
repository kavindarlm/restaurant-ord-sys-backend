import { Entity, PrimaryGeneratedColumn,Column } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    user_id : number;

    @Column({nullable: false, default: 'New User'})
    user_name : string;

    @Column({})
    user_email : string;

    @Column({})
    user_password : string;

    @Column({})
    user_role : string;
}
