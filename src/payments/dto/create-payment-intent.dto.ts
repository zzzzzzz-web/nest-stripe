import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class CreatePaymentIntentDto {
  @IsInt()
  @Min(1)
  amount: number

  @IsString()
  currency: string

  @IsString()
  @IsOptional()
  customerId?: string

  @IsString()
  @IsOptional()
  description?: string
}
