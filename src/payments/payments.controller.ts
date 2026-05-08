import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create a payment intent' })
  @Post('intents')
  create(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.create(dto)
  }

  @ApiOperation({ summary: 'Get a payment intent' })
  @Get('intents/:id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id)
  }

  @ApiOperation({ summary: 'Cancel a payment intent' })
  @HttpCode(HttpStatus.OK)
  @Post('intents/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.paymentsService.cancel(id)
  }
}
