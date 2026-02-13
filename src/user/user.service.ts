import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  private readonly MAX_LOGIN_ATTEMPTS = 3;
  private readonly LOCK_TIME_MINUTES = 1;

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
    const user = await this.userRepository.findOne({ where: { user_email: loginUserDto.user_email } });
    if (!user || !user.user_password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!loginUserDto.user_password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const now = new Date();

    // Check if account is locked
    if (user.locked_until) {
      const lockedUntil = new Date(user.locked_until);
      
      // Check if lock time has passed
      if (now < lockedUntil) {
        // Account is still locked
        const remainingMs = lockedUntil.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        const remainingSeconds = Math.ceil((remainingMs % 60000) / 1000);
        throw new UnauthorizedException(`Account is locked. Please wait ${remainingMinutes} minute(s) and ${remainingSeconds} second(s) before trying again.`);
      } else {
        // 15 minutes have passed, unlock the account
        user.failed_login_attempts = 0;
        user.locked_until = null;
        await this.userRepository.save(user);
      }
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.user_password, user.user_password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failed_login_attempts += 1;

      // Lock account if failed attempts reach MAX_LOGIN_ATTEMPTS
      if (user.failed_login_attempts >= this.MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(now.getTime() + this.LOCK_TIME_MINUTES * 60000);
        user.locked_until = lockUntil;
        await this.userRepository.save(user);
        throw new UnauthorizedException(`Account locked due to multiple failed login attempts. Please try again after ${this.LOCK_TIME_MINUTES} minutes.`);
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException(`Invalid email or password. ${this.MAX_LOGIN_ATTEMPTS - user.failed_login_attempts} attempt(s) remaining before account lock.`);
    }

    // Successful login - reset failed attempts
    if (user.failed_login_attempts > 0) {
      user.failed_login_attempts = 0;
      user.locked_until = null;
      await this.userRepository.save(user);
    }

    const payload = { email: user.user_email, sub: user.user_id, role: user.user_role };
    const token = this.jwtService.sign(payload);
    return token;
  }
}
