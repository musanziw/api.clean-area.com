import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { CurrentUser } from './decorators/user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    const passwordMatch: boolean = await this.passwordMatch(
      password,
      user.password,
    );
    if (!passwordMatch)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((role: any) => role.name),
    };
  }

  async passwordMatch(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async login(): Promise<any> {
    return {
      message: 'Login successful',
      statusCode: HttpStatus.OK,
    };
  }

  async logout(@Req() request: Request): Promise<any> {
    request.session.destroy(() => {});
    return {
      message: 'Logout successful',
      statusCode: HttpStatus.OK,
    };
  }

  async profile(@CurrentUser() user: any): Promise<any> {
    return {
      statusCode: HttpStatus.OK,
      data: user,
    };
  }

  async updateProfile(
    @CurrentUser() user: any,
    updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    const { id } = user;
    await this.usersService.update(+id, updateProfileDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully',
    };
  }

  register(registerDto: CreateUserDto): Promise<any> {
    return this.usersService.register(registerDto);
  }
}
