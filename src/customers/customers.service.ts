import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { StripeService } from '@/stripe/stripe.service'
import { CreateCustomerDto } from './dto/create-customer.dto'

@Injectable()
export class CustomersService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateCustomerDto) {
    const stripeCustomer = await this.stripeService.client.customers.create({
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
    })

    await this.prisma.customer.create({
      data: {
        stripeId: stripeCustomer.id,
        email: stripeCustomer.email!,
        name: stripeCustomer.name,
      },
    })

    return stripeCustomer
  }

  findOne(id: string) {
    return this.stripeService.client.customers.retrieve(id)
  }

  list(limit = 10) {
    return this.stripeService.client.customers.list({ limit })
  }

  delete(id: string) {
    return this.stripeService.client.customers.del(id)
  }
}
