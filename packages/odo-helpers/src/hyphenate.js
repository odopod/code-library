/**
 * Hyphenates a javascript style string to a css one. For example:
 * MozBoxSizing -> -moz-box-sizing.
 * @param {string|false} str The string to hyphenate.
 * @return {string} The hyphenated string.
 */
export default function hyphenate(str) {
  // Catch booleans.
  if (!str) {
    return '';
  }

  // Turn MozBoxSizing into -moz-box-sizing.
  return str
    .replace(/([A-Z])/g, (str, m1) => '-' + m1.toLowerCase())
    .replace(/^ms-/, '-ms-');
}
