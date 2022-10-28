import { validateEmailAddress } from '../helpers/validate-email-address.helper';
import { IContactUs } from './contact-us.interface';

/**
 * "Contact us" form
 */
export class ContactUsForm implements IContactUs {
  constructor(
    public fromName: string,
    public fromEmailAddress: string,
    public subject: string,
    public message: string,
  ) {}

  /**
   * Validate the property values of the form
   *
   * @returns List of error messages for properties that failed validation
   */
  validateProperties(): string[] {
    return [
      ...this.validateString('fromName', this.fromName, 255),
      ...this.validateString(
        'fromEmailAddress',
        this.fromEmailAddress,
        255,
        true,
      ),
      ...this.validateString('subject', this.subject, 127),
      ...this.validateString('message', this.message, 1027),
    ];
  }

  /**
   * Validate a string property
   *
   * @param property Name of the property to validate
   * @param value Value to validate
   * @param maxLength Max acceptable length of the value
   * @param isEmailAddress Whether to validate as an email address
   * @returns List of error messages
   */
  private validateString(
    property: string,
    value: string,
    maxLength: number,
    isEmailAddress = false,
  ): string[] {
    const errors = [];
    if (value === undefined || value === '') {
      errors.push(`Property "${property}" is missing from the request body.`);
    } else if (typeof value !== 'string') {
      errors.push(`Property "${property}" must be a string.`);
    } else if (value.length > maxLength) {
      errors.push(
        `Property "${property}" must be less than ${maxLength + 1} characters.`,
      );
    } else if (isEmailAddress && validateEmailAddress(value) === false) {
      errors.push(`Property "${property}" must be a valid email address.`);
    }

    return errors;
  }
}
