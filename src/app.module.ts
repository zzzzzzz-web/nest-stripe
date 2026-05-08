import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '@/prisma/prisma.module'
import { StripeModule } from '@/stripe/stripe.module'
import { CustomersModule } from '@/customers/customers.module'
import { PaymentsModule } from '@/payments/payments.module'
import { SubscriptionsModule } from '@/subscriptions/subscriptions.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StripeModule,
    CustomersModule,
    PaymentsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
