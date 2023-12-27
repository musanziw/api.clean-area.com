import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomPassword } from '../helpers/random-password';
import { EmailPayload } from '../types/email-payload';
import { paginate } from '../helpers/paginate';
import { ImagesService } from '../images/images.service';
import { Image } from '../images/entities/image.entity';
import * as fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly imagesService: ImagesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { email } = createUserDto;
    const user: User = await this.userRepository.findOneBy({ email });
    if (user) throw new ConflictException('User already exists');
    try {
      const password: string = randomPassword();
      await this.userRepository.save({
        ...createUserDto,
        password,
        roles: createUserDto.roles.map((role) => ({ id: role })),
      });
      const payload: EmailPayload = { email, password };
      await this.eventEmitter.emitAsync('user.created', { payload });
    } catch {
      throw new BadRequestException('Bad request, try again');
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User added successfully',
    };
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const user = await this.userRepository.findOneBy({
      email: registerDto.email,
    });
    if (user) throw new ConflictException('User already exists');
    await this.userRepository.save({
      ...registerDto,
      roles: registerDto.roles.map((role: number) => ({ id: role })),
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Registration successful',
    };
  }

  async findAll(page: number): Promise<any> {
    const { offset, limit } = paginate(page, 12);
    const users: User[] = await this.userRepository.find({
      select: ['id', 'name', 'email', 'is_active', 'created_at'],
      skip: offset,
      take: limit,
      relations: ['roles'],
    });
    return {
      statusCode: HttpStatus.OK,
      data: users,
    };
  }

  async findById(id: number): Promise<any> {
    const user: User | null = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'is_active', 'created_at'],
      relations: {
        images: true,
        roles: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      statusCode: HttpStatus.OK,
      data: user,
    };
  }

  async findByEmail(email: string): Promise<User> {
    const user: User | null = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    const updatedUser = Object.assign(user, updateUserDto);
    try {
      await this.userRepository.save({
        ...updatedUser,
        roles: updateUserDto.roles.map((role: number) => ({ id: role })),
      });
    } catch {
      throw new BadRequestException('Invalid roles');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
    };
  }

  async updatePassword(user: User, password: string): Promise<void> {
    user.password = password;
    await this.userRepository.save(user);
  }

  async saveResetToken(user: User, password: string): Promise<any> {
    user.reset_token = password;
    await this.userRepository.save(user);
  }

  async remove(id: number): Promise<any> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
    };
  }

  async findByResetToken(reset_token: string) {
    const user: User | null = await this.userRepository.findOneBy({
      reset_token,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async uploadImage(id: number, image: Express.Multer.File): Promise<any> {
    const { data: user } = await this.findById(id);
    const { data } = await this.imagesService.create({ thumb: image.filename });
    user.images.push(data);
    await this.userRepository.save(user);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Image saved successfully',
    };
  }

  async deleteImage(id: number, imageId: number): Promise<any> {
    const { data: user } = await this.findById(id);
    const image = user.images.find((image: Image) => image.id === imageId);
    if (!image) throw new NotFoundException('Image not found');
    await unlinkAsync(`./uploads/${image.thumb}`);
    user.images = user.images.filter((image: Image) => image.id !== imageId);
    await this.userRepository.save(user);
    await this.imagesService.remove(imageId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
    };
  }

  async removeResetToken(user: User) {
    user.reset_token = null;
    await this.userRepository.save(user);
  }
}
