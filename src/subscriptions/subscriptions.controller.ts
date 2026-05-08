import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SubscriptionsService } from './subscriptions.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Create a subscription' })
  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto)
  }

  @ApiOperation({ summary: 'List subscriptions' })
  @Get()
  list(@Query('customerId') customerId?: string) {
    return this.subscriptionsService.list(customerId)
  }

  @ApiOperation({ summary: 'Get a subscription' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id)
  }

  @ApiOperation({ summary: 'Update a subscription' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, dto)
  }

  @ApiOperation({ summary: 'Cancel a subscription' })
  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id)
  }
}
