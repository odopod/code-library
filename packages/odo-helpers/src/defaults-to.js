import isDefined from './is-defined';

/**
 * Fallback to a specified default if an input is undefined or null.
 * @param {*} obj The input to test.
 * @param {*} defaultValue The fallback if the input is undefined.
 * @param {boolean=} test If defined, `test` will be used to determine which
 *     value should be used.
 * @return {*} The sanitized output, either `obj` or `defaultValue`.
 */
export default function defaultsTo(obj, defaultValue, test = isDefined(obj)) {
  return test ? obj : defaultValue;
}
