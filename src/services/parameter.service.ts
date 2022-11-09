import {
  GetParametersCommand,
  GetParametersCommandInput,
  GetParametersCommandOutput,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { from, map, Observable } from 'rxjs';

/**
 * Interact with the parameter store
 */
export class ParameterService {
  constructor(private ssmClient: SSMClient) {}

  /**
   * Get a parameter from the store.
   *
   * @param parameterName Parameter to retrieve
   * @param withDecryption Whether we should decrypt the parameter value
   * @returns Parameter value
   * @throws Error when the parameter is not found
   */
  getParameterValue(
    parameterName: string,
    withDecryption = false,
  ): Observable<string> {
    const input: GetParametersCommandInput = {
      Names: [parameterName],
      WithDecryption: withDecryption,
    };
    const command = new GetParametersCommand(input);

    return from(this.ssmClient.send(command)).pipe(
      map((result: GetParametersCommandOutput): string => {
        if (
          result.Parameters === undefined ||
          result.Parameters[0] === undefined ||
          !result.Parameters[0].Value
        ) {
          throw new Error(
            `Parameter "${parameterName}" does not have a value.`,
          );
        }

        return result.Parameters[0].Value;
      }),
    );
  }
}
