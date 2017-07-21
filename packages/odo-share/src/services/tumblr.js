/**
 * Tumblr
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
  BASE: 'https://www.tumblr.com/widgets/share/tool',
  params: {
    url: {
      friendly: 'url',
      parse: encodeURI,
      default: window.location.href,
    },
    title: {
      friendly: 'title',
      parse: encodeURI,
      default: document.title,
    },
    description: {
      friendly: 'description',
      parse: encodeURI,
    },
  },
};
