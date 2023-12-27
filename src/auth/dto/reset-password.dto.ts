import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  reset_token: string;

  @IsNotEmpty()
  password: string;
}
