import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { SocketGateway } from 'src/global/socket.gateway';
import { CheckoutService } from './checkout.service';
import { CheckoutRequestDto } from './dto/checkout.request';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly socket: SocketGateway,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async checkout(@Body() body: CheckoutRequestDto, @CurrentUser() user: User) {
    const data = await this.checkoutService.checkout(body, user.id);
    this.socket.emitToClient('CartUpdated', user.id);

    return data;
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
