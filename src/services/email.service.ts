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
      ReplyToAddresses: ['christopher@shermandigital.com'],
      Destination: {
        ToAddresses: ['chrisjsherm@gmail.com'],
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data:
              'This completes the test of the Lambda function for the ' +
              'contact form from Sherman Digital.\n' +
              'Thank you for your participation.',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'New message from Christopher | Sherman Digital',
        },
      },
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);

    const { MessageId } = await this.sesInstance.send(sendEmailCommand);
    return MessageId;
  }
}
