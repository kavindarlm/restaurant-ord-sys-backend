import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwtauthGuard';
import { GetUser } from './get-user.decorater';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser() user: any) {
    // Return user information without sensitive data
    // The JwtAuthGuard will automatically throw 401 if token is expired or invalid
    return {
      success: true,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        user_role: user.user_role,
      },
      message: 'Token is valid',
    };
  }
}
