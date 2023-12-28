import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import * as fs from 'fs';
import { promisify } from 'util';
import { PrismaService } from '../database/prisma.service';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkerDto: CreateWorkerDto) {
    const { name } = createWorkerDto;
    const worker = await this.prisma.worker.findUnique({
      where: { name },
    });
    if (worker) throw new ConflictException('Worker already exists');
    try {
      await this.prisma.worker.create({
        data: {
          ...createWorkerDto,
          skills: {
            connect: createWorkerDto.skills.map((skill) => ({ id: skill })),
          },
        },
      });
    } catch {
      throw new BadRequestException('Bad request, try again');
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Worker added successfully',
    };
  }

  async findAll(offset: number = 0, limit: number = 0): Promise<any> {
    const workers = await this.prisma.worker.findMany({
      skip: offset,
      take: limit,
      include: {
        skills: true,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      workers,
    };
  }

  async findOne(id: number): Promise<any> {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      include: {
        skills: true,
        images: true,
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return {
      statusCode: 200,
      worker,
    };
  }

  async update(id: number, updateWorkerDto: UpdateWorkerDto): Promise<any> {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    try {
      await this.prisma.worker.update({
        where: { id },
        data: {
          ...updateWorkerDto,
          skills: {
            connect: updateWorkerDto.skills.map((skill) => ({ id: skill })),
          },
        },
      });
    } catch {
      throw new BadRequestException('Bad request, try again');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Worker updated successfully',
    };
  }

  async remove(id: number): Promise<any> {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
    });
    if (!worker) throw new NotFoundException('User not found');
    await this.prisma.worker.delete({
      where: { id },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Worker deleted successfully',
    };
  }

  async uploadImage(id: number, image: Express.Multer.File): Promise<any> {
    await this.prisma.worker.update({
      where: { id },
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
    const { worker } = await this.findOne(id);
    const image = worker.images.find((image: any) => image.id === imageId);
    if (!image) throw new NotFoundException('Image not found');
    await unlinkAsync(`./uploads/${image.thumb}`);
    await this.prisma.worker.update({
      where: { id },
      data: {
        images: {
          set: worker.images,
        },
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
    };
  }
}
