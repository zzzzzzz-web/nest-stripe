import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { StripeService } from './stripe.service'
import { WebhookController } from './webhook.controller'

@Global()
@Module({
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (config: ConfigService) =>
        new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY')),
      inject: [ConfigService],
    },
    StripeService,
  ],
  controllers: [WebhookController],
  exports: [StripeService],
})
export class StripeModule {}
