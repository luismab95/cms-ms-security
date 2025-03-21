import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, NavigationI, UpdateUserDto } from './dto/user.dto';
import { OK_200 } from 'src/shared/constants/message.constants';
import { UserRepository } from './repositories/user.repository';
import { PaginationResquestDto } from 'src/shared/interfaces/pagination.interface';
import { hashPassword } from 'src/shared/helpers/bcrypt.helper';
import { getParameter } from 'src/shared/helpers/parameter.helper';
import { generateRandomPassword } from 'src/shared/helpers/random.helper';
import { EmailInterface, sendMail } from 'src/shared/helpers/email.helper';
import { config } from 'src/shared/environments/load-env';
import { RoleRepository } from '../roles/repositories/role.repository';
import * as _ from 'lodash';
import { TokenInterface, verifyToken } from 'src/shared/helpers/jwt.helper';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(createUserDto: CreateUserDto, token: string) {
    const length = await getParameter('APP_PWD_LONG');
    const useMayus = await getParameter('APP_PWD_MAYUS');
    const useNumber = await getParameter('APP_PWD_NUMBER');
    const useSpecial = await getParameter('APP_PWD_SPECIAL');
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
    const URlStatics = await getParameter('APP_STATICS_URL');
    const logoMail = await getParameter('LOGO_MAIL');
    const emailData = {
      templateName: 'sign-up',
      subject: 'Invitación de Usuario',
      to: createUserDto.email,
      context: {
        fullName: `${createUserDto.firstname} ${createUserDto.lastname}`,
        companyName: await getParameter('COMPANY_NAME'),
        mailFooter: await getParameter('COMPANY_MAIL'),
        imageHeader: `${URlStatics}/${logoMail}`,
        year: currentYear,
        pwd: randomPassword,
        link: `${frontendUrl}/auth/sign-in`,
        role: findRole.name,
      },
    } as EmailInterface;
    sendMail(emailData, token);
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
    delete user.password;
    return user;
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
      tokenPayload.sessionId,
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
    delete user.password;
    delete user.bloqued;
    delete user.status;
    delete user.terms;

    const role = await this.roleRepository.find('id', user.roleId);
    if (role === undefined) {
      throw new HttpException(
        'No se encontro datos del rol',
        HttpStatus.BAD_REQUEST,
      );
    }
    delete role.status;

    const permission = await this.userRepository.findPermission(
      role.permissionId,
    );
    if (permission === undefined) {
      throw new HttpException(
        'No se encontro datos de los permisos',
        HttpStatus.BAD_REQUEST,
      );
    }
    delete role.permissionId;
    delete permission.id;
    delete permission.status;

    const navigation: NavigationI[] = [];
    const menusRole = await this.roleRepository.findMenusRole(user.roleId);
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
        navigationItem.children.push({
          id: menu.id.toString(),
          title: menu.name,
          type: 'basic',
          icon: menu.icon,
          link: menu.path,
          actions: menu.actions,
        });
        navigationItem.children = _.sortBy(navigationItem.children, 'order');
      });
      navigation.push({ ...navigationItem });
    });
    delete user.roleId;

    return { user, role, permission, navigation };
  }
}
