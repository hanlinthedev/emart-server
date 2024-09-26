import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import ms from 'ms';
import { UserService } from 'src/user/user.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({ email });
      const isMatched = await bcrypt.compare(password, user.password);
      if (!isMatched) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: User, res: Response) {
    const expire = new Date();
    expire.setMilliseconds(
      expire.getMilliseconds() +
        ms(this.configService.getOrThrow<string>('JWT_EXPIRE_IN')),
    );
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };
    const token = this.jwtService.sign(payload);
    res.cookie('Authentication', token, {
      secure: this.configService.get('NODE_ENV') === 'production' && true,
      httpOnly: true,
      expires: expire,
    });
    return payload;
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
