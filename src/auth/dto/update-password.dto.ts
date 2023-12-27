import { MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @MinLength(6, {
    message: 'The confirm password field must be at least 6 characters long',
  })
  @MaxLength(20, {
    message: 'The confirm password field must be less than 20 characters long',
  })
  password: string;
}
