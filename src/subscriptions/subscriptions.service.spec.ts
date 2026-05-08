import { Test } from '@nestjs/testing'
import { PrismaService } from '@/prisma/prisma.service'
import { StripeService } from '@/stripe/stripe.service'
import { SubscriptionsService } from './subscriptions.service'

const mockStripe = {
  client: {
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
  },
}

const mockPrisma = {
  customer: { findUnique: jest.fn() },
  subscription: { create: jest.fn() },
}

const stripeSubscription = {
  id: 'sub_123',
  status: 'active',
  cancel_at_period_end: false,
  items: {
    data: [
      {
        price: { id: 'price_123' },
        current_period_start: 1700000000,
        current_period_end: 1702592000,
      },
    ],
  },
}

describe('SubscriptionsService', () => {
  let service: SubscriptionsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: StripeService, useValue: mockStripe },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get(SubscriptionsService)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('creates subscription and saves to DB when customer exists', async () => {
      mockStripe.client.subscriptions.create.mockResolvedValue(stripeSubscription)
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 'db_cus_123' })

      const result = await service.create({ customerId: 'cus_123', items: [{ price: 'price_123' }] })

      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          stripeId: 'sub_123',
          customerId: 'db_cus_123',
          status: 'active',
          priceId: 'price_123',
          cancelAtPeriodEnd: false,
        }),
      })
      expect(result).toBe(stripeSubscription)
    })

    it('skips DB write when customer not found locally', async () => {
      mockStripe.client.subscriptions.create.mockResolvedValue(stripeSubscription)
      mockPrisma.customer.findUnique.mockResolvedValue(null)

      await service.create({ customerId: 'cus_unknown', items: [{ price: 'price_123' }] })

      expect(mockPrisma.subscription.create).not.toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('retrieves subscription from Stripe', async () => {
      mockStripe.client.subscriptions.retrieve.mockResolvedValue(stripeSubscription)

      const result = await service.findOne('sub_123')

      expect(mockStripe.client.subscriptions.retrieve).toHaveBeenCalledWith('sub_123')
      expect(result).toBe(stripeSubscription)
    })
  })

  describe('list', () => {
    it('lists all subscriptions without filter', async () => {
      mockStripe.client.subscriptions.list.mockResolvedValue({ data: [] })

      await service.list()

      expect(mockStripe.client.subscriptions.list).toHaveBeenCalledWith(undefined)
    })

    it('lists subscriptions filtered by customerId', async () => {
      mockStripe.client.subscriptions.list.mockResolvedValue({ data: [] })

      await service.list('cus_123')

      expect(mockStripe.client.subscriptions.list).toHaveBeenCalledWith({ customer: 'cus_123' })
    })
  })

  describe('update', () => {
    it('updates subscription in Stripe', async () => {
      mockStripe.client.subscriptions.update.mockResolvedValue(stripeSubscription)

      await service.update('sub_123', { cancelAtPeriodEnd: true })

      expect(mockStripe.client.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        default_payment_method: undefined,
        cancel_at_period_end: true,
      })
    })
  })

  describe('cancel', () => {
    it('cancels subscription in Stripe', async () => {
      mockStripe.client.subscriptions.cancel.mockResolvedValue({ ...stripeSubscription, status: 'canceled' })

      await service.cancel('sub_123')

      expect(mockStripe.client.subscriptions.cancel).toHaveBeenCalledWith('sub_123')
    })
  })
})
