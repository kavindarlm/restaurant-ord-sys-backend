import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
    user_name: string;
    user_email: string;
    user_password: string;
    user_role: UserRole;
}
