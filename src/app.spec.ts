import {
  APIGatewayEvent,
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventRequestContextWithAuthorizer,
} from 'aws-lambda';
import { Observable, of } from 'rxjs';
import { handler } from './app';
import * as FormModule from './models/contact-us-form.class';
import { IEmail } from './models/email.interface';
import { ErrorArray } from './models/error-array.class';
import { CaptchaService } from './services/captcha.service';
import * as DependencyInjectorModule from './services/dependency-injector.service';
import { EmailService } from './services/email.service';

describe('Lambda handler', (): void => {
  let mockCaptchaService: CaptchaService;
  let mockEmailService: EmailService;

  beforeAll((): void => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  beforeEach((): void => {
    mockCaptchaService = {
      validateToken(_token: string, _ip: string): Observable<boolean> {
        return of(true);
      },
    } as CaptchaService;
    mockEmailService = {
      async sendMessage(_email: IEmail): Promise<string | undefined> {
        return Promise.resolve('ae1234');
      },
    } as EmailService;

    process.env['CaptchaEnabled'] = 'true';
    process.env['CaptchaFieldName'] = 'cfTurnstileResponse';
    process.env['CaptchaSecretKeyParameterPath'] = '/path/to/key';
    process.env['ValidatedEmailAddress'] = 'admin@example.com';

    jest
      .spyOn(DependencyInjectorModule, 'DependencyInjector')
      .mockImplementation(() => {
        return {
          captchaService: mockCaptchaService,
          emailService: mockEmailService,
        };
      });
    jest.spyOn(FormModule, 'ContactUsForm').mockImplementation(() => {
      return {
        captchaToken: undefined,
        fromEmailAddress: 'danno45@example.com',
        fromName: 'Dan',
        message: 'Hello world',
        subject: 'Greetings',
      } as unknown as FormModule.ContactUsForm;
    });
  });

  it('should return 500 when DependencyInjector throws', async (): Promise<void> => {
    // Arrange
    jest
      .spyOn(DependencyInjectorModule, 'DependencyInjector')
      .mockImplementation(() => {
        throw new Error('Bad permissions');
      });

    // Act
    const result = await handler({
      body: '',
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(500);
  });

  it('should return 400 when ContactUsForm throws an ErrorArray', async (): Promise<void> => {
    // Arrange
    jest.spyOn(FormModule, 'ContactUsForm').mockImplementation(() => {
      throw new ErrorArray(
        ['Property "fromName" cannot be empty'],
        'Form values are invalid',
      );
    });

    // Act
    const result = await handler({
      body: '',
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 when ContactUsForm throws an Error', async (): Promise<void> => {
    // Arrange
    jest.spyOn(FormModule, 'ContactUsForm').mockImplementation(() => {
      throw new Error('Form values are invalid');
    });

    // Act
    const result = await handler({
      body: '',
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 when ContactUsForm throws a string', async (): Promise<void> => {
    // Arrange
    jest.spyOn(FormModule, 'ContactUsForm').mockImplementation(() => {
      throw 'Form values are invalid';
    });

    // Act
    const result = await handler({
      body: '',
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(400);
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

  it('should return 401 validateToken returns false', async (): Promise<void> => {
    // Arrange
    mockCaptchaService.validateToken = (
      _token: string,
      _ip?: string,
    ): Observable<boolean> => {
      return of(false);
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
      requestContext: {},
    } as APIGatewayEvent);

    // Assert
    expect(result.statusCode).toBe(401);
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

    // Assert
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

  it('should handle a well-formed JSON object not wrapped in an APIGatewayEvent', async (): Promise<void> => {
    // Act
    const result = await handler({
      fromName: 'Dan',
      fromEmailAddress: 'danno@gmail.com',
      subject: 'Invocation',
      message: 'Hello, World',
      'cf-turnstile': 'red-fox',
    } as unknown as APIGatewayEvent);

    // Assert
    expect(result.body).toBe('Email sent with reference number ae1234.');
  });
});
