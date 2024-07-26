import { Module, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleRepository } from './repositories/role.repository';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
})
export class RolesModule {}
