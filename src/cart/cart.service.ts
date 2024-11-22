import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCartDto: CreateCartDto, userId: string) {
    return this.prisma.cartItem.create({
      data: { ...createCartDto, userId },
    });
  }

  getCartCount(userId: string) {
    return this.prisma.cartItem.count({ where: { userId, checkedOut: false } });
  }

  findAll(id: string) {
    return this.prisma.cartItem.findMany({
      where: { userId: id, checkedOut: false },
      select: {
        id: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          },
        },
        quantity: true,
        subTotal: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  async removeItemFormCart(id: string) {
    try {
      await this.prisma.cartItem.delete({ where: { id } });
      return 'success';
    } catch (error) {
      return 'error';
    }
  }
}
