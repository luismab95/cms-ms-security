import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ScopeInterface } from 'lib-database/src/entities/security/permission.entity';
import { RoleI } from 'src/modules/roles/dto/role.dto';

export class CreateUserDto {
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  @IsNotEmpty({ message: 'Correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'Nombres debe ser texto' })
  @IsNotEmpty({ message: 'Nombres es requerido' })
  @MaxLength(100, {
    message: 'Nombres solo permite un máximo de 100 caracteres',
  })
  firstname: string;

  @IsString({ message: 'Apellidos debe ser texto' })
  @IsNotEmpty({ message: 'Apellidos es requerido' })
  @MaxLength(100, {
    message: 'Apellidos solo permite un máximo de 100 caracteres',
  })
  lastname: string;

  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Rol no válido' })
  @IsNotEmpty({ message: 'Rol es requerido' })
  @Min(1)
  roleId: number;

  @IsOptional()
  password: string;
}

export class UpdateUserDto {
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  @IsNotEmpty({ message: 'Correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'Nombres debe ser texto' })
  @IsOptional()
  @MaxLength(100, {
    message: 'Nombres solo permite un máximo de 100 caracteres',
  })
  firstname: string;

  @IsString({ message: 'Apellidos debe ser texto' })
  @IsOptional()
  @MaxLength(100, {
    message: 'Apellidos solo permite un máximo de 100 caracteres',
  })
  lastname: string;

  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Rol no válido' })
  @IsOptional()
  roleId: number;

  @IsBoolean({ message: 'Autenticación de dos factores no válido' })
  @IsOptional()
  twoFactorAuth: boolean;

  @IsBoolean({ message: 'Estado no válido' })
  @IsOptional()
  status: boolean;

  @IsBoolean({ message: 'Estado bloqueado no válido' })
  @IsOptional()
  bloqued: boolean;

  @IsString({ message: 'Contraseña debe ser texto' })
  @IsOptional()
  password: string;
}

export interface UserI {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  twoFactorAuth: boolean;
  roleId: number;
  status: boolean;
  bloqued: boolean;
  terms: boolean;
}

export interface SessionI {
  id: number;
  ipAddress: string;
  token: string;
  info: string;
  active: boolean;
  userId: number;
}

export interface PermissionI {
  id: number;
  scope: ScopeInterface[];
  description: string;
  status: boolean;
}

export interface MenuRolI {
  id: number;
  name: string;
  description: string;
  status: boolean;
  icon: string;
  path: string;
  actions: string[];
  order: number;
  moduleId: number;
  moduleName: string;
  moduleDescription: string;
  moduleStatus: boolean;
  moduleIcon: string;
}

export interface NavigationI {
  id: string;
  title: string;
  subtitle?: string;
  type: 'basic' | 'group';
  link?: string;
  icon: string;
  children?: NavigationI[];
  actions?: string[];
}

export interface SessionUserI {
  user: UserI;
  role: RoleI;
  permission: PermissionI;
  navigation: NavigationI[];
}
