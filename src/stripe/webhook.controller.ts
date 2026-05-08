import {
  BadRequestException,
  Controller,
  Headers,
  Logger,
  Post,
  Req,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import Stripe from 'stripe'
import { StripeService } from './stripe.service'

type RawRequest = Request & { rawBody?: Buffer }

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Post('stripe')
  async handle(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawRequest,
  ) {
    const secret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    )

    let event: Stripe.Event
    try {
      event = this.stripeService.client.webhooks.constructEvent(
        req.rawBody!,
        signature,
        secret,
      )
    } catch (err) {
      throw new BadRequestException(
        `Webhook verification failed: ${err.message}`,
      )
    }

    this.logger.log(`Received: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.onPaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        )
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.onSubscriptionEvent(
          event.data.object as Stripe.Subscription,
        )
        break
      default:
        this.logger.log(`Unhandled event: ${event.type}`)
    }

    return { received: true }
  }

  private async onPaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    this.logger.log(`PaymentIntent succeeded: ${paymentIntent.id}`)
  }

  private async onSubscriptionEvent(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription ${subscription.id}: ${subscription.status}`)
  }
}
