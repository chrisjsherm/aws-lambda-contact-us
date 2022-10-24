import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { EmailService } from './email.service';

describe('Email service', (): void => {
  let sesMock = mockClient(SESClient);
  let service: EmailService;

  beforeEach((): void => {
    sesMock.reset();
    service = new EmailService();
  });

  it('should create', (): void => {
    // Assert
    expect(service).toBeDefined();
  });

  it('should send the message to SES', async (): Promise<void> => {
    // Arrange
    sesMock.on(SendEmailCommand).resolves({
      MessageId: '123',
    });

    // Act
    const result = await service.sendMessage('email@example.com');

    // Assert
    expect(result).toEqual('123');
    expect(sesMock).toHaveReceivedCommandTimes(SendEmailCommand, 1);
  });

  it('should handle an error sending the message to SES', async (): Promise<void> => {
    // Arrange
    sesMock.on(SendEmailCommand).rejects({
      Type: 'MessageRejected',
    });

    // Assert
    expect(() => service.sendMessage('email@example.com')).rejects.toThrow();
    expect(sesMock).toHaveReceivedCommandTimes(SendEmailCommand, 1);
  });
});
