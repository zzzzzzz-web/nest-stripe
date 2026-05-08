import { Test } from '@nestjs/testing'
import { PrismaService } from '@/prisma/prisma.service'
import { StripeService } from '@/stripe/stripe.service'
import { PaymentsService } from './payments.service'

const mockStripe = {
  client: {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      cancel: jest.fn(),
    },
  },
}

const mockPrisma = {
  customer: { findUnique: jest.fn() },
  payment: { create: jest.fn() },
}

const paymentIntent = {
  id: 'pi_123',
  amount: 2000,
  currency: 'usd',
  status: 'requires_payment_method',
  description: 'Test payment',
}

describe('PaymentsService', () => {
  let service: PaymentsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: StripeService, useValue: mockStripe },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get(PaymentsService)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('creates payment intent, resolves customer, saves to DB', async () => {
      mockStripe.client.paymentIntents.create.mockResolvedValue(paymentIntent)
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 'db_cus_123' })

      const result = await service.create({
        amount: 2000,
        currency: 'usd',
        customerId: 'cus_123',
        description: 'Test payment',
      })

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: {
          stripeId: 'pi_123',
          customerId: 'db_cus_123',
          amount: 2000,
          currency: 'usd',
          status: 'requires_payment_method',
          description: 'Test payment',
        },
      })
      expect(result).toBe(paymentIntent)
    })

    it('saves payment with null customerId when none provided', async () => {
      mockStripe.client.paymentIntents.create.mockResolvedValue(paymentIntent)

      await service.create({ amount: 2000, currency: 'usd' })

      expect(mockPrisma.customer.findUnique).not.toHaveBeenCalled()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const call = mockPrisma.payment.create.mock.calls[0][0] as {
        data: { customerId: unknown }
      }
      expect(call.data.customerId).toBeUndefined()
    })
  })

  describe('findOne', () => {
    it('retrieves payment intent from Stripe', async () => {
      mockStripe.client.paymentIntents.retrieve.mockResolvedValue(paymentIntent)

      const result = await service.findOne('pi_123')

      expect(mockStripe.client.paymentIntents.retrieve).toHaveBeenCalledWith(
        'pi_123',
      )
      expect(result).toBe(paymentIntent)
    })
  })

  describe('cancel', () => {
    it('cancels payment intent in Stripe', async () => {
      mockStripe.client.paymentIntents.cancel.mockResolvedValue({
        ...paymentIntent,
        status: 'canceled',
      })

      await service.cancel('pi_123')

      expect(mockStripe.client.paymentIntents.cancel).toHaveBeenCalledWith(
        'pi_123',
      )
    })
  })
})
