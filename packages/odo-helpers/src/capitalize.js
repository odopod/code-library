/**
 * Capitalize a string.
 * @param {string} str String to capitalize.
 * @return {string} Capitalized string.
 */
export default function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
