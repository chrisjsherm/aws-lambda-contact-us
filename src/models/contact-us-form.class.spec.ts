import { ContactUsForm } from './contact-us-form.class';

describe('Contact us form', (): void => {
  it('should create', (): void => {
    // Act
    const result = new ContactUsForm(
      'Dan',
      'danno@gmail.com',
      'Hello, World',
      'Good morning',
    );

    // Assert
    expect(result).toBeDefined();
  });

  it('should consider valid', (): void => {
    // Arrange
    const result = new ContactUsForm(
      'Dan',
      'danno@gmail.com',
      'Hello, World',
      'Good morning',
    );

    // Act
    const errors = result.validateProperties();

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should consider empty fields invalid', (): void => {
    // Arrange
    const result = new ContactUsForm('', '', '', '');

    // Act
    const errors = result.validateProperties();

    // Assert
    expect(errors.length).toBe(4);
  });

  it('should consider non-string values invalid', (): void => {
    // Arrange
    const result = new ContactUsForm(
      1 as unknown as string,
      2 as unknown as string,
      3 as unknown as string,
      4 as unknown as string,
    );

    // Act
    const errors = result.validateProperties();

    // Assert
    expect(errors.length).toBe(4);
  });

  it('should enforce max lengths', (): void => {
    // Arrange
    const result = new ContactUsForm(
      '9eQZ8ORbQJ9BEqKlJpXpRixh49i7JmUSpMQr7r0j4cY99zHJaPyCwuftiDT3nz0PlXYNb6TKMS254HFnU9pJYejSw2IDfhGdnjugFaGfilK2VTI2SC4kOeRXENgSEEJfWgK6AiLuzuUIeDCVaQgrLUQOjcd0RaP25SlNzTEz4iXVJ8ee2E5Xq98QSS0T4k4hWXl9FhikYLzZggNVlWbHJVczS7NtaCMoDM2bNH0uRUYwXEeaOg9xsccDbonMv3kp',
      '6VbK8yWm2TMI3iSyT4Xc8pY6NuNyyAlN8k4uyl3phrL6bppwxXuVRIbOCZIEhVcDKLmraFVSXKgXhO27BKQdeaMBLQls31U88JpQXpN3C4zU4u6zZxIYK11YryvMcuEjYWLyTtvmyZxRph8Io5dCxrAkgibpSCkZtGV8FbaAEEwe42tXOnKcm8IjPHGwd2GJjfOOxmCaxnj8a8SXzVmUy8nzdALb4CkB7kMys97rGQnn6kBxpRcOBGtAH9kczVOx@gmail.com',
      'ObZQeVO3MiXsG4GTxwDUZBZFUzgeSfd1UClhTJyhnE9cHZ50rr4nOTn9MOZcr9aIU6JoH4SyNdnKX4B1Dxo9o2z7Nwgx71HilVeT74XjEDrTIQ1WkAdb9trP2kQti97i',
      'oHkwUjpB0rD77a1lsiswppWufdoMbY8eo0Izn8zYJjqt1iqvt6PWErDrcXP29LflRiYw3UxGCuY29oqKp2WJX98aGtHnS7PtQpIMVxumlAnbe4WixvvymbsvSMR7R4qhzhuOz6bgdX7SIlcJmp5fE4BAlLNW5zJOFVYj7npGYhZgb8vfrWP5zFrW9LYfEb5lRJPwPtkNdDl5lZSatQbMJRTE6UtWAUPz4OeoPKpQypIUKTmINOrgKN1x9tKXQ8SNGfjcUMDpeHQWDtUsKS4S6jbhFqUkU8THet9U5FMM1AQztP0aqu1eFOTYqf8LfPMMA3IX2uXtZbsDhe4eqTiiPQ1PjKr4vdbaVesyDOSwPUqJaIbagmptOwdEDhkJEh2QEtyrR54eKRj8G34Ijfx7Z5iF7liAXWuWId2wGSWuJBAjJ9vRHzdgIe4LmqzTOjRHAcBbUq3oDqmvzNYWyD1KpaNrsxRgPTpa9Xhn1VcDk7MHFNEnGdPo52sAxCcd6AhK2ax23DbtYQSiS4CTwhzZ2N15ilL6xRv9CKINqlzDJq3Sb4rOuXGnWnTOpGirT8VvSlTTTD2uTpvjQXdL7fubfBdgAAkTV3ZNiynREUhPBwJ72KYRsUIPGxzNZbJJYx0OqjOYrgJpB8wQ4URC609WeRWw3miLkfQ7Esx9ErrParMysGJYZPpcP5lS1GHjLxbF19KxvWwN919YytySh4Yt4ExhoIkr9cta5bG3YfWoIqDFFmQ8Lcsz8A2gCqm302bsCMHBENCNCSgg0Vzfqr6yUQ0ZC4l4uYMGRuRqklNLwkmimHtouMeDXLkbCyvRYhrMQm7DafqJiKqN9lur7EQCcaooS1M4eyh3LW5DipoIMy2bFvY048AcJ5zCBLhG5SMJvHC2GWVKIoVVLZZ3l7nOY2XHcTfypmz6gLIluFZSYQHEgu326rpBrTMagjM0ajdRgFw71oABpZ8WQHsKTfmTEYviGPct7qNAHRqeTF69ZiZjGFNPpAsGHMrfsQ8lweridh64',
    );

    // Act
    const errors = result.validateProperties();

    // Assert
    expect(errors.length).toBe(4);
  });

  it('should mark mal-formed email addresses as invalid', (): void => {
    // Arrange
    const result = new ContactUsForm(
      'Dan',
      'danno@@gmail.com',
      'Hello, World',
      'Good morning',
    );

    // Act
    const errors = result.validateProperties();

    // Assert
    expect(errors.length).toBe(1);
  });
});
