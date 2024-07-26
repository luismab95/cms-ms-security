import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ParametersModule } from './modules/parameters/parameters.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [UsersModule, ParametersModule, RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
