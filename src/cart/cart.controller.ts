import {
  Body,
  Controller,
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
    console.log('sse', user);
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
    const data = await this.cartService.create(createCartDto, user.id);
    const cartCount = await this.cartService.getCartCount(user.id);
    this.sse.emitToClient(user.id, {
      data: { cartCount },
      event: 'cartCount',
    });
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.cartService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.cartService.removeItemFormCart(id);
    const cartCount = await this.cartService.getCartCount(user.id);
    if (data === 'success') {
      this.sse.emitToClient(user.id, {
        data: { cartCount },
        event: 'cartCount',
      });
      return data;
    }
    return data;
  }
}
