import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { SseService } from 'src/sse/sse.service';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly sse: SseService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Sse('sse')
  push(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    return this.sse.addClient(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser() user: User,
  ) {
    console.log(createCartDto);
    const data = await this.cartService.create(createCartDto, user.id);
    const cartCount = await this.cartService.getCartCount(user.id);
    this.sse.emitToClient(user.id, {
      data: { cartCount },
      event: 'cartCount',
    });
    return data;
  }

  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
