import { Module } from '@nestjs/common';
import { RolesController } from './controllers/roles.controller.js';
import { RoleRepository } from './repositories/role.repository.js';
import { RolesService } from './services/roles.service.js';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
})
export class RolesModule {}
