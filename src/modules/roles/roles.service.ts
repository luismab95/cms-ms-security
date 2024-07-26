import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findAll() {
    return await this.roleRepository.get();
  }

  async findOne(id: number) {
    const role = await this.roleRepository.find('id', id);
    if (role === undefined) {
      throw new HttpException(
        'No se encontro datos de rol',
        HttpStatus.BAD_REQUEST,
      );
    }
    return role;
  }
}
