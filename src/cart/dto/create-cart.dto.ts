import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  @IsNumber()
  quantity;

  @IsNotEmpty()
  @IsString()
  productId;

  @IsNotEmpty()
  @IsNumber()
  subTotal;
}
