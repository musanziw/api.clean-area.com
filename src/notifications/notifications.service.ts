import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    private mailService: MailerService,
    private configService: ConfigService,
  ) {}

  @OnEvent('user.created')
  async welcome({ payload }): Promise<void> {
    const { email, password } = payload;
    try {
      await this.mailService.sendMail({
        to: email,
        from: this.configService.get('MAIL_USERNAME'),
        subject: 'Welcome to starter',
        template: 'welcome',
        context: {
          email,
          password,
        },
      });
    } catch {
      throw new HttpException('Bad request, try again', HttpStatus.BAD_REQUEST);
    }
  }

  @OnEvent('password.reset')
  async passwordReset({ payload }): Promise<void> {
    const { email, password } = payload;
    try {
      await this.mailService.sendMail({
        to: email,
        from: this.configService.get('MAIL_USERNAME'),
        subject: 'Password reset',
        template: 'password-reset',
        context: {
          email,
          password,
        },
      });
    } catch {
      throw new HttpException('Bad request, try again', HttpStatus.BAD_REQUEST);
    }
  }
}
