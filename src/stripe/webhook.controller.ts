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
import { PrismaService } from '@/prisma/prisma.service'
import { Public } from '@/auth/public.decorator'
import { StripeService } from './stripe.service'

type RawRequest = Request & { rawBody?: Buffer }

@Public()
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('stripe')
  async handle(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawRequest,
  ) {
    const secret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')

    let event: Stripe.Event
    try {
      event = this.stripeService.client.webhooks.constructEvent(
        req.rawBody!,
        signature,
        secret,
      )
    } catch (err) {
      throw new BadRequestException(`Webhook verification failed: ${err.message}`)
    }

    this.logger.log(`Received: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
        await this.onPaymentIntentUpdated(event.data.object as Stripe.PaymentIntent)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.onSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      default:
        this.logger.log(`Unhandled event: ${event.type}`)
    }

    return { received: true }
  }

  private async onPaymentIntentUpdated(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.updateMany({
      where: { stripeId: paymentIntent.id },
      data: { status: paymentIntent.status },
    })
    this.logger.log(`Payment ${paymentIntent.id} → ${paymentIntent.status}`)
  }

  private async onSubscriptionUpdated(subscription: Stripe.Subscription) {
    await this.prisma.subscription.updateMany({
      where: { stripeId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date((subscription.items.data[0]?.current_period_start ?? 0) * 1000),
        currentPeriodEnd: new Date((subscription.items.data[0]?.current_period_end ?? 0) * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })
    this.logger.log(`Subscription ${subscription.id} → ${subscription.status}`)
  }
}
