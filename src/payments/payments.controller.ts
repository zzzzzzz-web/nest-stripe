import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intents')
  create(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.create(dto)
  }

  @Get('intents/:id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id)
  }

  @Post('intents/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.paymentsService.cancel(id)
  }
}
