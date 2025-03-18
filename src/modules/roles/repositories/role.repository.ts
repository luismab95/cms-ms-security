import { Database } from 'lib-database/src/shared/config/database';
import { RoleI } from '../dto/role.dto';
import {
  Menu,
  MenuRole,
  Module,
  Role,
} from 'lib-database/src/entities/public-api';
import { MenuRolI } from 'src/modules/users/dto/user.dto';

export class RoleRepository {
  async find(field: string, value: any): Promise<RoleI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'r.id as "id"',
        'r.name as name',
        'r.description as description',
        'r.status as "status"',
        'r.permission_id as "permissionId"',
      ])
      .from(Role, 'r')
      .where(`r.${field} = :value`, { value });
    return query.getRawOne<RoleI>();
  }

  async get(): Promise<RoleI[]> {
    const dataSource = Database.getConnection();
    return await dataSource
      .createQueryBuilder()
      .select([
        'r.id as "id"',
        'r.name as name',
        'r.description as description',
        'r.status as "status"',
        'r.permission_id as "permissionId"',
      ])
      .from(Role, 'r')
      .where('r.status = true')
      .getRawMany<RoleI>();
  }

  async findMenusRole(roleId: number): Promise<MenuRolI[]> {
    const dataSource = Database.getConnection();
    return await dataSource
      .createQueryBuilder()
      .select([
        'm.id as "id"',
        'm.name as name',
        'm.description as description',
        'm.status as "status"',
        'm.icon as "icon"',
        'm.path as "path"',
        'm.actions as "actions"',
        'm.module_id as "moduleId"',
        'mo.name as "moduleName"',
        'mo.description as "moduleDescription"',
        'mo.status as "moduleStatus"',
        'mo.icon as "moduleIcon"',
        'mr.order as "order"',
      ])
      .from(MenuRole, 'mr')
      .innerJoin(Menu, 'm', 'm.id = mr.menu_id and m.status = true')
      .innerJoin(Module, 'mo', 'mo.id = m.module_id and mo.status = true')
      .where('mr.role_id = :roleId', { roleId })
      .andWhere('mr.status = true')
      .orderBy('mr.order', 'ASC')
      .getRawMany<MenuRolI>();
  }
}
