import { ContactUsForm } from '../models/contact-us-form.class';
import { parseRequestBody } from './parse-request-body.helper';

describe('Parse request body helper', (): void => {
  beforeAll((): void => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('should throw on missing body', (): void => {
    // Assert
    expect((): ContactUsForm => parseRequestBody(null)).toThrow(
      'Request body is missing.',
    );
  });

  it('should throw on JSON parsing error', (): void => {
    // Arrange
    const body =
      '{fromName: "Dan", fromEmailAddress: "danno@gmail.com", subject: ' +
      '"Status update", message: "Hello, World"}';

    // Assert
    expect((): ContactUsForm => parseRequestBody(body)).toThrow(
      'Request body is malformed. Error parsing JSON.',
    );
  });

  it('should throw on validation errors', (): void => {
    // Arrange
    const body =
      '{"fromName": "Dan", "fromEmailAddress": "danno@@gmail.com", ' +
      '"subject": "",' +
      ' "message": "Hello, World"}';

    // Assert
    expect((): ContactUsForm => parseRequestBody(body)).toThrow();
  });

  it('should successfully parse into a contact form', (): void => {
    // Arrange
    const body =
      '{"fromName": "Dan", "fromEmailAddress": "danno@gmail.com", "subject": "Status update", "message": "Hello, World"}';

    // Act
    const result = parseRequestBody(body);

    // Assert
    expect(result).toEqual(
      new ContactUsForm(
        'Dan',
        'danno@gmail.com',
        'Status update',
        'Hello, World',
      ),
    );
  });
});
