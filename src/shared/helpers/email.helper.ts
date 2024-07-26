import { config } from '../environments/load-env';
import { sendRequestPost } from './axios.helper';

export interface EmailInterface {
  to: string;
  from: string;
  subject: string;
  templateName: string;
  context: any;
}

export const sendMail = async (
  email: EmailInterface,
  authorization: string,
) => {
  const { msEmail } = config.server;
  sendRequestPost(`${msEmail}/email`, email, {
    headers: {
      Authorization: authorization,
    },
  });
};
