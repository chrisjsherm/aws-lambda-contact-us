import { EmailAddress } from './email-address.class';

/**
 * Email
 */
export interface IEmail {
  message: string;
  replyToEmailAddresses: EmailAddress[];
  sourceEmailAddress: EmailAddress;
  subject: string;
  toEmailAddresses: EmailAddress[];

  ccEmailAddresses?: EmailAddress[];
  bccEmailAddresses?: EmailAddress[];
}
