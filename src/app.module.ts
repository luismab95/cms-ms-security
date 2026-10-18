import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { ParametersModule } from './modules/parameters/parameters.module.js';

@Module({
  imports: [UsersModule, RolesModule, ParametersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
