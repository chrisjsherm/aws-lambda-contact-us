import { headerContentText } from './header-content-text.constant';

// HTTP response for 500 Internal Service Error
export const httpErrorInternalService = {
  statusCode: 500,
  headerContentText,
  body: 'An internal service error occurred.',
};
