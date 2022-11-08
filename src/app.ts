import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lastValueFrom, take } from 'rxjs';
import { validateStringProperty } from './helpers/validate-string-property.helper';
import { ContactUsForm } from './models/contact-us-form.class';
import { EmailAddress } from './models/email-address.class';
import { ErrorArray } from './models/error-array.class';
import { DependencyInjector } from './services/dependency-injector.service';

/**
 * Lambda Function handler for "contact us" form.
 *
 * @param event API Gateway/Lambda Function URL event
 * @returns Result of SES request
 */
export const handler = async function handleRequest(
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> {
  // Validate email address we're sending to
  const validatedEmailEnvironmentVariableName = 'ValidatedEmailAddress';
  const validationErrors = validateStringProperty(
    validatedEmailEnvironmentVariableName,
    process.env[validatedEmailEnvironmentVariableName] ?? '',
    320,
    false,
    true,
  );
  if (validationErrors.length > 0) {
    console.error(
      'Environment variable "ValidatedEmailAddress" is not a valid email address.',
    );

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        errors: validationErrors,
      }),
    };
  }
  const sourceEmailAddress = new EmailAddress(
    process.env[validatedEmailEnvironmentVariableName] as string,
  );

  // Parse contact form
  let contactForm: ContactUsForm;
  let captchaFieldName;
  if (process.env['CaptchaEnabled'] === 'true') {
    captchaFieldName = process.env['CaptchaFieldName'] as string;
  }
  try {
    contactForm = new ContactUsForm(event.body, captchaFieldName);
  } catch (err: unknown) {
    const defaultMessage = 'Contact form is invalid (unknown problem parsing).';
    const badRequest = {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        errors: [defaultMessage],
      }),
    };

    if (err instanceof ErrorArray) {
      console.error(err);
      return {
        ...badRequest,
        body: JSON.stringify({ errors: err.value }),
      };
    }

    if (!(err instanceof Error)) {
      console.error(defaultMessage);
      return badRequest;
    }

    console.error(err.message);
    return {
      ...badRequest,
      body: JSON.stringify({
        errors: [err.message],
      }),
    };
  }

  let captchaService, emailService;
  try {
    const injectedDependencies = new DependencyInjector();
    captchaService = injectedDependencies.captchaService;
    emailService = injectedDependencies.emailService;
  } catch (err: unknown) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        errors: ['An error occurred initializing dependencies.'],
      }),
    };
  }

  if (captchaService) {
    const validateToken$ = captchaService
      .validateToken(
        contactForm.captchaToken as string,
        event.requestContext?.identity?.sourceIp,
      )
      .pipe(take(1));

    const isValid = await lastValueFrom(validateToken$);
    if (isValid === false) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: ['Captcha validation did not succeed.'],
        }),
      };
    }
  }

  // Compose email subject
  const subjectArr = [
    `Message from ${contactForm.fromName}:`,
    contactForm.subject,
  ];
  if (process.env['EmailSubjectSuffix']) {
    subjectArr.push(process.env['EmailSubjectSuffix']);
  }

  try {
    const messageId = await emailService.sendMessage({
      sourceEmailAddress,
      replyToEmailAddresses: [contactForm.fromEmailAddress],
      toEmailAddresses: [sourceEmailAddress],
      subject: subjectArr.join(' '),
      message: contactForm.message,
    });

    const result = `Email sent with reference number ${messageId}.`;
    console.info(result);
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'text/plain; charset: UTF-8',
      },
      body: result,
    };
  } catch (err: unknown) {
    const defaultMessage = 'An unknown error occurred.';
    const internalServerError = {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain; charset: UTF-8' },
      body: defaultMessage,
    };

    if (!(err instanceof Error)) {
      console.error(defaultMessage);
      return internalServerError;
    }

    console.error(`Error occurred: ${err.message}`);
    return {
      ...internalServerError,
      body: err.message,
    };
  }
};
