import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    try {
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: await bcrypt.hash(createUserDto.password, 10),
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new UnprocessableEntityException('email already exists');
      }
    }
  }

  getUser(filter: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUniqueOrThrow({
      where: filter,
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
