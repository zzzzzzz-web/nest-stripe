import { Injectable } from '@nestjs/common'
import { StripeService } from '@/stripe/stripe.service'
import { CreateCustomerDto } from './dto/create-customer.dto'

@Injectable()
export class CustomersService {
  constructor(private readonly stripeService: StripeService) {}

  create(dto: CreateCustomerDto) {
    return this.stripeService.client.customers.create({
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
    })
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
