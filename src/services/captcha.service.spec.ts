import { cold } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import * as rxjsFetch from 'rxjs/fetch';
import { CaptchaService } from './captcha.service';
import { ParameterService } from './parameter.service';

describe('Captcha service', (): void => {
  let service: CaptchaService;

  beforeEach((): void => {
    const parameterService = {
      getParameterValue: (
        _parameterName: string,
        _withDecryption = false,
      ): Observable<string> => of('secret-key'),
    } as ParameterService;
    service = new CaptchaService(parameterService, '/path/to/key');
  });

  it('should create', (): void => {
    // Assert
    expect(service).toBeDefined();
  });

  it('should successfully call the verification endpoint with an IP', (): void => {
    // Arrange
    jest.spyOn(rxjsFetch, 'fromFetch').mockReturnValue(
      of({
        ok: true,
      } as Response),
    );

    // Act
    const result$ = service.validateToken('my-token', '192.1.1.1');

    // Assert
    expect(result$).toBeObservable(cold('(a|)', { a: true }));
  });

  it('should successfully call the verification endpoint without an IP', (): void => {
    // Arrange
    jest.spyOn(rxjsFetch, 'fromFetch').mockReturnValue(
      of({
        ok: true,
      } as Response),
    );

    // Act
    const result$ = service.validateToken('my-token');

    // Assert
    expect(result$).toBeObservable(cold('(a|)', { a: true }));
  });

  it('should unsuccessfully call the verification endpoint', (): void => {
    // Arrange
    jest.spyOn(rxjsFetch, 'fromFetch').mockReturnValue(
      of({
        ok: false,
      } as Response),
    );

    // Act
    const result$ = service.validateToken('my-token');

    // Assert
    expect(result$).toBeObservable(cold('(a|)', { a: false }));
  });

  it('should handle a thrown error', (): void => {
    // Arrange
    jest
      .spyOn(rxjsFetch, 'fromFetch')
      .mockReturnValue(throwError(() => new Error('DNS lookup failed')));
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const result$ = service.validateToken('my-token');

    // Assert
    expect(result$).toBeObservable(cold('(a|)', { a: false }));
  });
});
