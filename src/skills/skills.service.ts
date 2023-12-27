import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from '../helpers/paginate';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<any> {
    const { name } = createSkillDto;
    const skill: Skill | null = await this.skillsRepository.findOneBy({ name });
    if (skill) throw new ConflictException('Skill already exists');
    await this.skillsRepository.save(createSkillDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Skill added successfully',
    };
  }

  async findAll(page: number): Promise<any> {
    const { offset, limit } = paginate(page, 12);
    const skills: Skill[] = await this.skillsRepository.find({
      skip: offset,
      take: limit,
    });
    return {
      statusCode: HttpStatus.OK,
      data: skills,
    };
  }

  async findOne(id: number): Promise<any> {
    const skill: Skill | null = await this.skillsRepository.findOneBy({ id });
    if (!skill) throw new NotFoundException('Skill not found');
    return {
      statusCode: HttpStatus.FOUND,
      data: skill,
    };
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    const skill: Skill | null = await this.skillsRepository.findOneBy({ id });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.skillsRepository.update(id, updateSkillDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Skill updated successfully',
    };
  }

  async remove(id: number): Promise<any> {
    const skill: Skill | null = await this.skillsRepository.findOneBy({ id });
    if (!skill) throw new NotFoundException('Role not found');
    await this.skillsRepository.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Skill deleted successfully',
    };
  }
}
