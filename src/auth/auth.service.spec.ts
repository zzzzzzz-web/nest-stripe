import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/prisma/prisma.service'
import { AuthService } from './auth.service'

jest.mock('bcrypt')

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}

const mockJwt = {
  sign: jest.fn().mockReturnValue('token'),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile()

    service = module.get(AuthService)
    jest.clearAllMocks()
    mockJwt.sign.mockReturnValue('token')
  })

  describe('register', () => {
    it('creates a user and returns a token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@example.com' })

      const result = await service.register({ email: 'test@example.com', password: 'password123' })

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', password: 'hashed' },
      })
      expect(result).toEqual({ access_token: 'token' })
    })

    it('throws ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1' })

      await expect(
        service.register({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException)

      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('returns a token on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'hashed' })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.login({ email: 'test@example.com', password: 'password123' })

      expect(result).toEqual({ access_token: 'token' })
    })

    it('throws UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException if password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'hashed' })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })
})
