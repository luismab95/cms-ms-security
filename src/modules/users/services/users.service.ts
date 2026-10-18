import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getParameter,
  hashPassword,
  sendMail,
  OK_200,
  PaginationResquestDto,
  verifyToken,
  TokenInterface,
  config,
  EmailI,
  generateRandomPassword,
} from 'cms-lib-resources';
import _ from 'lodash';
import {
  CreateUserDto,
  NavigationI,
  UpdateUserDto,
  UserI,
} from '../dto/user.dto.js';
import { RoleRepository } from '../../roles/repositories/role.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ParameterRepository } from '../../parameters/repositories/parameter.repository.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly _parameterRepository: ParameterRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const parameters = await this._parameterRepository.get();
    const length = await getParameter(
      parameters.find((p) => p.code === 'APP_PWD_LONG'),
      'APP_PWD_LONG',
    );
    const useMayus = await getParameter(
      parameters.find((p) => p.code === 'APP_PWD_LONG'),
      'APP_PWD_LONG',
    );
    const useNumber = await getParameter(
      parameters.find((p) => p.code === 'APP_PWD_LONG'),
      'APP_PWD_LONG',
    );
    const useSpecial = await getParameter(
      parameters.find((p) => p.code === 'APP_PWD_LONG'),
      'APP_PWD_LONG',
    );
    const randomPassword = generateRandomPassword(
      Number(length),
      useMayus === 'true',
      useNumber === 'true',
      useSpecial === 'true',
    );
    createUserDto.password = await hashPassword(randomPassword);
    await this.userRepository.create(createUserDto);

    const findRole = await this.roleRepository.find('id', createUserDto.roleId);
    if (findRole === undefined) {
      throw new HttpException(
        'No se encontro datos de rol',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { frontendUrl } = config.server;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const URlStatics = await getParameter(
      parameters.find((p) => p.code === 'APP_STATICS_URL'),
      'APP_STATICS_URL',
    );
    const logoMail = await getParameter(
      parameters.find((p) => p.code === 'LOGO_MAIL'),
      'LOGO_MAIL',
    );
    const emailData = {
      templateName: 'sign-up',
      subject: 'Invitación de Usuario',
      to: createUserDto.email,
      context: {
        fullName: `${createUserDto.firstname} ${createUserDto.lastname}`,
        companyName: await getParameter(
          parameters.find((p) => p.code === 'COMPANY_NAME'),
          'COMPANY_NAME',
        ),
        mailFooter: await getParameter(
          parameters.find((p) => p.code === 'COMPANY_MAIL'),
          'COMPANY_MAIL',
        ),
        imageHeader: `${URlStatics}/${logoMail}`,
        year: currentYear,
        pwd: randomPassword,
        link: `${frontendUrl}/auth/sign-in`,
        role: findRole.name,
      },
    } as EmailI;
    sendMail(emailData);
    return OK_200;
  }

  async findAll(paginationResquestDto: PaginationResquestDto) {
    return await this.userRepository.get(paginationResquestDto);
  }

  async findOne(id: number) {
    const user = await this.userRepository.find('id', id);
    if (user === undefined) {
      throw new HttpException(
        'No se encontro datos de usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    if (updateUserDto.password !== undefined) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }
    await this.userRepository.update(id, updateUserDto);
    const user = await this.findOne(id);
    const { password, ...userResponse } = user;
    return userResponse;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    user.status = !user.status;
    await this.userRepository.update(id, user);
    return OK_200;
  }

  async getSession(token: string) {
    const tokenPayload = verifyToken(token) as TokenInterface;
    const session = await this.userRepository.findSession(
      tokenPayload.sessionId!,
    );
    if (!session) {
      throw new HttpException(
        'No se encontro datos de la sesión',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepository.find('id', session.userId);
    if (user === undefined) {
      throw new HttpException(
        'No se encontro datos del usuario',
        HttpStatus.BAD_REQUEST,
      );
    }

    const {
      password,
      bloqued,
      status: userStatus,
      terms,
      roleId,
      ...userResponse
    } = user;

    const role = await this.roleRepository.find('id', roleId);
    if (role === undefined) {
      throw new HttpException(
        'No se encontro datos del rol',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { status: roleStatus, permissionId, ...roleResponse } = role;
    const permission = await this.userRepository.findPermission(permissionId);
    if (permission === undefined) {
      throw new HttpException(
        'No se encontro datos de los permisos',
        HttpStatus.BAD_REQUEST,
      );
    }

    const {
      id: permissionIdResponse,
      status: permissionStatus,
      ...permissionResponse
    } = permission;

    const navigation: NavigationI[] = [];
    const menusRole = await this.roleRepository.findMenusRole(roleId);
    const groupedByModule = _.groupBy(
      menusRole,
      (menu) =>
        `${menu.moduleId}_:_${menu.moduleName}_:_${menu.moduleDescription}_:_${menu.moduleIcon}`,
    );

    Object.keys(groupedByModule).forEach((module) => {
      const moduleParts = module.split('_:_');
      const navigationItem = {
        id: moduleParts[0],
        title: moduleParts[1],
        subtitle: moduleParts[2],
        type: 'group',
        icon: moduleParts[3],
        children: [],
      } as NavigationI;
      groupedByModule[module] = _.sortBy(groupedByModule[module], 'order');
      groupedByModule[module].forEach((menu) => {
        navigationItem.children!.push({
          id: menu.id.toString(),
          title: menu.name,
          subtitle: menu.description,
          type: 'basic',
          icon: menu.icon,
          link: menu.path,
          actions: menu.actions,
        });

        navigationItem.children = _.sortBy(navigationItem.children, 'order');
      });
      navigation.push({ ...navigationItem });
    });

    return {
      user: userResponse,
      role: roleResponse,
      permission: permissionResponse,
      navigation,
    };
  }
}
