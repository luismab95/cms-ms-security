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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  SessionUserI,
  UpdateUserDto,
  UserI,
} from './dto/user.dto';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createUserDto: CreateUserDto,
    @Headers() headers: any,
  ): Promise<ServiceResponseInterface<string>> {
    const token = headers['authorization'];
    return {
      message: await this.usersService.create(createUserDto, token),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('session')
  @UsePipes(new ValidationPipe())
  async getSession(
    @Headers() headers: any,
  ): Promise<ServiceResponseInterface<SessionUserI>> {
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
  ): Promise<ServiceResponseInterface<PaginationResponseI<UserI[]>>> {
    return {
      message: await this.usersService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<UserI>> {
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
  ): Promise<ServiceResponseInterface<UserI>> {
    return {
      message: await this.usersService.update(Number(id), updateUserDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.usersService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
