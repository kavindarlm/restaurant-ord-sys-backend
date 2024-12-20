import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwtStrategy';
import { JwtAuthGuard } from './jwtauthGuard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'secret', // Use a more secure secret in production
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtStrategy, JwtAuthGuard, JwtModule],
})
export class AuthModule {}