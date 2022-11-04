import { isValidEmailAddress } from '../helpers/is-valid-email-address.helper';

/**
 * Validated email address
 */
export class EmailAddress {
  private value: string;

  constructor(address: string) {
    if (isValidEmailAddress(address) === false) {
      throw new Error(`Email address ${address} is not valid.`);
    }
    this.value = address;
  }

  /**
   * Get the email address value
   *
   * @returns Email address value
   */
  toString(): string {
    return this.value;
  }
}
