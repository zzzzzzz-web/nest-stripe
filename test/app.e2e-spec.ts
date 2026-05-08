import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import request from 'supertest'
import { type App } from 'supertest/types'
import { AppModule } from '@/app.module'
import { StripeExceptionFilter } from '@/common/filters/stripe-exception.filter'
import { PrismaService } from '@/prisma/prisma.service'

process.env.PORT = '3001'
process.env.DATABASE_URL = 'postgresql://test'
process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fake'
process.env.JWT_SECRET = 'test-jwt-secret-32-chars-minimum!!'

const mockPrisma = {
  user: { findUnique: jest.fn(), create: jest.fn() },
  customer: { create: jest.fn(), findUnique: jest.fn() },
  payment: { create: jest.fn() },
  subscription: { create: jest.fn() },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}

describe('App (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    app.useGlobalFilters(new StripeExceptionFilter())
    app.setGlobalPrefix('api')
    await app.init()
  })

  afterAll(() => app.close())
  beforeEach(() => jest.clearAllMocks())

  describe('POST /api/auth/register', () => {
    it('returns a token on success', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: 'new@example.com',
      })

      const res = await request(app.getHttpServer() as App)
        .post('/api/auth/register')
        .send({ email: 'new@example.com', password: 'password123' })
        .expect(201)

      expect(res.body).toHaveProperty('access_token')
    })

    it('returns 409 when email is taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1' })

      await request(app.getHttpServer() as App)
        .post('/api/auth/register')
        .send({ email: 'taken@example.com', password: 'password123' })
        .expect(409)
    })

    it('returns 400 on validation failure', async () => {
      await request(app.getHttpServer() as App)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'short' })
        .expect(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('returns a token on valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'user@example.com',
        password: hash,
      })

      const res = await request(app.getHttpServer() as App)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201)

      expect(res.body).toHaveProperty('access_token')
    })

    it('returns 401 on wrong password', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'user@example.com',
        password: hash,
      })

      await request(app.getHttpServer() as App)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpassword' })
        .expect(401)
    })

    it('returns 401 when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer() as App)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(401)
    })
  })

  describe('Protected routes', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as App)
        .get('/api/customers')
        .expect(401)
    })

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer() as App)
        .get('/api/customers')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401)
    })
  })
})
