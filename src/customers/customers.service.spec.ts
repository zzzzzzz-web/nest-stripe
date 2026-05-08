import { Test } from '@nestjs/testing'
import { PrismaService } from '@/prisma/prisma.service'
import { StripeService } from '@/stripe/stripe.service'
import { CustomersService } from './customers.service'

const mockStripe = {
  client: {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      list: jest.fn(),
      del: jest.fn(),
    },
  },
}

const mockPrisma = {
  customer: {
    create: jest.fn(),
  },
}

describe('CustomersService', () => {
  let service: CustomersService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: StripeService, useValue: mockStripe },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get(CustomersService)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('creates customer in Stripe, saves to DB, returns Stripe customer', async () => {
      const stripeCustomer = {
        id: 'cus_123',
        email: 'test@example.com',
        name: 'Test',
      }
      mockStripe.client.customers.create.mockResolvedValue(stripeCustomer)

      const result = await service.create({
        email: 'test@example.com',
        name: 'Test',
      })

      expect(mockStripe.client.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test',
        phone: undefined,
      })
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: { stripeId: 'cus_123', email: 'test@example.com', name: 'Test' },
      })
      expect(result).toBe(stripeCustomer)
    })
  })

  describe('findOne', () => {
    it('retrieves customer from Stripe', async () => {
      const stripeCustomer = { id: 'cus_123' }
      mockStripe.client.customers.retrieve.mockResolvedValue(stripeCustomer)

      const result = await service.findOne('cus_123')

      expect(mockStripe.client.customers.retrieve).toHaveBeenCalledWith(
        'cus_123',
      )
      expect(result).toBe(stripeCustomer)
    })
  })

  describe('list', () => {
    it('lists customers with default limit of 10', async () => {
      mockStripe.client.customers.list.mockResolvedValue({ data: [] })

      await service.list()

      expect(mockStripe.client.customers.list).toHaveBeenCalledWith({
        limit: 10,
      })
    })

    it('lists customers with a custom limit', async () => {
      mockStripe.client.customers.list.mockResolvedValue({ data: [] })

      await service.list(25)

      expect(mockStripe.client.customers.list).toHaveBeenCalledWith({
        limit: 25,
      })
    })
  })

  describe('delete', () => {
    it('deletes customer from Stripe', async () => {
      mockStripe.client.customers.del.mockResolvedValue({ deleted: true })

      await service.delete('cus_123')

      expect(mockStripe.client.customers.del).toHaveBeenCalledWith('cus_123')
    })
  })
})
