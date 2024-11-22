import { PaymentType } from '@prisma/client';
import { Type as TypeDecorator } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class ProductItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;
}
export class CheckoutRequestDto {
  @IsNotEmpty()
  @IsEnum(PaymentType, { message: 'Invalid payment method' })
  paymentMethod: PaymentType;

  @ValidateNested({ each: true })
  @TypeDecorator(() => ProductItemDto)
  productList: ProductItemDto[];
}
