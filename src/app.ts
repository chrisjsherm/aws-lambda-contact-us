import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { parseRequestBody } from './helpers/parse-request-body.helper';
import { validateEmailAddress } from './helpers/validate-email-address.helper';
import { ContactUsForm } from './models/contact-us-form.class';
import { EmailService } from './services/email.service';

const headers = {
  'content-type': 'text/plain; charset=utf-8',
};
const baseErrorResponse = {
  statusCode: 500,
  headers,
};

export const dependencies = {
  /**
   * Initialize dependencies to give us a hook for mocking in tests
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
 * Lambda Function handler for "contact us" form
 *
 * @param event API Gateway/Lambda Function URL event
 * @returns Result of SES request
 */
export const handler = async function handleRequest(
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> {
  const emailAddress = process.env['ValidatedEmailAddress'];
  if (emailAddress === undefined) {
    const message = 'ValidatedEmailAddress parameter is not set.';
    console.error(message);
    return {
      ...baseErrorResponse,
      body: message,
    };
  } else if (validateEmailAddress(emailAddress) === false) {
    const message =
      'ValidatedEmailAddress parameter is not a valid email address.';
    console.error(message);
    return {
      ...baseErrorResponse,
      body: message,
    };
  }

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
      headers,
      body: result,
    };
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return {
        ...baseErrorResponse,
        body: err as string,
      };
    }

    console.error(`Error occurred: ${err.message}`);
    return {
      ...baseErrorResponse,
      body: err.message,
    };
  }
};
