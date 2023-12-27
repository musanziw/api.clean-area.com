import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async create(createImageDto: CreateImageDto) {
    const image = await this.imageRepository.save(createImageDto);
    if (!image) throw new BadRequestException('Error while uploading images');
    return {
      statusCode: HttpStatus.CREATED,
      data: image,
    };
  }

  async remove(id: number) {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    await this.imageRepository.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
    };
  }
}
