import { ContactUsForm } from './contact-us-form.class';
import { ErrorArray } from './error-array.class';

describe('Contact us form', (): void => {
  beforeAll((): void => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('should create', (): void => {
    // Act
    const result = new ContactUsForm(
      '{"fromName": "Dan", "fromEmailAddress": "danno@gmail.com", ' +
        '"subject": "Status update", "message": "Hello, World", ' +
        '"cf-turnstile": "red-fox"}',
      'cf-turnstile',
    );

    // Assert
    expect(result).toBeDefined();
    expect(result.captchaToken).toBe('red-fox');
    expect(result.fromEmailAddress.toString()).toBe('danno@gmail.com');
    expect(result.fromName).toBe('Dan');
    expect(result.subject).toBe('Status update');
    expect(result.message).toBe('Hello, World');
  });

  it('should throw on missing body', (): void => {
    // Assert
    expect(
      (): ContactUsForm =>
        new ContactUsForm(null as unknown as string, 'cf-turnstile'),
    ).toThrow('Request body is missing.');
  });

  it('should throw on JSON parsing error', (): void => {
    // Arrange
    const body =
      '{fromName: "Dan", fromEmailAddress: "danno@gmail.com", subject: ' +
      '"Status update", message: "Hello, World"}';

    // Assert
    expect(
      (): ContactUsForm => new ContactUsForm(body, 'cf-turnstile'),
    ).toThrow('Unexpected token f in JSON at position 1');
  });

  it('should consider empty fields invalid', (): void => {
    // Arrange
    const body = JSON.stringify({
      fromName: '',
      fromEmailAddress: '',
      subject: '',
      message: '',
      'cf-turnstile': '',
    });

    // Assert
    expect(
      (): ContactUsForm => new ContactUsForm(body, 'cf-turnstile'),
    ).toThrow();
  });

  it('should consider non-string values invalid', (): void => {
    // Arrange
    const body = JSON.stringify({
      fromName: 1 as unknown as string,
      fromEmailAddress: 2 as unknown as string,
      subject: 3 as unknown as string,
      message: 4 as unknown as string,
      'cf-turnstile': 5 as unknown as string,
    });

    // Assert
    expect(
      (): ContactUsForm => new ContactUsForm(body, 'cf-turnstile'),
    ).toThrow('Email address 2 is not valid.');
  });

  it('should enforce max lengths', (): void => {
    // Arrange
    const body = JSON.stringify({
      fromName:
        '9eQZ8ORbQJ9BEqKlJpXpRixh49i7JmUSpMQr7r0j4cY99zHJaPyCwuftiDT3nz0PlXYNb6TKMS254HFnU9pJYejSw2IDfhGdnjugFaGfilK2VTI2SC4kOeRXENgSEEJfWgK6AiLuzuUIeDCVaQgrLUQOjcd0RaP25SlNzTEz4iXVJ8ee2E5Xq98QSS0T4k4hWXl9FhikYLzZggNVlWbHJVczS7NtaCMoDM2bNH0uRUYwXEeaOg9xsccDbonMv3kp',
      fromEmailAddress:
        '6VbK8yWm2TMI3iSyT4Xc8pY6NuNyyAlN8k4uyl3phrL6bppwxXuVRIbOCZIEhVcDKLmraFVSXKgXhO27BKQdeaMBLQls31U88JpQXpN3C4zU4u6zZxIYK11YryvMcuEjYWLyTtvmyZxRph8Io5dCxrAkgibpSCkZtGV8FbaAEEwe42tXOnKcm8IjPHGwd2GJjfOOxmCaxnj8a8SXzVmUy8nzdALb4CkB7kMys97rGQnn6kBxpRcOBGtAH9kczVOx@gmail.com',
      subject:
        'kHlzCv3qilUOnzwYXSt1FVYI29ba6E7CS27MUoCX0YWvdrJD54wgjqcBENpdHAfHUAle4foEJQzjPBwDjCiDHPvztiJIaFvrTclhO2DwDbRdiYqqGm545DiXkMrR3hE5KvZpnbElxEPGwQNZqCSD52hIp9muiTbGmPFckCgSmYmKWGT8FFUDlzun6ksC4nhYoKSmaEBRd5fJGhba3wUnDXG2g31MyuAfE8FSJgeGBrkbDJR7uxj7x915OJes1KCv',
      message:
        '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',
      'cf-turnstile':
        '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',
    });

    // Assert
    expect(
      (): ContactUsForm => new ContactUsForm(body, 'cf-turnstile'),
    ).toThrow(new ErrorArray([], 'The form contains invalid values.'));
  });

  it('should mark mal-formed email addresses as invalid', (): void => {
    // Arrange
    const body = JSON.stringify({
      fromName: 'Dan',
      fromEmailAddress: 'danno@@gmail.com',
      subject: 'Hello, World',
      message: 'Good morning',
      'cf-turnstile': 'red-fox',
    });

    // Assert
    expect(
      (): ContactUsForm => new ContactUsForm(body, 'cf-turnstile'),
    ).toThrow('The form contains invalid values.');
  });

  it('should throw when captchaFieldName parameter is set but not in the form', (): void => {
    // Arrange
    const body = JSON.stringify({
      fromName: 'Dan',
      fromEmailAddress: 'danno@gmail.com',
      subject: 'Hello, World',
      message: 'Good morning',
    });

    // Assert
    expect(
      (): ContactUsForm => new ContactUsForm(body, 'cf-turnstile'),
    ).toThrow('Captcha client token is missing.');
  });
});
