import { Injectable } from '@nestjs/common'
import { StripeService } from '@/stripe/stripe.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly stripeService: StripeService) {}

  create(dto: CreateSubscriptionDto) {
    return this.stripeService.client.subscriptions.create({
      customer: dto.customerId,
      items: dto.items,
      default_payment_method: dto.defaultPaymentMethod,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })
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
