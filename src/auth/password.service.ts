import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from '../users/entities/user.entity';
import { SerializedUser } from '../types/serialized-user';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailPayload } from '../types/email-payload';
import { randomPassword } from '../helpers/random-password';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';

@Injectable()
export class PasswordService {
  constructor(
    private readonly userService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updatePassword(
    @CurrentUser() currentUser: SerializedUser,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<any> {
    const { email } = currentUser;
    const user: User = await this.userService.findByEmail(email);
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
    const password: string = randomPassword();
    const user: User = await this.userService.findByEmail(email);
    await this.userService.saveResetToken(user, password);
    const payload: EmailPayload = { email, password };
    await this.eventEmitter.emitAsync('password.reset', { payload });
    return {
      statusCode: HttpStatus.OK,
      message: 'Token number sent by email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    const { reset_token, password } = resetPasswordDto;
    const user: User = await this.userService.findByResetToken(reset_token);
    await this.userService.removeResetToken(user);
    await this.userService.updatePassword(user, password);
    return {
      statusCode: HttpStatus.OK,
      message: 'Password changed successfully',
    };
  }
}
