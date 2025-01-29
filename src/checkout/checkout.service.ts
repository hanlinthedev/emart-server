import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { CheckoutRequestDto } from './dto/checkout.request';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: Stripe,
    private readonly configService: ConfigService,
  ) {}

  async stripeCheckout(body: CheckoutRequestDto, userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
        id: {
          in: body.productList.map((item) => item.id),
        },
      },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        quantity: true,
      },
    });
    const total = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      metadata: {
        dataToUpdate: JSON.stringify({ userId, body, cartItems, total }),
      },
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
          },
          unit_amount: item.product.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: this.configService.getOrThrow('STRIPE_SUCCESS_URL'),
      cancel_url: this.configService.getOrThrow('STRIPE_CANCEL_URL'),
    });
  }

  async stripeWebhook(event: any) {
    if (event.type !== 'checkout.session.completed') {
      return;
    }
    const data = event.data.object;
    const dataToUpdate = JSON.parse(data.metadata.dataToUpdate);
    const { userId, body, cartItems, total } = dataToUpdate;
    return this.createOrderUpdateCartReduceStock(
      userId,
      body,
      total,
      cartItems,
    );
  }

  async checkout(body: CheckoutRequestDto, userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
        id: {
          in: body.productList.map((item) => item.id),
        },
      },
      select: {
        product: {
          select: {
            id: true,
            price: true,
          },
        },
        quantity: true,
      },
    });

    const total = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );

    return this.createOrderUpdateCartReduceStock(
      userId,
      body,
      total,
      cartItems,
    );
  }

  private async createOrderUpdateCartReduceStock(
    userId: string,
    body: CheckoutRequestDto,
    total: number,
    cartItems: any,
  ) {
    try {
      await this.prisma.$transaction(async () => {
        const createOrder = await this.prisma.order.create({
          data: {
            userId,
            paymentType: body.paymentMethod,
            cartItem: {
              connect: body.productList.map((item) => ({ id: item.id })),
            },
            total: total,
          },
        });

        await this.prisma.cartItem.updateMany({
          where: {
            id: {
              in: body.productList.map((item) => item.id),
            },
          },
          data: {
            checkedOut: true,
            orderId: createOrder.id,
          },
        });

        const reduceProductsInstock = cartItems.map((item) => {
          return this.prisma.product.update({
            where: {
              id: item.product.id,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        });
        await Promise.all(reduceProductsInstock);
      });
      return { message: 'Checkout successful' };
    } catch (error) {
      console.log(error);
      return { message: 'Checkout failed', error };
    }
  }
}
