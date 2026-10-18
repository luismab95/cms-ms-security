import { HttpException, HttpStatus } from '@nestjs/common';
import { Database, Parameter, EntityManager } from 'cms-lib-database';
import { errorQuery, ColumnsEnum, ParameterI } from 'cms-lib-resources';
import { UpdateParameterDto } from '../dto/parameter.dto.js';

export class ParameterRepository {
  async update(
    parameterId: number,
    parameter: UpdateParameterDto,
    dataSource: EntityManager,
  ): Promise<number> {
    try {
      const update = await dataSource
        .createQueryBuilder()
        .update(Parameter)
        .set(parameter)
        .where('id = :parameterId', { parameterId })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(field: string, value: any): Promise<ParameterI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'p.id as "id"',
        'p.code as code',
        'p.name as name',
        'p.description as description',
        'p.value as "value"',
        'p.private as "private"',
      ])
      .from(Parameter, 'p')
      .where(`p.${field} = :value`, { value });
    return query.getRawOne<ParameterI>();
  }

  async get(): Promise<ParameterI[]> {
    const dataSource = Database.getConnection();
    return await dataSource
      .createQueryBuilder()
      .select([
        'p.id as "id"',
        'p.code as code',
        'p.name as name',
        'p.description as description',
        'p.value as "value"',
        'p.private as "private"',
      ])
      .from(Parameter, 'p')
      .getRawMany<ParameterI>();
  }
}
