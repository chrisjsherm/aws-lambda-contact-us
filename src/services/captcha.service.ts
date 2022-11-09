import axios from 'axios';
import {
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  ReplaySubject,
  take,
  tap,
} from 'rxjs';
import { ParameterService } from './parameter.service';
/**
 * Validate a human has initiated a request by validating the supplied token
 */
export class CaptchaService {
  private readonly verificationEndpoint: string;
  private readonly secretKey: ReplaySubject<string>;

  constructor(
    parameterService: ParameterService,
    secretKeyParameterPath: string,
  ) {
    this.verificationEndpoint =
      'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    this.secretKey = new ReplaySubject(1);
    parameterService
      .getParameterValue(secretKeyParameterPath, true)
      .pipe(
        tap((value: string): void => {
          console.log(`Secret key: ${value.substring(0, 2)}`);
          this.secretKey.next(value);
        }),
        take(1),
      )
      .subscribe();
  }

  /**
   * Validate a token against the captcha API
   *
   * @param token Token to validate
   * @param ip IP address of the request
   * @returns Fetch API Response
   */
  validateToken(token: string, ip?: string): Observable<boolean> {
    return this.secretKey.pipe(
      map((key: string): FormData => {
        const formData = new FormData();
        formData.append('secret', key);
        formData.append('response', token);

        if (ip) {
          formData.append('remoteip', ip);
        }

        return formData;
      }),
      mergeMap((formData: FormData) => {
        console.info('Calling captcha verification endpoint.');

        return from(
          axios.post<{ success: boolean }>(
            this.verificationEndpoint,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
          ),
        );

        // return fromFetch(this.verificationEndpoint, {
        //   body: formData,
        //   method: 'POST',
        // }).pipe(
        //   timeout({
        //     each: 2000,
        //   }),
        // );
      }),
      map((response): boolean => {
        return response.data.success;
      }),
      take(1),
      catchError((err) => {
        console.error(err);
        return of(false);
      }),
    );
  }
}
