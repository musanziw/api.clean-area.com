import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSkillDto: CreateSkillDto): Promise<any> {
    const { name } = createSkillDto;
    const skill = await this.prisma.skill.findFirst({
      where: { name },
    });
    if (skill) throw new ConflictException('Skill already exists');
    await this.prisma.skill.create({
      data: createSkillDto,
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Skill added successfully',
    };
  }

  async findAll(offset: number, limit: number): Promise<any> {
    const skills = await this.prisma.skill.findMany({
      skip: offset,
      take: limit,
    });
    return {
      statusCode: HttpStatus.OK,
      skills,
    };
  }

  async findOne(id: number): Promise<any> {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    return {
      statusCode: HttpStatus.FOUND,
      skill,
    };
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Skill updated successfully',
    };
  }

  async remove(id: number): Promise<any> {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });
    if (!skill) throw new NotFoundException('Role not found');
    await this.prisma.skill.delete({
      where: { id },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Skill deleted successfully',
    };
  }
}
