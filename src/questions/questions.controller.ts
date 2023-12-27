import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SerializedUser } from '../types/serialized-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: SerializedUser,
  ) {
    return this.questionsService.create(createQuestionDto, user);
  }

  @Get()
  findAll(@Query('page') page: number) {
    return this.questionsService.findAll(+page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(+id);
  }

  @Post(':id/answer')
  answer(@Param('id') id: string, @Body() createAnswerDto: CreateAnswerDto) {
    return this.questionsService.answer(+id, createAnswerDto);
  }

  @Post(':id/answer/update')
  updateAnswer(
    @Param('id') id: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ) {
    return this.questionsService.updateAnswer(+id, updateAnswerDto);
  }

  @Delete(':id/answer/remove')
  removeAnswer(@Param('id') id: string) {
    return this.questionsService.removeAnswer(+id);
  }
}
