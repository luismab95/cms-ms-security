import { Module } from '@nestjs/common';
import { Shutdown, MS_NAME } from 'cms-lib-database';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { ParametersModule } from './modules/parameters/parameters.module.js';

@Module({
  imports: [UsersModule, RolesModule, ParametersModule],
  controllers: [AppController],
  providers: [AppService, Shutdown,
      {
        provide: MS_NAME,
        useValue: 'MS-AUTH',
      },],
})
export class AppModule {}
