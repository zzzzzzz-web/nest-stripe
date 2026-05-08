import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '@/prisma/prisma.module'
import { StripeModule } from '@/stripe/stripe.module'
import { AuthModule } from '@/auth/auth.module'
import { CustomersModule } from '@/customers/customers.module'
import { PaymentsModule } from '@/payments/payments.module'
import { SubscriptionsModule } from '@/subscriptions/subscriptions.module'
import { JwtGuard } from '@/auth/jwt.guard'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StripeModule,
    AuthModule,
    CustomersModule,
    PaymentsModule,
    SubscriptionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
