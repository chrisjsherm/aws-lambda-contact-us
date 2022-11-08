import { SESClient } from '@aws-sdk/client-ses';
import { SSMClient } from '@aws-sdk/client-ssm';
import { CaptchaService } from './captcha.service';
import { EmailService } from './email.service';
import { ParameterService } from './parameter.service';

/**
 * Enable shared dependencies.
 */
export class DependencyInjector {
  captchaService?: CaptchaService;
  emailService: EmailService;

  constructor() {
    this.emailService = new EmailService(new SESClient({}));

    if (process.env['CaptchaEnabled'] === 'true') {
      const captchaSecretKeyParameterPath =
        process.env['CaptchaSecretKeyParameterPath'];

      this.captchaService = new CaptchaService(
        new ParameterService(new SSMClient({})),
        captchaSecretKeyParameterPath ?? '',
      );
    }
  }
}
