import { APIGatewayEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { validateEmailAddress } from './helpers/validate-email-address.helper';
import { ContactUsForm } from './models/contact-form-us.interface';
import { EmailService } from './services/email.service';

const emailService = new EmailService();
const headers = {
  'content-type': 'text/plain; charset=utf-8',
};
const baseErrorResponse = {
  statusCode: 500,
  headers,
};

/**
 * Parse request body, ensuring it is well-formed
 *
 * @param body Request body
 * @returns Parsed request body
 */
function parseRequestBody(body: string | null): ContactUsForm {
  console.log('Validating request.');

  const badRequest = {
    statusCode: 400,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  };

  if (body === undefined || body === null) {
    throw new Error(
      JSON.stringify({
        ...badRequest,
        body: 'Request body is missing.',
      }),
    );
  }

  let jsonBody;
  try {
    jsonBody = JSON.parse(body) as ContactUsForm;
  } catch (err) {
    console.error(err);
    console.log(body);
    throw new Error(
      JSON.stringify({
        ...badRequest,
        body: 'Request body is malformed. Error parsing JSON',
      }),
    );
  }

  const errors: string[] = [];
  if (jsonBody.fromEmailAddress === undefined) {
    errors.push(
      'Property "fromEmailAddress" is missing from the request body.',
    );
  } else if (typeof jsonBody.fromEmailAddress !== 'string') {
    errors.push('Property "fromEmailAddress" must be a string.');
  } else if (validateEmailAddress(jsonBody.fromEmailAddress) === false) {
    errors.push('Property "fromEmailAddress" must be a valid email address.');
  } else if (jsonBody.fromEmailAddress.length >= 256) {
    errors.push(
      'Property "fromEmailAddress" must be less than 256 characters.',
    );
  }

  if (jsonBody.subject === undefined) {
    errors.push('Property "subject" is missing from the request body.');
  } else if (typeof jsonBody.subject !== 'string') {
    errors.push('Property "subject" must be a string.');
  } else if (jsonBody.subject.length >= 100) {
    errors.push('Property "subject" must be less than 100 characters.');
  }

  if (jsonBody.message === undefined) {
    errors.push('Property "message" is missing from the request body.');
  } else if (typeof jsonBody.message !== 'string') {
    errors.push('Property "message" must be a string.');
  } else if (jsonBody.message.length >= 1028) {
    errors.push('Property "message" must be less than 1028 characters.');
  }

  if (errors.length > 0) {
    throw new Error(
      JSON.stringify({
        ...badRequest,
        body: errors.join('\n'),
      }),
    );
  }

  return jsonBody;
}

export const handler = async function handleRequest(
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResultV2> {
  console.log('Entered handler.');

  const emailAddress = process.env['ValidatedEmailAddress'];
  if (!emailAddress) {
    const message = 'ValidatedEmailAddress parameter is not set.';
    console.error(message);
    return {
      ...baseErrorResponse,
      body: message,
    };
  }

  if (validateEmailAddress(emailAddress) === false) {
    const message =
      'ValidatedEmailAddress parameter is not a valid email address.';
    console.error(message);
    return {
      ...baseErrorResponse,
      body: message,
    };
  }

  try {
    const contactForm = parseRequestBody(event.body);
    console.log(contactForm);

    contactForm.subject = `${contactForm.subject} ${process.env['EmailSubjectSuffix']}`;

    const messageId = await emailService.sendMessage(emailAddress, contactForm);

    console.log(`Email sent with ID ${messageId}.`);
    return {
      statusCode: 204,
      headers,
    };
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return baseErrorResponse;
    }

    console.error('Error occurred.');

    return {
      ...baseErrorResponse,
      body: err.message,
    };
  }
};
