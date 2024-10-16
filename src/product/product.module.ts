import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [UserModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
