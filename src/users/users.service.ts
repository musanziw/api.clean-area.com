import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as fs from 'fs';
import { promisify } from 'util';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { email } = createUserDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) throw new ConflictException('User already exists');
    try {
      const password: string = await bcrypt.hash(createUserDto.password, 10);
      await this.prisma.user.create({
        data: {
          ...createUserDto,
          password,
          roles: {
            connect: createUserDto.roles.map((role: number) => ({ id: role })),
          },
        },
      });
    } catch {
      throw new BadRequestException('Bad request, try again');
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User added successfully',
    };
  }

  async register(registerDto: CreateUserDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (user) throw new ConflictException('User already exists');
    const password: string = await bcrypt.hash(registerDto.password, 10);
    await this.prisma.user.create({
      data: {
        ...registerDto,
        password,
        roles: {
          connect: {
            id: 1,
          },
        },
      },
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Registration successful',
    };
  }

  async findAll(offset: number, limit: number): Promise<any> {
    const users = await this.prisma.user.findMany({
      skip: offset,
      take: limit,
      include: {
        images: true,
        roles: true,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      users,
    };
  }

  async findById(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        images: true,
        roles: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      statusCode: HttpStatus.OK,
      user,
    };
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
          roles: {
            set: updateUserDto.roles.map((role: number) => ({ id: role })),
          },
        },
      });
    } catch {
      throw new BadRequestException('Invalid roles');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
    };
  }

  async updatePassword(id: number, password: string): Promise<void> {
    const passwordHash: string = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: id },
      data: {
        password: passwordHash,
      },
    });
  }

  async saveResetToken(id: number, resetToken: string): Promise<any> {
    await this.prisma.user.update({
      where: { id: id },
      data: {
        resetToken,
      },
    });
  }

  async remove(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({
      where: { id },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
    };
  }

  async findByResetToken(resetToken: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async uploadImage(id: number, image: Express.Multer.File): Promise<any> {
    const { user } = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: id },
      data: {
        images: {
          create: {
            thumb: image.filename,
          },
        },
      },
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Image saved successfully',
    };
  }

  async deleteImage(id: number, imageId: number): Promise<any> {
    const { data: user } = await this.findById(id);
    const image = user.images.find((image: any) => image.id === imageId);
    if (!image) throw new NotFoundException('Image not found');
    await unlinkAsync(`./uploads/${image.thumb}`);
    await this.prisma.user.update({
      where: { id: id },
      data: {
        images: {
          delete: {
            id: imageId,
          },
        },
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
    };
  }

  async removeResetToken(id: any) {
    await this.prisma.user.update({
      where: { id },
      data: {
        resetToken: null,
      },
    });
  }
}
