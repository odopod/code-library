import isNativeAndroid from './is-native-android';
import isIOS from './is-ios';
import getIOSVersion from './get-ios-version';

/**
 * User agent test for IOS. Determines whether current version is < 8. Version 8
 * and higher allow javascript execution while scrolling.
 * @param {string} userAgent The user agent string.
 * @return {boolean}
 */
export default function hasScrollEvents(userAgent) {
  if (isIOS(userAgent)) {
    return getIOSVersion(userAgent) >= 800;
  }
  return !isNativeAndroid(userAgent);
}
