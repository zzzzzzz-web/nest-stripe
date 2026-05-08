import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'
import Stripe from 'stripe'

const stripeStatusMap: Record<string, number> = {
  StripeCardError: HttpStatus.PAYMENT_REQUIRED,
  StripeInvalidRequestError: HttpStatus.BAD_REQUEST,
  StripeAuthenticationError: HttpStatus.UNAUTHORIZED,
  StripePermissionError: HttpStatus.FORBIDDEN,
  StripeRateLimitError: HttpStatus.TOO_MANY_REQUESTS,
  StripeConnectionError: HttpStatus.BAD_GATEWAY,
  StripeAPIError: HttpStatus.BAD_GATEWAY,
}

@Catch(Stripe.errors.StripeError)
export class StripeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(StripeExceptionFilter.name)

  catch(err: Stripe.errors.StripeError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>()
    const status = stripeStatusMap[err.type] ?? HttpStatus.INTERNAL_SERVER_ERROR

    this.logger.error(`${err.type}: ${err.message}`)

    res.status(status).json({
      statusCode: status,
      error: err.type,
      message: err.message,
    })
  }
}
