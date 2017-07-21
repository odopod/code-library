import { implodeAndStrip } from '../utils';

/**
 * Twitter
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - [url=window.location.href] - URL of the page to share
 *  - via - Screen name of the user to attribute the
 *    Tweet to
 *  - text - Default Tweet text
 *  - related - Related accounts
 *  - [lang='en'] - The language for the Tweet Button
 *  - counturl - URL to which your shared URL resolves
 *  - hashtags - Comma separated hashtags appended to tweet text
 *
 * @see {@link https://dev.twitter.com/web/tweet-button#properties}
 */
export default {
  BASE: 'https://twitter.com/intent/tweet',
  params: {
    url: {
      friendly: 'url',
      parse: encodeURIComponent,
      default: window.location.href,
    },
    via: {
      friendly: 'via',
      parse(input) {
        return encodeURIComponent(input.replace('@', ''));
      },
    },
    text: {
      friendly: 'text',
      parse: encodeURIComponent,
    },
    related: {
      friendly: 'recommend',
      parse(input) {
        return implodeAndStrip(input, '@');
      },
    },
    lang: {
      friendly: 'language',
      parse: encodeURIComponent,
      default: 'en',
    },
    counturl: {
      friendly: 'resolvesTo',
      parse: encodeURIComponent,
    },
    hashtags: {
      friendly: 'hashtags',
      parse(input) {
        return implodeAndStrip(input, '#');
      },
    },
  },
};
