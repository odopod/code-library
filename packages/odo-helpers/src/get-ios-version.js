/**
 * Detects the version of iOS operating system.
 * @param {string} userAgent The user agent string.
 * @return {number} iOS version. iOS 8.4.0, for example, will return `840`.
 */
export default function getIOSVersion(userAgent) {
  const iosUserAgent = userAgent.match(/OS\s+([\d_]+)/i);
  const iosVersion = iosUserAgent[1].split('_');

  // The iOS ua string doesn't include the patch version if it's zero.
  if (iosVersion.length === 2) {
    iosVersion[2] = '0';
  }

  return parseInt(iosVersion.reduce((str, number) => str + number, ''), 10);
}
