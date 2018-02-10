(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-responsive-attributes'), require('@odopod/odo-base-component')) :
	typeof define === 'function' && define.amd ? define(['@odopod/odo-responsive-attributes', '@odopod/odo-base-component'], factory) :
	(global.OdoResponsiveClasses = factory(global.OdoResponsiveAttributes,global.OdoBaseComponent));
}(this, (function (OdoResponsiveAttributes,OdoBaseComponent) { 'use strict';

OdoResponsiveAttributes = OdoResponsiveAttributes && OdoResponsiveAttributes.hasOwnProperty('default') ? OdoResponsiveAttributes['default'] : OdoResponsiveAttributes;
OdoBaseComponent = OdoBaseComponent && OdoBaseComponent.hasOwnProperty('default') ? OdoBaseComponent['default'] : OdoBaseComponent;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var ResponsiveClassesElement = function () {
  function ResponsiveClassesElement(element) {
    classCallCheck(this, ResponsiveClassesElement);

    /**
     * Main element.
     * @type {Element}
     */
    this.element = element;

    /**
     * Read responsive attributes on the main element.
     * e.g. `data-class.md="foo"`.
     * @type {OdoResponsiveAttributes}
     * @private
     */
    this._attributes = new OdoResponsiveAttributes(element, 'class');
  }

  /**
   * Add multiple classes to the main element.
   * @param {string[]} classesToAdd Classes to add.
   */


  ResponsiveClassesElement.prototype._addAllClasses = function _addAllClasses(classesToAdd) {
    var _element$classList;

    (_element$classList = this.element.classList).add.apply(_element$classList, toConsumableArray(classesToAdd));
  };

  /**
  * Remove multiple classes to the main element.
  * @param {string[]} classesToRemove Classes to add.
  */


  ResponsiveClassesElement.prototype._removeAllClasses = function _removeAllClasses(classesToRemove) {
    var _this = this;

    Object.keys(classesToRemove).forEach(function (breakpoint) {
      if (classesToRemove[breakpoint]) {
        var _element$classList2;

        (_element$classList2 = _this.element.classList).remove.apply(_element$classList2, toConsumableArray(classesToRemove[breakpoint].split(' ')));
      }
    });
  };

  /**
   * Split read and writing to and from the DOM into separate methods so that
   * reads can be batched together and writes can be batched together. This
   * avoids layout thrashing.
   */


  ResponsiveClassesElement.prototype.read = function read() {
    this._attributes.update();
  };

  /**
   * Update current classes on the element.
   */


  ResponsiveClassesElement.prototype.write = function write() {
    this._removeAllClasses(this._attributes.values);
    this._addAllClasses(this._attributes.currentValue.split(' '));
  };

  /**
   * Cleanup.
   */


  ResponsiveClassesElement.prototype.dispose = function dispose() {
    this._attributes.dispose();
    this.element = null;
  };

  return ResponsiveClassesElement;
}();

var ResponsiveClasses = function (_OdoBaseComponent) {
  inherits(ResponsiveClasses, _OdoBaseComponent);

  function ResponsiveClasses() {
    classCallCheck(this, ResponsiveClasses);

    var _this = possibleConstructorReturn(this, _OdoBaseComponent.call(this, document.body, true));

    _this.items = [];
    _this.initializeAll();
    return _this;
  }

  /**
   * When the browser matches a new media query, update.
   * @override
   */


  ResponsiveClasses.prototype.onMediaQueryChange = function onMediaQueryChange() {
    this.process();
  };

  /**
   * Dispose of class name switchers.
   * @param {ArrayLike.<Element>} elements Array of class name switcher elements.
   */


  ResponsiveClasses.prototype.removeAll = function removeAll(elements) {
    var _this2 = this;

    var els = Array.from(elements);
    var items = this.items.filter(function (item) {
      return els.indexOf(item.element) > -1;
    });

    items.forEach(function (item) {
      _this2.items.splice(_this2.items.indexOf(item), 1);
      item.dispose();
    });
  };

  /**
  * Create instances to track.
  * @param {ArrayLike.<Element>} elements
  */


  ResponsiveClasses.prototype.addAll = function addAll(elements) {
    var newItems = [];

    for (var i = 0, len = elements.length; i < len; i++) {
      newItems.push(new ResponsiveClassesElement(elements[i]));
    }

    // Merge new items into current items.
    this.items = this.items.concat(newItems);

    this.process();
  };

  /**
   * Initializes all ResponsiveClasses instances on the page or within the given
   * context.
   *
   * @param {Element} [context] Optionally provide the context (scope)
   *     for the query. Default is the body.
   */


  ResponsiveClasses.prototype.initializeAll = function initializeAll() {
    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;

    this.addAll(context.querySelectorAll('.odo-responsive-classes'));
  };

  /**
   * Dispose of all ResponsiveClassesElement instances from within a context.
   * @param {Element} context Scope for the query.
   */


  ResponsiveClasses.prototype.disposeAll = function disposeAll(context) {
    this.removeAll(context.querySelectorAll('.odo-responsive-classes'));
  };

  /**
   * By reading values from the DOM all at once, then writing to the DOM all at
   * once, layout thrashing is avoided, optimizing this code path.
   */


  ResponsiveClasses.prototype.process = function process() {
    this.items.forEach(function (item) {
      item.read();
    });

    this.items.forEach(function (item) {
      item.write();
    });
  };

  return ResponsiveClasses;
}(OdoBaseComponent);

var responsiveClasses = new ResponsiveClasses();

return responsiveClasses;

})));
//# sourceMappingURL=odo-responsive-classes.js.map
