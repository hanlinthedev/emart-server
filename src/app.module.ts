import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { SseModule } from './sse/sse.module';
import { UserModule } from './user/user.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    // singleLine: true,
                  },
                },
            logLevel: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ProductModule,
    ReviewModule,
    CategoryModule,
    CartModule,
    PrismaModule,
    SseModule,
    CheckoutModule,
  ],
})
export class AppModule {}
