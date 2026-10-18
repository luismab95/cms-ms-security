import { Module } from '@nestjs/common';
import { RoleRepository } from '../roles/repositories/role.repository.js';
import { UsersController } from './controllers/users.controller.js';
import { UserRepository } from './repositories/user.repository.js';
import { UsersService } from './services/users.service.js';
import { ParameterRepository } from '../parameters/repositories/parameter.repository.js';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    RoleRepository,
    ParameterRepository,
  ],
})
export class UsersModule {}
