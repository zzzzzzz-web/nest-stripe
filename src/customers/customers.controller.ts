import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CustomersService } from './customers.service'
import { CreateCustomerDto } from './dto/create-customer.dto'

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiOperation({ summary: 'Create a customer' })
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto)
  }

  @ApiOperation({ summary: 'List customers' })
  @Get()
  list(@Query('limit') limit?: string) {
    return this.customersService.list(limit ? parseInt(limit, 10) : 10)
  }

  @ApiOperation({ summary: 'Get a customer' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id)
  }

  @ApiOperation({ summary: 'Delete a customer' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.customersService.delete(id)
  }
}
