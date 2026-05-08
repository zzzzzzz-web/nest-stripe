import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ example: 'pm_abc123' })
  @IsString()
  @IsOptional()
  defaultPaymentMethod?: string

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  cancelAtPeriodEnd?: boolean
}
