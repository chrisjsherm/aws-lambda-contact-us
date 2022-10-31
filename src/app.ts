import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { headerContentText } from './constants/header-content-text.constant';
import { httpErrorInternalService } from './constants/http-error-internal-service.constant';
import { parseRequestBody } from './helpers/parse-request-body.helper';
import { validateEmailAddress } from './helpers/validate-email-address.helper';
import { ContactUsForm } from './models/contact-us-form.class';
import { EmailService } from './services/email.service';

// Dependency injection for the Lambda function
export const dependencies = {
  /**
   * Initialize dependencies to give us a hook for mocking in tests.
   *
   * @returns Dependencies object
   */
  init: async (): Promise<{
    emailService: EmailService;
  }> => {
    return Promise.resolve({
      emailService: new EmailService(),
    });
  },
};

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
  const emailAddress = process.env['ValidatedEmailAddress'];
  if (emailAddress === undefined) {
    const message = 'ValidatedEmailAddress parameter is not set.';
    console.error(message);
    return {
      ...httpErrorInternalService,
      body: message,
    };
  } else if (validateEmailAddress(emailAddress) === false) {
    const message =
      'ValidatedEmailAddress parameter is not a valid email address.';
    console.error(message);
    return {
      ...httpErrorInternalService,
      body: message,
    };
  }

  // Parse contact form
  let contactForm: ContactUsForm;
  try {
    contactForm = parseRequestBody(event.body);
  } catch (err: unknown) {
    console.error(`Error occurred: ${(err as { body: string }).body}`);
    return err as APIGatewayProxyResult;
  }

  try {
    if (process.env['EmailSubjectSuffix']) {
      contactForm.subject = `${contactForm.subject} ${process.env['EmailSubjectSuffix']}`;
    }

    const { emailService } = await dependencies.init();

    const messageId = await emailService.sendMessage(emailAddress, contactForm);

    const result = `Email sent with SES ID ${messageId}.`;
    console.info(result);
    return {
      statusCode: 201,
      headers: headerContentText,
      body: result,
    };
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return {
        ...httpErrorInternalService,
        body: err as string,
      };
    }

    console.error(`Error occurred: ${err.message}`);
    return {
      ...httpErrorInternalService,
      body: err.message,
    };
  }
};
