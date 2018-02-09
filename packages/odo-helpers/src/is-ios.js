/**
 * Detects the iOS operating system.
 * @param {string} userAgent  The user agent string.
 * @return {boolean}
 */
export default function isIOS(userAgent) {
  return /(iPad|iPhone|iPod)/g.test(userAgent);
}
