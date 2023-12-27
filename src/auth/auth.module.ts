import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { Session } from './session';
import { PasswordService } from './password.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, Session, PasswordService],
})
export class AuthModule {}
