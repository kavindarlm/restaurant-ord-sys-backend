import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enum/user-role.enum';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (![UserRole.ADMIN, UserRole.USER].includes(createUserDto.user_role)) {
      throw new Error('Invalid user role');
    }
    const salt = await bcrypt.genSalt();
    createUserDto.user_password = await bcrypt.hash(createUserDto.user_password, salt);
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { user_id:id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOne({where: {user_id:id}});
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async login(loginUserDto: LoginUserDto): Promise<string> {
  const user = await this.userRepository.findOne({
    where: { user_email: loginUserDto.user_email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(
    loginUserDto.user_password,
    user.user_password
  );

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const payload = {
    email: user.user_email,
    sub: user.user_id,
    role: user.user_role,
  };

  return this.jwtService.sign(payload);
}


}
