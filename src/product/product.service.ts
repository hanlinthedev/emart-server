import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  getTotal() {
    return this.prisma.product.count();
  }

  getAllIds() {
    return this.prisma.product.findMany({
      select: {
        id: true,
      },
    });
  }

  findAll(page: number) {
    return this.prisma.product.findMany({
      skip: (page - 1) * 10,
      take: 10,
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        rating: true,
        views: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reviews: {
          select: {
            id: true,
            comment: true,
            rating: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
