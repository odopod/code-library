import defaultsTo from './defaults-to';
import isString from './is-string';

/**
 * Parse a value as a string. If it's not a string, then the default value
 * will be returned.
 * @param {*} value The option.
 * @param {*} defaultValue The fallback value.
 * @return {*} If value is a string, value, else defaultValue.
 */
export default function getStringOption(value, defaultValue) {
  return defaultsTo(value, defaultValue, isString(value));
}
