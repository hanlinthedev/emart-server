import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilter } from './entities/productFilter.entity';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  getTotal(query: ProductFilter) {
    const { q, page, category } = query;
    return this.prisma.product.count({
      where:
        category !== 'undefined'
          ? {
              categoryId: category,
            }
          : q !== 'undefined'
            ? {
                name: {
                  contains: q,
                },
              }
            : {},
    });
  }

  getAllIds() {
    return this.prisma.product.findMany({
      select: {
        id: true,
      },
    });
  }

  findAll(query: ProductFilter) {
    const { q, page, category } = query;
    console.log(query);
    return this.prisma.product.findMany({
      where:
        category !== 'undefined'
          ? {
              categoryId: category,
            }
          : q !== 'undefined'
            ? {
                name: {
                  contains: q,
                },
              }
            : {},
      skip: (Number(page) - 1) * 20 || 0,
      take: 20,
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        rating: true,
        reviews: {
          select: {
            rating: true,
          },
        },
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
          orderBy: {
            createdAt: 'desc',
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
