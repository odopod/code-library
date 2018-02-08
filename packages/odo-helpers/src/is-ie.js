/**
 * Check for Microsoft Internet Explorer string.
 * @param {string} userAgent The user agent string.
 * @return {boolean}
 */
export default function isIE(userAgent) {
  return userAgent.includes('Trident/');
}
