import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from '@aws-sdk/client-ses';
import { EmailAddress } from '../models/email-address.class';
import { IEmail } from '../models/email.interface';

/**
 * Send email messages.
 */
export class EmailService {
  constructor(private sesClient: SESClient) {}

  /**
   * Send an email
   *
   * @param email Email data
   * @returns ID of the created message
   */
  async sendMessage(email: IEmail): Promise<string | undefined> {
    const emailParams: SendEmailCommandInput = {
      Source: email.sourceEmailAddress.toString(),
      ReplyToAddresses: email.replyToEmailAddresses.map(
        (address: EmailAddress): string => address.toString(),
      ),
      Destination: {
        ToAddresses: email.toEmailAddresses.map(
          (address: EmailAddress): string => address.toString(),
        ),
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: email.message,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: email.subject,
        },
      },
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);

    const { MessageId } = await this.sesClient.send(sendEmailCommand);
    return MessageId;
  }
}
