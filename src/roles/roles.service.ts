import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name } = createRoleDto;
    const role = await this.prisma.role.findFirst({
      where: { name },
    });
    if (role) throw new ConflictException('Role already exists');
    await this.prisma.role.create({
      data: {
        name,
      },
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Role added successfully',
    };
  }

  async findAll(offset: number, limit: number): Promise<any> {
    const roles = await this.prisma.role.findMany({
      skip: offset,
      take: limit,
    });
    return {
      statusCode: HttpStatus.OK,
      roles,
    };
  }

  async findOne(id: number): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) throw new NotFoundException('Role not found');
    return {
      statusCode: HttpStatus.OK,
      role,
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) throw new NotFoundException('Role not found');
    await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Role updated successfully',
    };
  }

  async remove(id: number): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) throw new NotFoundException('Role not found');
    await this.prisma.role.delete({
      where: { id },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Role deleted successfully',
    };
  }
}
