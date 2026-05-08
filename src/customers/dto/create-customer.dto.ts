import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString } from 'class-validator'

export class CreateCustomerDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ example: '+15555555555' })
  @IsString()
  @IsOptional()
  phone?: string
}
