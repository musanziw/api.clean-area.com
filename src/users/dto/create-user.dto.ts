import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'The name field must be a string' })
  name: string;

  @IsEmail({}, { message: 'The email field must be a valid email address' })
  email: string;

  @IsOptional()
  is_active: boolean;

  @IsString({ message: 'The password field must be a string' })
  password: string;

  @IsArray({ message: 'The roles field must be an array of role IDs' })
  roles: number[];
}
