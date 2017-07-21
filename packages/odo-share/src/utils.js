/**
 * Implodes an array into a comma-separated list, or returns the input
 * if the input is not an array.
 *
 * @param {string|array} input - The string or array to implode.
 * @return {string}
 */
export function implode(input) {
  if (typeof input !== 'string') {
    input = input.join(); // eslint-disable-line no-param-reassign
  }

  return encodeURIComponent(input);
}

/**
 * Implodes an array or string as well as strips a token from
 * the string or each item in the array. This is uesful for removing hastags or
 * @'s.
 *
 * @param {string|array} input - The string or array to implode.
 * @param {string} stripToken - The token to strip.
 * @return {string}
 */
export function implodeAndStrip(input, stripToken) {
  if (typeof input === 'string') {
    input = input.replace(', ', ',').split(','); // eslint-disable-line no-param-reassign
  }

  input = input.map(item => item.replace(stripToken, '')).join(); // eslint-disable-line no-param-reassign

  return encodeURIComponent(input);
}
