import { Module } from '@nestjs/common';
import { ParametersService } from './parameters.service';
import { ParametersController } from './parameters.controller';
import { ParameterRepository } from './repositories/parameter.repository';

@Module({
  controllers: [ParametersController],
  providers: [ParametersService, ParameterRepository],
})
export class ParametersModule {}
