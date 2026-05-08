import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class SubscriptionItemDto {
  @IsString()
  price: string

  @IsOptional()
  quantity?: number
}

export class CreateSubscriptionDto {
  @IsString()
  customerId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionItemDto)
  items: SubscriptionItemDto[]

  @IsString()
  @IsOptional()
  defaultPaymentMethod?: string
}
