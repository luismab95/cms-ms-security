import { Module } from '@nestjs/common';
import { ParametersController } from './controllers/parameters.controller.js';
import { ParameterRepository } from './repositories/parameter.repository.js';
import { ParametersService } from './services/parameters.service.js';

@Module({
  controllers: [ParametersController],
  providers: [ParametersService, ParameterRepository],
})
export class ParametersModule {}
