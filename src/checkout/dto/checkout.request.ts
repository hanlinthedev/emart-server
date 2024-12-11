import { Type as TypeDecorator } from 'class-transformer';
import {
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
  paymentMethod: string;

  @ValidateNested({ each: true })
  @TypeDecorator(() => ProductItemDto)
  productList: ProductItemDto[];
}
