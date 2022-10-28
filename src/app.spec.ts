import { APIGatewayEvent } from 'aws-lambda';
import { dependencies, handler } from './app';
import { ContactUsForm } from './models/contact-us-form.class';
import { EmailService } from './services/email.service';

const originalInitFn = dependencies.init;

describe('Lambda handler', (): void => {
  const mockEmailService = {
    async sendMessage(
      _sourceEmailAddress: string,
      _contactForm: ContactUsForm,
    ): Promise<string | undefined> {
      return Promise.resolve('ae1234');
    },
  } as EmailService;

  beforeAll((): void => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  beforeEach((): void => {
    dependencies.init = () =>
      Promise.resolve({
        emailService: mockEmailService,
      });

    process.env['ValidatedEmailAddress'] = 'admin@example.com';
  });

  it('should return 500 when validated email environment var is not set', async (): Promise<void> => {
    // Arrange
    delete process.env['ValidatedEmailAddress'];

    // Act
    const result = await handler({
      body: {},
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(500);
    expect(result.body).toEqual('ValidatedEmailAddress parameter is not set.');
  });

  it('should return 500 when validated email environment var is not an email', async (): Promise<void> => {
    // Arrange
    process.env['ValidatedEmailAddress'] = 'example.com';

    // Act
    const result = await handler({
      body: {},
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(500);
    expect(result.body).toEqual(
      'ValidatedEmailAddress parameter is not a valid email address.',
    );
  });

  it('should call sendMessage successfully', async (): Promise<void> => {
    // Act
    const result = await handler({
      body: JSON.stringify({
        fromName: 'Dan',
        fromEmailAddress: 'danno@gmail.com',
        subject: 'Invocation',
        message: 'Hello, World',
      }),
    } as APIGatewayEvent);

    expect(result.body).toBe('Email sent with SES ID ae1234.');
  });

  it('should call sendMessage with a subject suffix', async (): Promise<void> => {
    // Arrange
    process.env['EmailSubjectSuffix'] = '| Sherman Digital';

    // Act
    const result = await handler({
      body: JSON.stringify({
        fromName: 'Dan',
        fromEmailAddress: 'danno@gmail.com',
        subject: 'Invocation',
        message: 'Hello, World',
      }),
    } as APIGatewayEvent);

    expect(result.body).toBe('Email sent with SES ID ae1234.');

    // Clean up
    delete process.env['EmailSubjectSuffix'];
  });

  it('should call sendMessage with invalid data', async (): Promise<void> => {
    // Act
    const result = await handler({
      body: JSON.stringify({
        fromName: 'Dan',
        fromEmailAddress: 'danno@@gmail.com', // Invalid email address
        subject: 'Invocation',
        message: 'Hello, World',
      }),
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(400);
    expect(result.body).toBe(
      'Property "fromEmailAddress" must be a valid email address.',
    );
  });

  it('should handle a string error from email service > send message', async (): Promise<void> => {
    // Arrange
    mockEmailService.sendMessage = async (
      _sourceEmailAddress: string,
      _contactForm: ContactUsForm,
    ): Promise<string | undefined> => {
      return Promise.reject('An unknown error occurred.');
    };

    // Act
    const result = await handler({
      body: JSON.stringify({
        fromName: 'Dan',
        fromEmailAddress: 'danno@gmail.com',
        subject: 'Invocation',
        message: 'Hello, World',
      }),
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(500);
    expect(result.body).toBe('An unknown error occurred.');
  });

  it('should handle an Error from email service > send message', async (): Promise<void> => {
    // Arrange
    mockEmailService.sendMessage = async (
      _sourceEmailAddress: string,
      _contactForm: ContactUsForm,
    ): Promise<string | undefined> => {
      return Promise.reject(new Error('You do not have permission.'));
    };

    // Act
    const result = await handler({
      body: JSON.stringify({
        fromName: 'Dan',
        fromEmailAddress: 'danno@gmail.com',
        subject: 'Invocation',
        message: 'Hello, World',
      }),
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(500);
    expect(result.body).toBe('You do not have permission.');
  });
});

describe('init dependencies', (): void => {
  it('should return an instance of EmailService', async (): Promise<void> => {
    // Assert
    dependencies.init = originalInitFn;

    // Act
    const result = await dependencies.init();

    // Assert
    expect(result.emailService.constructor.name).toBe(EmailService.name);
  });
});
