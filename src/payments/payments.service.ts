import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { StripeService } from '@/stripe/stripe.service'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'

@Injectable()
export class PaymentsService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreatePaymentIntentDto) {
    const paymentIntent = await this.stripeService.client.paymentIntents.create(
      {
        amount: dto.amount,
        currency: dto.currency,
        customer: dto.customerId,
        description: dto.description,
        automatic_payment_methods: { enabled: true },
      },
    )

    const customer = dto.customerId
      ? await this.prisma.customer.findUnique({
          where: { stripeId: dto.customerId },
        })
      : null

    await this.prisma.payment.create({
      data: {
        stripeId: paymentIntent.id,
        customerId: customer?.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        description: paymentIntent.description,
      },
    })

    return paymentIntent
  }

  findOne(id: string) {
    return this.stripeService.client.paymentIntents.retrieve(id)
  }

  cancel(id: string) {
    return this.stripeService.client.paymentIntents.cancel(id)
  }
}
