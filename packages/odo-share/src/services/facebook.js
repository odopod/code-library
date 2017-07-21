/**
 * Facebook
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - [u=window.location.href] - URL of the page to share
 *
 * @see {@link https://dev.twitter.com/web/tweet-button#properties}
 */
export default {
  BASE: 'http://www.facebook.com/sharer.php',
  params: {
    u: {
      friendly: 'url',
      parse: encodeURIComponent,
      default: window.location.href,
    },
  },
};
