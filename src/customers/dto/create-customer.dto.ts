import { IsEmail, IsOptional, IsString } from 'class-validator'

export class CreateCustomerDto {
  @IsEmail()
  email: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  phone?: string
}
