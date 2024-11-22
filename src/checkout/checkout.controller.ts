import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { CheckoutRequestDto } from './dto/checkout.request';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async checkout(@Body() body: CheckoutRequestDto, @CurrentUser() user: User) {
    return this.checkoutService.checkout(body, user.id);
  }

  @Post('session')
  @UseGuards(JwtAuthGuard)
  async stripeCheckout(
    @Body() body: CheckoutRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.checkoutService.stripeCheckout(body, user.id);
  }

  @Post('webhook')
  async stripeWebhook(@Body() event: any) {
    return this.checkoutService.stripeWebhook(event);
  }
}
