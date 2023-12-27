import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SerializedUser } from '../types/serialized-user';

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
      roles: user.roles.map((role) => role.name),
    } as SerializedUser;
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

  async profile(@CurrentUser() user: SerializedUser): Promise<any> {
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

  register(registerDto: RegisterDto): Promise<any> {
    return this.usersService.register(registerDto);
  }
}
