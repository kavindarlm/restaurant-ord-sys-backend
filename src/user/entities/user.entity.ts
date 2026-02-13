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

    @Column({default: false})
    is_deleted: boolean;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'})
    updated_at: Date;

    // Number of failed login attempts
    @Column({default: 0})
    failed_login_attempts: number;

    // Timestamp when the account will be unlocked (null if not locked)
    @Column({type: 'timestamp', nullable: true, default: null})
    locked_until: Date;
}
