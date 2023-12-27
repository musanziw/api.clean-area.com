import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SerializedUser } from '../types/serialized-user';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { AnswersService } from '../answers/answers.service';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { paginate } from '../helpers/paginate';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    private readonly answerService: AnswersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: SerializedUser,
  ) {
    await this.questionsRepository.save({
      ...createQuestionDto,
      user: { id: user.id },
    });
    return {
      message: 'Question posted successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  async findAll(page: number) {
    const { offset, limit } = paginate(page, 12);
    const questions: Question[] = await this.dataSource
      .getRepository(Question)
      .createQueryBuilder('q')
      .select([
        'q.title',
        'q.description',
        'q.created_at',
        'q.updated_at',
        'u.name',
        'u.email',
      ])
      .leftJoin('q.user', 'u')
      .offset(offset)
      .limit(limit)
      .getMany();
    return {
      statusCode: HttpStatus.OK,
      data: questions,
    };
  }

  async findOne(id: number) {
    const question: Question = await this.dataSource
      .getRepository(Question)
      .createQueryBuilder('q')
      .where({ id })
      .select([
        'q.id',
        'q.title',
        'q.description',
        'q.created_at',
        'q.updated_at',
        'u.name',
        'u.email',
        'a.content',
      ])
      .leftJoin('q.user', 'u')
      .leftJoin('q.answers', 'a')
      .getOne();
    if (!question) throw new NotFoundException('Question not found');
    return {
      statusCode: HttpStatus.OK,
      data: question,
    };
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const question: Question | null = await this.questionsRepository.findOneBy({
      id,
    });
    if (!question) throw new NotFoundException('Question not found');
    await this.questionsRepository.update({ id }, updateQuestionDto);
    return {
      message: 'Question updated successfully',
      statusCode: HttpStatus.OK,
    };
  }

  async remove(id: number) {
    const question: Question | null = await this.questionsRepository.findOneBy({
      id,
    });
    if (!question) throw new NotFoundException('Question not found');
    await this.questionsRepository.remove(question);
    return {
      statusCode: HttpStatus.OK,
      message: 'Question deleted successfully',
    };
  }

  async answer(id: number, createAnswerDto: CreateAnswerDto) {
    const question: Question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['answers'],
    });
    if (!question) throw new NotFoundException('Question not found !');
    const { data: answer } = await this.answerService.create(createAnswerDto);
    question.answers.push(answer);
    await this.questionsRepository.save(question);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Answer submitted successfully',
    };
  }

  async updateAnswer(
    answer_id: number,
    updateAnswerDto: UpdateAnswerDto,
  ): Promise<any> {
    const { data: answer } = await this.answerService.findOne(answer_id);
    const updatedAnswer = Object.assign(answer, updateAnswerDto);
    await this.answerService.update(answer_id, updatedAnswer);
    return {
      statusCode: HttpStatus.OK,
      message: 'Answer updated successfully',
    };
  }

  async removeAnswer(answer_id: number) {
    const { statusCode, message } = await this.answerService.delete(answer_id);
    return {
      statusCode,
      message,
    };
  }
}
