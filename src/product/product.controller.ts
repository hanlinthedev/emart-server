import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { CurrentUser } from 'src/Decorators/current-user.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    console.log(user);
    return this.productService.create(createProductDto);
  }

  @Get('total')
  async getTotal(@Query('q') q: string, @Query('category') category: string) {
    return this.productService.getTotal({ q, category });
  }
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('q') q: string,
    @Query('category') category: string,
  ) {
    return this.productService.findAll({ page, q, category });
  }

  @Get('ids')
  getAllIds() {
    return this.productService.getAllIds();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
