const regEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the email address is well-formed.
 *
 * @param emailAddress Address to validate
 * @returns Whether the email address is valid
 */
export function validateEmailAddress(emailAddress: string): boolean {
  return regEx.test(emailAddress);
}
