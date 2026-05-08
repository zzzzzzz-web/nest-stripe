import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 2000, description: 'Amount in smallest currency unit (cents)' })
  @IsInt()
  @Min(1)
  amount: number

  @ApiProperty({ example: 'usd' })
  @IsString()
  currency: string

  @ApiPropertyOptional({ example: 'cus_abc123' })
  @IsString()
  @IsOptional()
  customerId?: string

  @ApiPropertyOptional({ example: 'Order #1234' })
  @IsString()
  @IsOptional()
  description?: string
}
