import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { SocketGateway } from 'src/global/socket.gateway';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly socket: SocketGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.cartService.create(createCartDto, user.id);
    this.socket.emitToClient('CartUpdated', user.id);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.cartService.findAll(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cartCount')
  getTotalCartCount(@CurrentUser() user: User) {
    return this.cartService.getCartCount(user.id);
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
    this.socket.emitToClient('CartUpdated', user.id);

    return data;
  }
}
