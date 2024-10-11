import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import ms from 'ms';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

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
    const expire = this.setExpire();
    const payload = this.getPayload(user);
    const token = this.jwtService.sign(payload);
    this.setCookies(token, res, expire);
    return payload;
  }

  async signup(data: CreateUserDto, res: Response) {
    try {
      const user = await this.userService.create(data);
      const expire = this.setExpire();
      const payload = this.getPayload(user);
      const token = this.jwtService.sign(payload);
      this.setCookies(token, res, expire);
      return payload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private getPayload(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };
  }

  private setExpire() {
    const expire = new Date();
    expire.setMilliseconds(
      expire.getMilliseconds() +
        ms(this.configService.getOrThrow<string>('JWT_EXPIRE_IN')),
    );
    return expire;
  }

  private setCookies(token, res, expire) {
    res.cookie('Authentication', token, {
      secure: this.configService.get('NODE_ENV') === 'production' && true,
      httpOnly: true,
      expires: expire,
    });
  }
}
