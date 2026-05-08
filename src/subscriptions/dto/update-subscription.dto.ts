import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateSubscriptionDto {
  @IsString()
  @IsOptional()
  defaultPaymentMethod?: string

  @IsBoolean()
  @IsOptional()
  cancelAtPeriodEnd?: boolean
}
