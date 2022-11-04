import { validateStringProperty } from '../helpers/validate-string-property.helper';
import { IContactUsRequestBody } from './contact-us-request-body.interface';
import { EmailAddress } from './email-address.class';
import { ErrorArray } from './error-array.class';

/**
 * Parse and validate a "contact us" form
 */
export class ContactUsForm {
  captchaToken: string | undefined;
  fromEmailAddress: EmailAddress;
  fromName: string;
  message: string;
  subject: string;

  private maxLengthByPropertyName: Map<keyof IContactUsRequestBody, number>;

  constructor(requestBody: string | null, captchaFieldName?: string) {
    this.maxLengthByPropertyName = new Map([
      ['captchaToken', 2048],
      ['fromEmailAddress', 320],
      ['fromName', 255],
      ['subject', 255],
      ['message', 2048],
    ]);

    const values = this.parseRequestBody(requestBody, captchaFieldName);
    const errors = this.validateFormValues(values);
    if (errors.length > 0) {
      throw new ErrorArray(errors, 'The form contains invalid values.');
    }

    this.captchaToken = values.captchaToken;
    this.fromEmailAddress = new EmailAddress(values.fromEmailAddress);
    this.fromName = values.fromName;
    this.message = values.message;
    this.subject = values.subject;
  }

  /**
   * Parse request body of the "contact us" form
   *
   * @param body HTTP request body
   * @param captchaFieldName Name of the field containing the recaptcha token
   * @returns Parsed request body
   * @throws Error with message describing the problem
   */
  private parseRequestBody(
    body: string | null,
    captchaFieldName?: string,
  ): IContactUsRequestBody {
    if (body === undefined || body === null) {
      throw new Error('Request body is missing.');
    }

    const parsedBody = JSON.parse(body);

    let captchaToken;
    if (captchaFieldName) {
      captchaToken = parsedBody[captchaFieldName];

      if (captchaToken === undefined) {
        throw new Error('Captcha client token is missing.');
      }
    }

    return {
      fromName: parsedBody.fromName,
      fromEmailAddress: parsedBody.fromEmailAddress,
      subject: parsedBody.subject,
      message: parsedBody.message,
      captchaToken,
    };
  }

  /**
   * Validate the property values of the form.
   *
   * @param values Property values
   * @returns List of error messages for properties that failed validation
   * @throws Error if an unknown property exists
   */
  private validateFormValues(values: IContactUsRequestBody): string[] {
    const errors: string[] = [];
    for (const property of Object.getOwnPropertyNames(values)) {
      const propertyName = property as keyof IContactUsRequestBody;

      const maxLength = this.maxLengthByPropertyName.get(propertyName);

      errors.push(
        ...validateStringProperty(
          property,
          values[propertyName] as string,
          maxLength ?? 128,
          propertyName === 'captchaToken',
          propertyName.toLowerCase().includes('email'),
        ),
      );
    }

    return errors;
  }
}
