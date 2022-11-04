const tester =
  /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

/**
 * Determine if an email address is well-formed.
 * Code adapted from: https://github.com/manishsaraan/email-validator
 *
 * @param emailAddress Address to validate
 * @returns Whether the email address is valid
 */
export function isValidEmailAddress(emailAddress: string): boolean {
  if (!emailAddress || typeof emailAddress !== 'string') {
    return false;
  }

  const emailParts = emailAddress.split('@');

  if (emailParts[0] === undefined || emailParts[1] === undefined) {
    return false;
  }

  const account = emailParts[0];
  const address = emailParts[1];

  if (account.length > 64) return false;
  else if (address.length > 255) return false;

  const domainParts = address.split('.');
  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  )
    return false;

  if (!tester.test(emailAddress)) return false;

  return true;
}
