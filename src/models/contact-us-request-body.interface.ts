/**
 * Data collected in the "contact us" form.
 */
export interface IContactUsRequestBody {
  fromEmailAddress: string;
  fromName: string;
  message: string;
  subject: string;

  captchaToken?: string | undefined;
}
