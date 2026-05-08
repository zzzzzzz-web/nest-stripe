import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class SubscriptionItemDto {
  @ApiProperty({ example: 'price_abc123' })
  @IsString()
  price: string

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  quantity?: number
}

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'cus_abc123' })
  @IsString()
  customerId: string

  @ApiProperty({ type: [SubscriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionItemDto)
  items: SubscriptionItemDto[]

  @ApiPropertyOptional({ example: 'pm_abc123' })
  @IsString()
  @IsOptional()
  defaultPaymentMethod?: string
}
