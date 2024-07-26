import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TestEmailDto,
  UpdateMultipleParameterDto,
  UpdateParameterDto,
} from './dto/parameter.dto';
import { ParameterRepository } from './repositories/parameter.repository';
import { OK_200 } from 'src/shared/constants/message.constants';
import { decryptedData, encryptedData } from 'src/shared/helpers/bcrypt.helper';
import { EmailInterface, sendMail } from 'src/shared/helpers/email.helper';
import { getParameter } from 'src/shared/helpers/parameter.helper';

@Injectable()
export class ParametersService {
  constructor(private readonly parameterRepository: ParameterRepository) {}

  async findAll() {
    const parameters = await this.parameterRepository.get();
    parameters.forEach((parameter) => {
      if (parameter.private) {
        parameter.value = decryptedData(parameter.value);
      }
    });
    return parameters;
  }

  async findPublic() {
    const parameters = await this.parameterRepository.get();
    parameters.forEach((parameter) => {
      if (parameter.private) {
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

    if (parameter.private) {
      parameter.value = decryptedData(parameter.value);
    }

    return parameter;
  }

  async update(id: number, updateParameterDto: UpdateParameterDto) {
    const parameter = await this.findOne(id);
    if (parameter.private) {
      updateParameterDto.value = encryptedData(updateParameterDto.value);
    }
    await this.parameterRepository.update(id, updateParameterDto);
    return OK_200;
  }

  async updateMultiple(
    updateMultipleParameterDto: UpdateMultipleParameterDto,
  ) {
    for (let item of updateMultipleParameterDto.items) {
      const parameter = await this.parameterRepository.find('code', item.code);
      if (parameter.private) {
        item.value = encryptedData(item.value);
      }
      await this.parameterRepository.update(parameter.id, item);
    }

    return OK_200;
  }

  async testEmail(testEmailDto: TestEmailDto, token: string) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const URlStatics = await getParameter('APP_STATICS_URL');
    const logoMail = await getParameter('LOGO_MAIL');
    const emailData = {
      templateName: 'test-email',
      subject: 'Prueba servicio de correo',
      to: testEmailDto.email,
      context: {
        companyName: await getParameter('COMPANY_NAME'),
        mailFooter: await getParameter('COMPANY_MAIL'),
        imageHeader: `${URlStatics}/${logoMail}`,
        year: currentYear,
      },
    } as EmailInterface;
    await sendMail(emailData, token);
    return OK_200;
  }
}
