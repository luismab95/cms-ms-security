import { Database } from 'lib-database/src/shared/config/database';
import {
  CreateUserDto,
  PermissionI,
  SessionI,
  UpdateUserDto,
  UserI,
} from '../dto/user.dto';
import {
  Permission,
  Session,
  User,
} from 'lib-database/src/entities/public-api';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ColumnsEnum } from 'src/shared/enums/columns.enum';
import { errorQuery, queryFilter } from 'src/shared/helpers/database.helper';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';

export class UserRepository {
  async create(user: CreateUserDto): Promise<UserI> {
    try {
      const dataSource = Database.getConnection();
      const userRepository = dataSource.getRepository(User);
      const newUser = userRepository.create(user as User);
      return await userRepository.save(newUser);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(userId: number, user: UpdateUserDto): Promise<number> {
    try {
      const dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(User)
        .set(user)
        .where('id = :userId', { userId })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(field: string, value: any): Promise<UserI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'u.id as "id"',
        'u.email as email',
        'u.firstname as firstname',
        'u.lastname as lastname',
        'u.password as password',
        'u.two_factor_auth as "twoFactorAuth"',
        'u.bloqued as "bloqued"',
        'u.status as status',
        'u.terms as "terms" ',
        'u.role_id as "roleId"',
      ])
      .from(User, 'u')
      .where(`u.${field} = :value`, { value });
    return query.getRawOne<UserI>();
  }

  async get(
    paginationRequest: PaginationResquestDto,
  ): Promise<PaginationResponseI<UserI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        'u.id as "id"',
        'u.email as email',
        'u.firstname as firstname',
        'u.lastname as lastname',
        'u.two_factor_auth as "twoFactorAuth"',
        'u.bloqued as "bloqued"',
        'u.status as status',
        'u.terms as "terms" ',
        'u.role_id as "roleId"',
      ])
      .from(User, 'u');

    query = queryFilter(
      query,
      'u',
      ['email', 'firstname', 'lastname'],
      paginationRequest.status,
      paginationRequest.search,
    );

    const total = await query.getCount();
    const records = await query
      .groupBy('u.id')
      .orderBy('u.firstname', 'ASC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<UserI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }

  async findSession(sessionId: number): Promise<SessionI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        's.id as "id"',
        's.ip_address as "ipAddress"',
        's.token as "token"',
        's.info as info',
        's.active as "active" ',
        's.user_id as "userId"',
      ])
      .from(Session, 's')
      .where(`s.id = :sessionId`, { sessionId })
      .andWhere('s.active = true');
    return query.getRawOne<SessionI>();
  }

  async findPermission(permissionId: number): Promise<PermissionI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'p.id as "id"',
        'p.scope as "scope"',
        'p.description as "description"',
        'p.status as status',
      ])
      .from(Permission, 'p')
      .where(`p.id = :permissionId`, { permissionId })
      .andWhere('p.status = true');
    return query.getRawOne<PermissionI>();
  }
}
