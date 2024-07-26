import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository, RoleRepository],
})
export class UsersModule {}
