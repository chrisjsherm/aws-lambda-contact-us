import { isValidEmailAddress } from './is-valid-email-address.helper';

/**
 * Validate a string property.
 *
 * @param name Name of the property to validate
 * @param value Value to validate
 * @param maxLength Max acceptable length of the value
 * @param isOptional Whether the value can be undefined
 * @param isEmailAddress Whether to validate as an email address
 * @returns Error messages
 */
export function validateStringProperty(
  name: string,
  value: string | undefined,
  maxLength: number,
  isOptional = false,
  isEmailAddress = false,
): string[] {
  if (isOptional && value === undefined) {
    return [];
  }

  if (value === undefined || value === '') {
    return [`Property "${name}" is missing.`];
  } else if (typeof value !== 'string') {
    `Property "${name}" must be a string.`;
  } else if (value.length > maxLength) {
    return [
      `Property "${name}" must be less than ${maxLength + 1} characters.`,
    ];
  } else if (isEmailAddress && isValidEmailAddress(value) === false) {
    return [`Property "${name}" must be a valid email address.`];
  }

  return [];
}
