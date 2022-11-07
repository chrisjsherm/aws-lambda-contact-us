import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { EmailAddress } from '../models/email-address.class';
import { EmailService } from './email.service';

describe('Email service', (): void => {
  const sesMock = mockClient(SESClient);
  let service: EmailService;

  beforeEach((): void => {
    sesMock.reset();
    service = new EmailService(sesMock as unknown as SESClient);
  });

  it('should create', (): void => {
    // Assert
    expect(service).toBeDefined();
  });

  it('should send the message to the email client', async (): Promise<void> => {
    // Arrange
    sesMock.on(SendEmailCommand).resolves({
      MessageId: '123',
    });

    // Act
    const result = await service.sendMessage({
      replyToEmailAddresses: [new EmailAddress('danno@gmail.com')],
      subject: 'Hello, World',
      message: 'Good morning',
      sourceEmailAddress: new EmailAddress('contactus@example.com'),
      toEmailAddresses: [new EmailAddress('contactus@example.com')],
    });

    // Assert
    expect(result).toEqual('123');
    expect(sesMock).toHaveReceivedCommandTimes(SendEmailCommand, 1);
  });

  it('should handle an error sending the message to the email client', async (): Promise<void> => {
    // Arrange
    sesMock.on(SendEmailCommand).rejects({
      Type: 'MessageRejected',
    });

    // Assert
    expect(
      async () =>
        await service.sendMessage({
          replyToEmailAddresses: [new EmailAddress('danno@gmail.com')],
          subject: 'Hello, World',
          message: 'Good morning',
          sourceEmailAddress: new EmailAddress('contactus@example.com'),
          toEmailAddresses: [new EmailAddress('contactus@example.com')],
        }),
    ).rejects.toThrow();
    expect(sesMock).toHaveReceivedCommandTimes(SendEmailCommand, 1);
  });
});
