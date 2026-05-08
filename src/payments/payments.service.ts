import { Injectable } from '@nestjs/common'
import { StripeService } from '@/stripe/stripe.service'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'

@Injectable()
export class PaymentsService {
  constructor(private readonly stripeService: StripeService) {}

  create(dto: CreatePaymentIntentDto) {
    return this.stripeService.client.paymentIntents.create({
      amount: dto.amount,
      currency: dto.currency,
      customer: dto.customerId,
      description: dto.description,
      automatic_payment_methods: { enabled: true },
    })
  }

  findOne(id: string) {
    return this.stripeService.client.paymentIntents.retrieve(id)
  }

  cancel(id: string) {
    return this.stripeService.client.paymentIntents.cancel(id)
  }
}
