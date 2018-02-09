import isEdge from './is-edge';

/**
 * Detects all Google Chrome browsers.
 * @param {string} userAgent The user agent string.
 * @return {boolean}
 */
export default function isChrome(userAgent) {
  return !isEdge(userAgent) && userAgent.includes('Chrome');
}
