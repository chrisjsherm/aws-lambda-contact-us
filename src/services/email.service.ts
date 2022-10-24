import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from '@aws-sdk/client-ses';

export class EmailService {
  private sesInstance: SESClient;

  constructor() {
    this.sesInstance = new SESClient({});
  }

  async sendMessage(
    validatedEmailAddress: string,
  ): Promise<string | undefined> {
    const emailParams: SendEmailCommandInput = {
      Source: validatedEmailAddress,
      ReplyToAddresses: [validatedEmailAddress],
      Destination: {
        ToAddresses: [validatedEmailAddress],
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: 'Testing contact-us Lambda function',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'New message from Christopher',
        },
      },
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);

    return new Promise(async (resolve, reject) => {
      try {
        const { MessageId } = await this.sesInstance.send(sendEmailCommand);
        resolve(MessageId);
      } catch (err) {
        reject(err);
      }
    });
  }
}
