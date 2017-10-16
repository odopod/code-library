const utilities = {
  /**
   * Fallback to a specified default if an input is undefined or null.
   * @param {*} obj The input to test.
   * @param {*} defaultValue The fallback if the input is undefined.
   * @param {boolean=} test If defined, `test` will be used to determine which
   *     value should be used.
   * @return {*} The sanitized output, either `obj` or `defaultValue`.
   */
  defaultsTo(obj, defaultValue, test = utilities.isDefined(obj)) {
    return test ? obj : defaultValue;
  },

  /**
   * @param {*} obj Anything.
   * @return {boolean}
   */
  isString(obj) {
    return typeof obj === 'string';
  },

  /**
   * @param {*} obj Anything.
   * @return {boolean}
   */
  isDefined(obj) {
    return obj !== undefined && obj !== null;
  },

  /**
   * Parse a value as a number. If it's not numeric, then the default value will
   * be returned.
   * @param {*} value The option.
   * @param {*} defaultValue The fallback value.
   * @return {*} If value is numeric, value, else defaultValue.
   */
  getNumberOption(value, defaultValue) {
    const number = parseFloat(value);
    return utilities.defaultsTo(number, defaultValue, !Number.isNaN(number));
  },

  /**
   * Parse a value as a string. If it's not a string, then the default value
   * will be returned.
   * @param {*} value The option.
   * @param {*} defaultValue The fallback value.
   * @return {*} If value is a string, value, else defaultValue.
   */
  getStringOption(value, defaultValue) {
    return utilities.defaultsTo(value, defaultValue, utilities.isString(value));
  },

  /**
   * Parse a value as a percentage. If it's a string with '%' in it, it will
   * be parsed as a string, otherwise it will be parsed as a number.
   * @param {*} value The option.
   * @param {*} defaultValue The fallback value.
   * @return {*}
   */
  getPercentageOption(value, defaultValue) {
    if (utilities.isString(value) && value.indexOf('%') > -1) {
      return utilities.getStringOption(value, defaultValue);
    }

    return utilities.getNumberOption(value, defaultValue);
  },

  noop() {},
};

export default utilities;
