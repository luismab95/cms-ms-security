import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateParameterDto {
  @IsNotEmpty({ message: 'Valor es requerido' })
  value: any;
}

export class UpdateMultipleParameterDto {
  @IsArray({ message: 'Parámetros son requeridos' })
  @ArrayMinSize(1, { message: 'Parámetros debe tener al menos 1 elemento' })
  @ArrayMaxSize(100, {
    message: 'Solo se permiten un máximo de 100 parámetros  ',
  })
  @ValidateNested({ each: true })
  @Type(() => ItemUpdateMultipleParameterDto)
  items: ItemUpdateMultipleParameterDto[];
}

export class ItemUpdateMultipleParameterDto {
  @IsNotEmpty({ message: 'Valor es requerido' })
  value: any;

  @IsString({ message: 'Código debe ser texto' })
  @IsNotEmpty({ message: 'Código es requerido' })
  code: string;
}

export class TestEmailDto {
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  @IsNotEmpty({ message: 'Correo electrónico es requerido' })
  email: string;
}
