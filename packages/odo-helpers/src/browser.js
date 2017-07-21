
/* istanbul ignore next */
function normalizeHash(hash) {
  if (typeof hash !== 'string') {
    throw new Error('Hash must be of type string');
  } else {
    return hash.replace(/^#/, '');
  }
}

const browser = {
  /**
   * Detects the native Android Operating System.
   *
   * @param {string} userAgent  The user agent string.
   * @return {boolean}
   */
  isAndroidOS(userAgent) {
    return userAgent.includes('Mozilla/5.0') && userAgent.includes('Android ');
  },

  /**
   * Detects the iOS operating system.
   *
   * @param {string} userAgent  The user agent string.
   * @return {boolean}
   */
  isIOS(userAgent) {
    return /(iPad|iPhone|iPod)/g.test(userAgent);
  },

  /**
   * User agent test for IOS. Determines whether current version is < 8. Version 8
   * and higher allow javascript execution while scrolling.
   *
   * @param {string} userAgent The user agent string.
   * @return {boolean}
   */
  hasScrollEvents(userAgent) {
    if (this.isIOS(userAgent)) {
      return this.getIOSVersion(userAgent) >= 800;
    }
    return !browser.isNativeAndroid(userAgent);
  },

  /**
   * Detects the version of iOS operating system.
   *
   * @param {string} userAgent  The user agent string.
   * @return {number} iOS version. iOS 8.4.0, for example, will return `840`.
   */
  getIOSVersion(userAgent) {
    const iosUserAgent = userAgent.match(/OS\s+([\d_]+)/i);
    const iosVersion = iosUserAgent[1].split('_');

    // The iOS ua string doesn't include the patch version if it's zero.
    if (iosVersion.length === 2) {
      iosVersion[2] = 0;
    }

    return parseInt(iosVersion.reduce((str, number) => str + number, ''), 10);
  },

  /**
   * Check for Microsoft Edge string.
   *
   * @param {string} userAgent  The user agent string.
   * @return {boolean}
   */
  isEdge(userAgent) {
    return userAgent.includes('Edge/');
  },

  /**
   * Check for Microsoft Internet Explorer string.
   *
   * @param {string} userAgent  The user agent string.
   * @return {boolean}
   */
  isIE(userAgent) {
    return userAgent.includes('Trident/');
  },

  /**
   * Detects all Google Chrome browsers.
   *
   * @param {string} userAgent  The user agent string.
   * @return {boolean}
   */
  isChrome(userAgent) {
    return !browser.isEdge(userAgent) && userAgent.includes('Chrome');
  },

  /**
   * Whether the give user agent is from the stock Android browser.
   * @param {string} userAgent User agent string.
   * @return {boolean}
   */
  isNativeAndroid(userAgent) {
    return browser.isAndroidOS(userAgent) && !browser.isChrome(userAgent);
  },

  /**
   * Updates the browser's hash
   * @param {string} newHash New hash, without `#`
   */
  setHash(newHash) {
    const hash = normalizeHash(newHash);
    let st;

    // When resetting the hash with `''`, the page will scroll back to the top,
    // so we cache the current scroll position.
    if (!hash) {
      st = window.pageYOffset;
    }

    window.location.hash = hash;

    // Scroll back to the position from before.
    if (!hash) {
      window.scrollTo(0, st);
    }
  },

  /**
   * Updates the user's history with new hash
   * @param {string} newHash New hash, without `#`
   */
  replaceWithHash(newHash) {
    let hash = normalizeHash(newHash);
    if (window.history.replaceState) {
      hash = normalizeHash(hash);

      // If resetting the hash, the whole path is needed. `''` doesn't work.
      if (hash) {
        hash = '#' + hash;
      } else {
        hash = window.location.pathname + window.location.search;
      }

      window.history.replaceState({}, null, hash);
    } else {
      browser.setHash(hash);
    }
  },
};

export default browser;
