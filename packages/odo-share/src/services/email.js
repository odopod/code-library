import { implode } from '../utils';

/**
 * LinkedIn
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - to
 *  - cc
 *  - bcc
 *  - subject
 *  - body
 */
export default {
  BASE: 'mailto:',
  params: {
    to: {
      friendly: 'to',
      parse: implode,
    },
    cc: {
      friendly: 'cc',
      parse: implode,
    },
    bcc: {
      friendly: 'bcc',
      parse: implode,
    },
    subject: {
      friendly: 'subject',
      parse: encodeURIComponent,
      default: document.title,
    },
    body: {
      friendly: 'body',
      parse: encodeURIComponent,
      default: window.location.href,
    },
  },
};
