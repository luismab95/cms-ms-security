import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { JwtGuard, ServiceResponseI, ParameterI } from 'cms-lib-resources';
import { ParametersService } from '../services/parameters.service.js';
import {
  TestEmailDto,
  UpdateMultipleParameterDto,
  UpdateParameterDto,
} from '../dto/parameter.dto.js';

@Controller('parameters')
export class ParametersController {
  constructor(private readonly parametersService: ParametersService) {}

  @Get()
  @UseGuards(JwtGuard)
  async findAll(): Promise<ServiceResponseI<ParameterI[]>> {
    return {
      message: await this.parametersService.findAll(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('public')
  async findPublic(): Promise<ServiceResponseI<ParameterI[]>> {
    return {
      message: await this.parametersService.findPublic(),
      statusCode: HttpStatus.OK,
    };
  }

  @Post('/multiple')
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe())
  async updateMultiple(
    @Body() updateMultipleParameterDto: UpdateMultipleParameterDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.parametersService.updateMultiple(
        updateMultipleParameterDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Post('test/email')
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe())
  async testEmail(
    @Body() testEmailDto: TestEmailDto,
    @Headers() headers: any,
  ): Promise<ServiceResponseI<string>> {
    const token = headers['authorization'];
    return {
      message: await this.parametersService.testEmail(testEmailDto, token),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseI<ParameterI>> {
    return {
      message: await this.parametersService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateParameterDto: UpdateParameterDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.parametersService.update(
        Number(id),
        updateParameterDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }
}
