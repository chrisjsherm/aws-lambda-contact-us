import {
  GetParametersCommand,
  GetParametersCommandOutput,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { ParameterService } from './parameter.service';
describe('Parameter service', (): void => {
  let service: ParameterService;
  const mockSSMClient = {
    send(command: GetParametersCommand): Promise<GetParametersCommandOutput> {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (command.input.Names![0] === '/missing/param') {
        return Promise.resolve({} as GetParametersCommandOutput);
      }

      return Promise.resolve({
        Parameters: [{ Value: 'param-value' }],
      } as GetParametersCommandOutput);
    },
  } as SSMClient;

  beforeEach((): void => {
    service = new ParameterService(mockSSMClient);
  });

  it('should create', (): void => {
    expect(service).toBeDefined();
  });

  it('should call SSM and retrieve the parameter value', (): void => {
    // Act
    const result$ = service.getParameterValue('/cloudflare/key');

    // Assert
    // Cannot use marbles: https://rxjs.dev/guide/testing/marble-testing#rxjs-code-that-consumes-promises-cannot-be-directly-tested
    result$.subscribe((value: string | undefined): void => {
      expect(value).toBe('param-value');
    });
  });

  it('should call SSM and throw when parameter is not found', (): void => {
    // Act
    const result$ = service.getParameterValue('/missing/param');

    // Assert
    result$.subscribe({
      error: (err) => {
        expect(err.message).toBe(
          'Parameter "/missing/param" does not have a value.',
        );
      },
    });
  });
});
