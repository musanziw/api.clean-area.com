import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CurrentUser } from './decorators/user.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';

@Injectable()
export class PasswordService {
  constructor(private readonly userService: UsersService) {}

  async updatePassword(
    @CurrentUser() currentUser: any,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<any> {
    const { email } = currentUser;
    const user = await this.userService.findByEmail(email);
    const { password } = updatePasswordDto;
    await this.userService.updatePassword(user, password);
    return {
      statusCode: HttpStatus.OK,
      message: 'Password updated successfully',
    };
  }

  async resetPasswordRequest(
    resetPasswordRequestDto: ResetPasswordRequestDto,
  ): Promise<any> {
    const { email } = resetPasswordRequestDto;
    const user = await this.userService.findByEmail(email);
    await this.userService.saveResetToken(user, '123456');
    return {
      statusCode: HttpStatus.OK,
      message: 'Token number sent by email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    const { reset_token, password } = resetPasswordDto;
    const user = await this.userService.findByResetToken(reset_token);
    await this.userService.removeResetToken(user);
    await this.userService.updatePassword(user.id, password);
    return {
      statusCode: HttpStatus.OK,
      message: 'Password changed successfully',
    };
  }
}
