import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
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
    secure: false,        // true in production (HTTPS)
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  return { message: 'Login successful' };
}


  @Post('logout')
logout(@Res({ passthrough: true }) res: Response) {
  res.clearCookie('access_token');
  return { message: 'Logout successful' };
}

}
