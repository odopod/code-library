import isString from './is-string';
import getStringOption from './get-string-option';
import getNumberOption from './get-number-option';

/**
 * Parse a value as a percentage. If it's a string with '%' in it, it will
 * be parsed as a string, otherwise it will be parsed as a number.
 * @param {*} value The option.
 * @param {*} defaultValue The fallback value.
 * @return {*}
 */
export default function getPercentageOption(value, defaultValue) {
  if (isString(value) && value.indexOf('%') > -1) {
    return getStringOption(value, defaultValue);
  }

  return getNumberOption(value, defaultValue);
}
