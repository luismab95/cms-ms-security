import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { JwtGuard, ServiceResponseI } from 'cms-lib-resources';
import { RolesService } from '../services/roles.service.js';
import { RoleI } from '../dto/role.dto.js';

@Controller('roles')
@UseGuards(JwtGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(): Promise<ServiceResponseI<RoleI[]>> {
    return {
      message: await this.rolesService.findAll(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceResponseI<RoleI>> {
    return {
      message: await this.rolesService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
