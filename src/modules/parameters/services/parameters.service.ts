import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  decryptedData,
  encryptedData,
  OK_200,
  getParameter,
  sendMail,
  EmailI,
} from 'cms-lib-resources';
import { Database } from 'cms-lib-database';
import {
  TestEmailDto,
  UpdateMultipleParameterDto,
  UpdateParameterDto,
} from '../dto/parameter.dto.js';
import { ParameterRepository } from '../repositories/parameter.repository.js';

@Injectable()
export class ParametersService {
  constructor(private readonly parameterRepository: ParameterRepository) {}

  async findAll() {
    const parameters = await this.parameterRepository.get();
    parameters.forEach((parameter) => {
      if (parameter.private && parameter.value !== '') {
        parameter.value = decryptedData(parameter.value);
      }
    });
    return parameters;
  }

  async findPublic() {
    const parameters = await this.parameterRepository.get();
    parameters.forEach((parameter) => {
      if (parameter.private && parameter.value !== '') {
        parameter.value = decryptedData(parameter.value);
      }
    });
    return parameters.filter((parameter) => !parameter.private);
  }

  async findOne(id: number) {
    const parameter = await this.parameterRepository.find('id', id);
    if (parameter === undefined) {
      throw new HttpException(
        'No se encontro datos de parámetro',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (parameter.private && parameter.value !== '') {
      parameter.value = decryptedData(parameter.value);
    }
    return parameter;
  }

  async update(id: number, updateParameterDto: UpdateParameterDto) {
    const parameter = await this.findOne(id);
    if (parameter.private) {
      updateParameterDto.value = encryptedData(updateParameterDto.value);
    }
    const dataSource = Database.getConnection();
    await dataSource.transaction(async (cnx) => {
      await this.parameterRepository.update(id, updateParameterDto, cnx);
    });
    return OK_200;
  }

  async updateMultiple(updateMultipleParameterDto: UpdateMultipleParameterDto) {
    const dataSource = Database.getConnection();
    await dataSource.transaction(async (cnx) => {
      for (let item of updateMultipleParameterDto.items) {
        const parameter = await this.parameterRepository.find(
          'code',
          item.code,
        );
        if (!parameter) {
          throw new HttpException(
            `No se encontro datos de parámetro: ${item.code}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (parameter.private && parameter.value !== '') {
          item.value = encryptedData(item.value);
        }
        await this.parameterRepository.update(parameter.id, item, cnx);
      }
    });
    return OK_200;
  }

  async testEmail(testEmailDto: TestEmailDto, token: string) {
    const parameters = await this.parameterRepository.get();
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
      templateName: 'test-email',
      subject: 'Prueba servicio de correo',
      to: testEmailDto.email,
      context: {
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
      },
    } as EmailI;
    await sendMail(emailData);
    return OK_200;
  }
}
