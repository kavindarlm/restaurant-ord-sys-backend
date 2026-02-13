import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../Auth/jwtauthGuard';
import { RolesGuard } from '../Auth/roles.guard';
import { Roles } from '../Auth/roles.decorator';
import { GetUser } from '../Auth/get-user.decorater';
import { UserRole } from './enum/user-role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Admin only - Get all users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  // Users can view their own profile, admins can view any profile
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string, @GetUser() user: any) {
    const requestedId = +id;
    // Users can only view their own profile unless they're admin
    if (user.user_role !== UserRole.ADMIN && user.user_id !== requestedId) {
      throw new UnauthorizedException('You can only view your own profile');
    }
    return this.userService.findOne(requestedId);
  }

  // Users can update their own profile, admins can update any profile
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @GetUser() user: any) {
    const requestedId = +id;
    // Users can only update their own profile unless they're admin
    if (user.user_role !== UserRole.ADMIN && user.user_id !== requestedId) {
      throw new UnauthorizedException('You can only update your own profile');
    }
    return this.userService.update(requestedId, updateUserDto);
  }

  // Admin only - Delete user
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('login')
async login(
  @Body() loginUserDto: LoginUserDto,
  @Res({ passthrough: true }) res: Response
) {
  const token = await this.userService.login(loginUserDto);

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours (matches JWT expiration)
  });

  return { message: 'Login successful' };
}


  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logout successful' };
  }

}
