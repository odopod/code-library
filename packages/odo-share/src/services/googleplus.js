/**
 * Google Plus
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - url - URL of the page to share
 */
export default {
  BASE: 'https://plus.google.com/share',
  features: 'width=600,height=460,menubar=no,location=no,status=no',
  params: {
    url: {
      friendly: 'url',
      parse: encodeURIComponent,
      default: window.location.href,
    },
  },
};
