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
import { ParametersService } from './parameters.service';
import {
  TestEmailDto,
  UpdateMultipleParameterDto,
  UpdateParameterDto,
} from './dto/parameter.dto';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import { ParameterI } from 'src/shared/interfaces/parameter.interface';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('parameters')
export class ParametersController {
  constructor(private readonly parametersService: ParametersService) {}

  @Get()
  @UseGuards(JwtGuard)
  async findAll(): Promise<ServiceResponseInterface<ParameterI[]>> {
    return {
      message: await this.parametersService.findAll(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('public')
  async findPublic(): Promise<ServiceResponseInterface<ParameterI[]>> {
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
  ): Promise<ServiceResponseInterface<string>> {
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
  ): Promise<ServiceResponseInterface<string>> {
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
  ): Promise<ServiceResponseInterface<ParameterI>> {
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
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.parametersService.update(
        Number(id),
        updateParameterDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }
}
