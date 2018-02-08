import defaultsTo from './defaults-to';

/**
 * Parse a value as a number. If it's not numeric, then the default value will
 * be returned.
 * @param {*} value The option.
 * @param {*} defaultValue The fallback value.
 * @return {*} If value is numeric, value, else defaultValue.
 */
export default function getNumberOption(value, defaultValue) {
  const number = parseFloat(value);
  return defaultsTo(number, defaultValue, !Number.isNaN(number));
}
