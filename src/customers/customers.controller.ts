import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { CustomersService } from './customers.service'
import { CreateCustomerDto } from './dto/create-customer.dto'

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto)
  }

  @Get()
  list(@Query('limit') limit?: string) {
    return this.customersService.list(limit ? parseInt(limit, 10) : 10)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.customersService.delete(id)
  }
}
