import { CaptchaService } from './captcha.service';
import { DependencyInjector } from './dependency-injector.service';

jest.mock('@aws-sdk/client-ses', () => {
  return {
    SESClient: jest.fn(),
  };
});
jest.mock('@aws-sdk/client-ssm', () => {
  return {
    SSMClient: jest.fn(),
  };
});
jest.mock('./parameter.service', () => {
  return {
    ParameterService: jest.fn(),
  };
});
jest.mock('./captcha.service', () => {
  return {
    CaptchaService: jest.fn(),
  };
});

describe('Dependency injector', (): void => {
  it('should create', (): void => {
    // Assert
    expect(new DependencyInjector()).toBeDefined();
  });

  it('should throw when captcha is enabled but the path to the secret is not set', (): void => {
    // Arrange
    process.env['CaptchaEnabled'] = 'true';

    // Assert
    expect(() => new DependencyInjector()).toThrow();

    // Clean up
    delete process.env['CaptchaEnabled'];
  });

  it('should initialize the captcha service with the configured path', (): void => {
    // Arrange
    process.env['CaptchaEnabled'] = 'true';
    process.env['CaptchaSecretKeyParameterPath'] = '/path/to/key';

    // Act
    const service = new DependencyInjector();

    // Assert
    expect(service.captchaService).toBeDefined();
    expect(CaptchaService).toHaveBeenLastCalledWith({}, '/path/to/key');

    // Clean up
    delete process.env['CaptchaEnabled'];
    delete process.env['CaptchaSecretKeyParameterPath'];
  });
});
