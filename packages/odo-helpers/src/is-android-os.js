/**
 * Detects the native Android Operating System.
 * @param {string} userAgent The user agent string.
 * @return {boolean}
 */
export default function isAndroidOS(userAgent) {
  return userAgent.includes('Mozilla/5.0') && userAgent.includes('Android ');
}
