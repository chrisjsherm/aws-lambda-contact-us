import { ContactUsForm } from '../models/contact-us-form.class';
import { IContactUs } from '../models/contact-us.interface';

/**
 * Parse request body of the "contact us" form, ensuring it is well-formed
 *
 * @param body Request body
 * @returns Parsed request body
 */
export function parseRequestBody(body: string | null): ContactUsForm {
  console.info('Validating request body.');

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

  let contactUsForm: ContactUsForm;
  try {
    const parsedBody = JSON.parse(body) as IContactUs;
    contactUsForm = new ContactUsForm(
      parsedBody.fromName,
      parsedBody.fromEmailAddress,
      parsedBody.subject,
      parsedBody.message,
    );
  } catch (err) {
    console.error(err);
    console.info(body);
    throw new Error(
      JSON.stringify({
        ...badRequest,
        body: 'Request body is malformed. Error parsing JSON.',
      }),
    );
  }

  const errors: string[] = contactUsForm.validateProperties();
  if (errors.length > 0) {
    throw {
      ...badRequest,
      body: errors.join('\n'),
    };
  }

  return contactUsForm;
}