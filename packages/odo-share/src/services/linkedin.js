/**
 * LinkedIn
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - mini
 *  - ro
 *  - title - Title of the page to share
 *  - url - URL of the page to share
 *
 * @see {@link https://www.linkedin.com/static?key=browser_bookmarklet}
 */
export default {
  BASE: 'http://www.linkedin.com/shareArticle',
  features: 'width=520,height=570,toolbar=0,location=0,status=0,scrollbars=yes',
  params: {
    mini: {
      friendly: 'mini',
      default: true,
    },
    ro: {
      friendly: 'ro',
      default: false,
    },
    title: {
      friendly: 'title',
      parse: encodeURIComponent,
      default: document.title,
    },
    url: {
      friendly: 'url',
      parse: encodeURIComponent,
      default: window.location.href,
    },
  },
};
