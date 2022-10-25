import { APIGatewayEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { validateEmailAddress } from './helpers/validate-email-address.helper';
import { EmailService } from './services/email.service';

const emailService = new EmailService();
const headers = {
  'content-type': 'text/plain; charset=utf-8',
};
const baseErrorResponse = {
  statusCode: 500,
  headers,
};

export const handler = async function handleRequest(
  _event: APIGatewayEvent,
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
    const messageId = await emailService.sendMessage(emailAddress);

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
