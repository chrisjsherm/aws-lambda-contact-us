import {
  APIGatewayEvent,
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventRequestContextWithAuthorizer,
} from 'aws-lambda';
import { Observable, of } from 'rxjs';
import { dependencies, handler } from './app';
import { IEmail } from './models/email.interface';
import { CaptchaService } from './services/captcha.service';
import { EmailService } from './services/email.service';

const originalInitFn = dependencies.init;

describe('Lambda handler', (): void => {
  const mockCaptchaService = {
    validateToken(_token: string, _ip: string): Observable<boolean> {
      return of(true);
    },
  } as CaptchaService;

  const mockEmailService = {
    async sendMessage(_email: IEmail): Promise<string | undefined> {
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
        captchaService: mockCaptchaService,
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
  });

  it('should call sendMessage successfully', async (): Promise<void> => {
    // Act
    const result = await handler({
      body: JSON.stringify({
        fromName: 'Dan',
        fromEmailAddress: 'danno@gmail.com',
        subject: 'Invocation',
        message: 'Hello, World',
        'cf-turnstile': 'red-fox',
      }),
      requestContext: {},
    } as APIGatewayEvent);

    expect(result.body).toBe('Email sent with reference number ae1234.');
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
        'cf-turnstile': 'red-fox',
      }),
      requestContext: {
        identity: {
          sourceIp: '192.1.1.1',
        },
      } as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
    } as APIGatewayEvent);

    expect(result.body).toBe('Email sent with reference number ae1234.');

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
        'cf-turnstile': 'red-fox',
      }),
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(400);
    expect(result.body).toBe(
      '{"errors":["Property \\"fromEmailAddress\\" must be a valid email address."]}',
    );
  });

  it('should handle a string error from email service > send message', async (): Promise<void> => {
    // Arrange
    mockEmailService.sendMessage = async (
      _email: IEmail,
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
        'cf-turnstile': 'red-fox',
      }),
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(500);
    expect(result.body).toBe('An unknown error occurred.');
  });

  it('should handle an Error from email service > send message', async (): Promise<void> => {
    // Arrange
    mockEmailService.sendMessage = async (
      _email: IEmail,
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
        'cf-turnstile': 'red-fox',
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
