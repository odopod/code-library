const string = {
  /**
   * Capitalize a string.
   * @param {string} str String to capitalize.
   * @return {string} Capitalized string.
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Hyphenates a javascript style string to a css one. For example:
   * MozBoxSizing -> -moz-box-sizing.
   *
   * @param {string|boolean} str The string to hyphenate.
   * @return {string} The hyphenated string.
   */
  hyphenate(str) {
    // Catch booleans.
    if (!str) {
      return '';
    }

    // Turn MozBoxSizing into -moz-box-sizing.
    return str
      .replace(/([A-Z])/g, (str, m1) => '-' + m1.toLowerCase())
      .replace(/^ms-/, '-ms-');
  },

  /**
   * Creates a random string for IDs, etc.
   * http://stackoverflow.com/a/8084248/995529
   *
   * @return {string} Random string.
   */
  random() {
    return Math.random().toString(36).substring(7);
  },
};

export default string;
