import isAndroidOS from './is-android-os';
import isChrome from './is-chrome';

/**
 * Whether the give user agent is from the stock Android browser.
 * @param {string} userAgent User agent string.
 * @return {boolean}
 */
export default function isNativeAndroid(userAgent) {
  return isAndroidOS(userAgent) && !isChrome(userAgent);
}
