import { validateStringProperty } from './validate-string-property.helper';

describe('validate string property', (): void => {
  it('should consider optional and undefined values valid', (): void => {
    // Assert
    expect(validateStringProperty('myProp', undefined, 12, true).length).toBe(
      0,
    );
  });

  it('should consider optional but empty string values invalid', (): void => {
    // Assert
    expect(validateStringProperty('myProp', '', 12, true)[0]).toBe(
      'Property "myProp" is missing.',
    );
  });

  it('should enforce max length', (): void => {
    // Assert
    expect(validateStringProperty('myProp', 'hello', 4)[0]).toBe(
      'Property "myProp" must be less than 5 characters.',
    );
  });

  it('should enforce email check, when present', (): void => {
    // Assert
    expect(validateStringProperty('myProp', 'hello', 112, false, true)[0]).toBe(
      'Property "myProp" must be a valid email address.',
    );
  });
});
