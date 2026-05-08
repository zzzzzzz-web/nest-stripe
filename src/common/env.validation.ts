import { plainToInstance } from 'class-transformer'
import { IsInt, IsString, Min, validateSync } from 'class-validator'

class EnvironmentVariables {
  @IsInt()
  @Min(1)
  PORT: number

  @IsString()
  DATABASE_URL: string

  @IsString()
  STRIPE_SECRET_KEY: string

  @IsString()
  STRIPE_WEBHOOK_SECRET: string

  @IsString()
  JWT_SECRET: string
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validated)
  if (errors.length > 0) throw new Error(errors.toString())
  return validated
}
