import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalGuard } from './guards/local.guard';
import { Request } from 'express';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SerializedUser } from '../types/serialized-user';
import { PasswordService } from './password.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authPasswordService: PasswordService,
  ) {}

  @Get('logout')
  logout(@Req() request: Request): Promise<any> {
    return this.authService.logout(request);
  }

  @Get('profile')
  profile(@CurrentUser() user: SerializedUser) {
    return this.authService.profile(user);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: SerializedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user, updateProfileDto);
  }

  @Patch('update-password')
  updatePassword(
    @CurrentUser() user: SerializedUser,
    @Body() updatePassword: UpdatePasswordDto,
  ): Promise<any> {
    return this.authPasswordService.updatePassword(user, updatePassword);
  }

  @Public()
  @UseGuards(LocalGuard)
  @Post('login')
  login(): Promise<any> {
    return this.authService.login();
  }

  @Public()
  @Post('reset-password-request')
  resetPasswordRequest(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<any> {
    return this.authPasswordService.resetPasswordRequest(resetPasswordDto);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<any> {
    return this.authPasswordService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<any> {
    return this.authService.register(registerDto);
  }
}
