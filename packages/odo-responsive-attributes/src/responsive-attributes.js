/**
 * @fileoverview Parse data attributes with respect to their breakpoints.
 *
 * @author Glen Cheney <glen@odopod.com>
 */

import OdoBaseComponent from '@odopod/odo-base-component';

class ResponsiveAttributes {

  /**
   * Create a new instance of the attribute parser.
   * @param {Element} element Element to read attributes from.
   * @param {string} [attributeName] Name of the data attribute.
   * @constructor
   */
  constructor(element, attributeName = 'responsive') {
    this.element = element;
    this.attr = attributeName;
    this.values = this.parse();
    this.update();
  }

  /**
   * Update the current value for this breakpoint.
   * @return {ResponsiveAttributes} The instance for chaining.
   */
  update() {
    this.currentValue = this.getCurrentBreakpointValue(this.values);
    return this;
  }

  /**
   * Parse the repsonsive attributes.
   * @return {{xs: ?string, sm: ?string, md: ?string, lg: ?string}} An object
   *     containing values for each breakpoint, each of which could be null.
   */
  parse() {
    const obj = {};
    let lastValue = null;
    const defaultValue = this._getAttribute('', '');

    OdoBaseComponent.BREAKPOINT_NAMES.forEach((name) => {
      obj[name] = this._getAttributeValue(name, defaultValue || lastValue);
      lastValue = obj[name];
    });

    return obj;
  }

  /**
   * Retrieve the attribute's value. If that value doesn't exist, return the
   * default value.
   * @param {string} name Breakpoint name (xs, sm, md, lg).
   * @param {?string} defaultValue Default value for the attribute.
   * @return {?string}
   */
  _getAttributeValue(name, defaultValue) {
    return this._getAttribute(name) || defaultValue;
  }

  /**
   * Read a responsive attribute.
   * @param {string} name Breakpoint name (xs, sm, md, lg).
   * @param {string} [delimiter] Responsive suffix delimiter.
   * @return {?string} The attribute or null if it doesn't exist.
   */
  _getAttribute(name, delimiter = ResponsiveAttributes.BREAKPOINT_DELIMITER) {
    return this.element.getAttribute(`data-${this.attr}${delimiter}${name}`);
  }

  /**
   * Determine the current value in an object by its breakpoint key.
   * @param {{xs, sm, md, lg}} values An object with breakpoint keys.
   * @return {?string}
   */
  getCurrentBreakpointValue(values) {
    return values[OdoBaseComponent.getCurrentBreakpoint()];
  }

  /**
   * Cleanup method.
   */
  dispose() {
    this.element = null;
  }
}

ResponsiveAttributes.BREAKPOINT_DELIMITER = '.';

export default ResponsiveAttributes;
