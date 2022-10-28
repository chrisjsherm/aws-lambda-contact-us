import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from '@aws-sdk/client-ses';
import { ContactUsForm } from '../models/contact-us-form.class';

export class EmailService {
  private sesInstance: SESClient;

  constructor() {
    this.sesInstance = new SESClient({});
  }

  async sendMessage(
    sourceEmailAddress: string,
    contactForm: ContactUsForm,
  ): Promise<string | undefined> {
    const emailParams: SendEmailCommandInput = {
      Source: sourceEmailAddress,
      ReplyToAddresses: [contactForm.fromEmailAddress],
      Destination: {
        ToAddresses: [sourceEmailAddress],
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: contactForm.message,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: contactForm.subject,
        },
      },
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);

    const { MessageId } = await this.sesInstance.send(sendEmailCommand);
    return MessageId;
  }
}
