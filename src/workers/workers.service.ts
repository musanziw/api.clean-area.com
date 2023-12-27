import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Repository } from 'typeorm';
import { Worker } from './entities/worker.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from '../helpers/paginate';
import { ImagesService } from '../images/images.service';
import { Image } from '../images/entities/image.entity';
import * as fs from 'fs';
import { promisify } from 'util';
const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
    private readonly imagesService: ImagesService,
  ) {}

  async create(createWorkerDto: CreateWorkerDto) {
    const { name } = createWorkerDto;
    const worker = await this.workerRepository.findOneBy({ name });
    if (worker) throw new ConflictException('Worker already exists');
    try {
      await this.workerRepository.save({
        ...createWorkerDto,
        skills: createWorkerDto.skills.map((skill) => ({ id: skill })),
      });
    } catch {
      throw new BadRequestException('Bad request, try again');
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Worker added successfully',
    };
  }

  async findAll(page: number): Promise<any> {
    const { limit, offset } = paginate(page, 12);
    const workers = await this.workerRepository.find({
      relations: ['skills'],
      take: limit,
      skip: offset,
    });
    return {
      statusCode: HttpStatus.OK,
      data: workers,
    };
  }

  async findOne(id: number): Promise<any> {
    const worker = await this.workerRepository.findOne({
      where: { id },
      relations: ['skills', 'images'],
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return {
      statusCode: 200,
      data: worker,
    };
  }

  async update(id: number, updateWorkerDto: UpdateWorkerDto): Promise<any> {
    const worker = await this.workerRepository.findOneBy({ id });
    if (!worker) throw new NotFoundException('Worker not found');
    const updatedWorker = Object.assign(worker, updateWorkerDto);
    try {
      await this.workerRepository.save({
        ...updatedWorker,
        skills: updateWorkerDto.skills.map((skill) => ({ id: skill })),
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
    const user: Worker | null = await this.workerRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    await this.workerRepository.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Worker deleted successfully',
    };
  }

  async uploadImage(id: number, image: Express.Multer.File): Promise<any> {
    const { data: worker } = await this.findOne(id);
    const { data } = await this.imagesService.create({ thumb: image.filename });
    worker.images.push(data);
    await this.workerRepository.save(worker);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Image saved successfully',
    };
  }

  async deleteImage(id: number, imageId: number): Promise<any> {
    const { data: worker } = await this.findOne(id);
    const image = worker.images.find((image: Image) => image.id === imageId);
    if (!image) throw new NotFoundException('Image not found');
    await unlinkAsync(`./uploads/${image.thumb}`);
    worker.images = worker.images.filter(
      (image: Image) => image.id !== imageId,
    );
    await this.workerRepository.save(worker);
    await this.imagesService.remove(imageId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
    };
  }
}
