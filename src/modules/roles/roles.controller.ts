import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import { RoleI } from './dto/role.dto';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('roles')
@UseGuards(JwtGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(): Promise<ServiceResponseInterface<RoleI[]>> {
    return {
      message: await this.rolesService.findAll(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<RoleI>> {
    return {
      message: await this.rolesService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
