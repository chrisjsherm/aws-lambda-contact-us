import { validateEmailAddress } from './validate-email-address.helper';

describe('Validate email address', (): void => {
  it('should return false for empty strings', (): void => {
    // Act
    const result = validateEmailAddress('');

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for malformed email addresses', (): void => {
    expect(validateEmailAddress('hello')).toBe(false);
    expect(validateEmailAddress('hello@')).toBe(false);
    expect(validateEmailAddress('hello.com')).toBe(false);
    expect(validateEmailAddress('hello@@example.com')).toBe(false);
  });

  it('should return true for a well-formed email address', (): void => {
    expect(validateEmailAddress('hello@example.com')).toBe(true);
  });
});
