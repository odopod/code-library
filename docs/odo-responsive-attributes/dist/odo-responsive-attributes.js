(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-base-component')) :
  typeof define === 'function' && define.amd ? define(['@odopod/odo-base-component'], factory) :
  (global.OdoResponsiveAttributes = factory(global.OdoBaseComponent));
}(this, (function (OdoBaseComponent) { 'use strict';

  OdoBaseComponent = OdoBaseComponent && OdoBaseComponent.hasOwnProperty('default') ? OdoBaseComponent['default'] : OdoBaseComponent;

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  /**
   * @fileoverview Parse data attributes with respect to their breakpoints.
   *
   * @author Glen Cheney <glen@odopod.com>
   */

  var ResponsiveAttributes = function () {
    /**
     * Create a new instance of the attribute parser.
     * @param {Element} element Element to read attributes from.
     * @param {string} [attributeName] Name of the data attribute.
     * @constructor
     */
    function ResponsiveAttributes(element) {
      var attributeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'responsive';
      classCallCheck(this, ResponsiveAttributes);

      this.element = element;
      this.attr = attributeName;
      this.values = this.parse();
      this.update();
    }

    /**
     * Update the current value for this breakpoint.
     * @return {ResponsiveAttributes} The instance for chaining.
     */


    ResponsiveAttributes.prototype.update = function update() {
      this.currentValue = this.getCurrentBreakpointValue(this.values);
      return this;
    };

    /**
     * Parse the repsonsive attributes.
     * @return {{xs: ?string, sm: ?string, md: ?string, lg: ?string}} An object
     *     containing values for each breakpoint, each of which could be null.
     */


    ResponsiveAttributes.prototype.parse = function parse() {
      var _this = this;

      var obj = {};
      var lastValue = null;
      var defaultValue = this._getAttribute('', '');

      OdoBaseComponent.BREAKPOINT_NAMES.forEach(function (name) {
        obj[name] = _this._getAttributeValue(name, defaultValue || lastValue);
        lastValue = obj[name];
      });

      return obj;
    };

    /**
     * Retrieve the attribute's value. If that value doesn't exist, return the
     * default value.
     * @param {string} name Breakpoint name (xs, sm, md, lg).
     * @param {?string} defaultValue Default value for the attribute.
     * @return {?string}
     */


    ResponsiveAttributes.prototype._getAttributeValue = function _getAttributeValue(name, defaultValue) {
      return this._getAttribute(name) || defaultValue;
    };

    /**
     * Read a responsive attribute.
     * @param {string} name Breakpoint name (xs, sm, md, lg).
     * @param {string} [delimiter] Responsive suffix delimiter.
     * @return {?string} The attribute or null if it doesn't exist.
     */


    ResponsiveAttributes.prototype._getAttribute = function _getAttribute(name) {
      var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ResponsiveAttributes.BREAKPOINT_DELIMITER;

      return this.element.getAttribute('data-' + this.attr + delimiter + name);
    };

    /**
     * Determine the current value in an object by its breakpoint key.
     * @param {{xs, sm, md, lg}} values An object with breakpoint keys.
     * @return {?string}
     */


    ResponsiveAttributes.prototype.getCurrentBreakpointValue = function getCurrentBreakpointValue(values) {
      return values[OdoBaseComponent.getCurrentBreakpoint()];
    };

    /**
     * Cleanup method.
     */


    ResponsiveAttributes.prototype.dispose = function dispose() {
      this.element = null;
    };

    return ResponsiveAttributes;
  }();

  ResponsiveAttributes.BREAKPOINT_DELIMITER = '.';

  return ResponsiveAttributes;

})));
//# sourceMappingURL=odo-responsive-attributes.js.map
