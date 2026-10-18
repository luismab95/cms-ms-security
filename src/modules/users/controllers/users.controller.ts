import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  JwtGuard,
  PaginationResponseI,
  PaginationResquestDto,
  ServiceResponseI,
} from 'cms-lib-resources';
import { UsersService } from '../services/users.service.js';
import {
  CreateUserDto,
  SessionUserI,
  UpdateUserDto,
  UserI,
} from '../dto/user.dto.js';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.usersService.create(createUserDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('session')
  @UsePipes(new ValidationPipe())
  async getSession(
    @Headers() headers: any,
  ): Promise<ServiceResponseI<SessionUserI>> {
    const token = headers['authorization'];
    return {
      message: await this.usersService.getSession(token),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseI<PaginationResponseI<UserI[]>>> {
    return {
      message: await this.usersService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceResponseI<UserI>> {
    return {
      message: await this.usersService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ServiceResponseI<Omit<UserI, 'password'>>> {
    return {
      message: await this.usersService.update(Number(id), updateUserDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ServiceResponseI<string>> {
    return {
      message: await this.usersService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
