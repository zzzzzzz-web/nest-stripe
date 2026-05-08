import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { StripeService } from '@/stripe/stripe.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const subscription = await this.stripeService.client.subscriptions.create({
      customer: dto.customerId,
      items: dto.items,
      default_payment_method: dto.defaultPaymentMethod,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })

    const customer = await this.prisma.customer.findUnique({
      where: { stripeId: dto.customerId },
    })

    if (customer) {
      await this.prisma.subscription.create({
        data: {
          stripeId: subscription.id,
          customerId: customer.id,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id ?? '',
          currentPeriodStart: new Date((subscription.items.data[0]?.current_period_start ?? 0) * 1000),
          currentPeriodEnd: new Date((subscription.items.data[0]?.current_period_end ?? 0) * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })
    }

    return subscription
  }

  findOne(id: string) {
    return this.stripeService.client.subscriptions.retrieve(id)
  }

  list(customerId?: string) {
    return this.stripeService.client.subscriptions.list(
      customerId ? { customer: customerId } : undefined,
    )
  }

  update(id: string, dto: UpdateSubscriptionDto) {
    return this.stripeService.client.subscriptions.update(id, {
      default_payment_method: dto.defaultPaymentMethod,
      cancel_at_period_end: dto.cancelAtPeriodEnd,
    })
  }

  cancel(id: string) {
    return this.stripeService.client.subscriptions.cancel(id)
  }
}
