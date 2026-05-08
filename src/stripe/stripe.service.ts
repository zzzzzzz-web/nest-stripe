import { Inject, Injectable } from '@nestjs/common'
import Stripe from 'stripe'

@Injectable()
export class StripeService {
  constructor(@Inject('STRIPE_CLIENT') readonly client: Stripe) {}
}
