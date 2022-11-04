import { CaptchaService } from '../services/captcha.service';
import { EmailService } from '../services/email.service';

/**
 * Dependencies of the Lambda Function handler
 */
export interface LambdaFnDependencies {
  emailService: EmailService;

  captchaService?: CaptchaService;
}
