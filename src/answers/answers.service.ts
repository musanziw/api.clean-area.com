import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entities/answer.entity';
import { Repository } from 'typeorm';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async create(createAnswerDto: CreateAnswerDto): Promise<any> {
    const answer = await this.answerRepository.save(createAnswerDto);
    if (!answer) throw new BadRequestException('Error while answering');
    return {
      statusCode: HttpStatus.CREATED,
      data: answer,
    };
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto): Promise<any> {
    const answer = await this.answerRepository.findOneBy({ id });
    if (!answer) throw new NotFoundException('Answer not found');
    const newAnswer = Object.assign(answer, updateAnswerDto);
    await this.answerRepository.save(newAnswer);
  }

  async findOne(id: number): Promise<any> {
    const answer = await this.answerRepository.findOneBy({ id });
    if (!answer) throw new NotFoundException('Answer not found');
    return {
      statusCode: HttpStatus.FOUND,
      data: answer,
    };
  }

  async delete(id: number): Promise<any> {
    const answer: Answer | null = await this.answerRepository.findOneBy({ id });
    if (!answer) throw new NotFoundException('User not found');
    await this.answerRepository.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Answer deleted successfully',
    };
  }
}
