(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('tiny-emitter')) :
  typeof define === 'function' && define.amd ? define(['tiny-emitter'], factory) :
  (global.OdoBaseComponent = factory(global.TinyEmitter));
}(this, (function (TinyEmitter) { 'use strict';

  TinyEmitter = TinyEmitter && TinyEmitter.hasOwnProperty('default') ? TinyEmitter['default'] : TinyEmitter;

  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing. The function also has a property 'clear' 
   * that is a function which will clear the timer to prevent previously scheduled executions. 
   *
   * @source underscore.js
   * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
   * @param {Function} function to wrap
   * @param {Number} timeout in ms (`100`)
   * @param {Boolean} whether to execute at the beginning (`false`)
   * @api public
   */

  var debounce = function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    if (null == wait) wait = 100;

    function later() {
      var last = Date.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    }
    var debounced = function debounced() {
      context = this;
      args = arguments;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };

    debounced.clear = function () {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    return debounced;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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

  /**
   * A class to be inherited from for components which interact with the DOM.
   * @extends {TinyEmitter}
   */

  var BaseComponent = function (_TinyEmitter) {
    inherits(BaseComponent, _TinyEmitter);

    /**
     * Create a new base component.
     * @param {Element} element Main element which represents this class.
     * @param {boolean} [addMediaListeners=false] Whether or not to add media
     *     query listeners to allow this component to react to media changes.
     * @throws {TypeError} Throws when the element is not defined.
     */
    function BaseComponent(element) {
      var addMediaListeners = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      classCallCheck(this, BaseComponent);

      var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

      if (!element) {
        throw new TypeError(_this.constructor.name + '\'s "element" in the constructor must be element. Got: "' + element + '".');
      }

      /**
       * Main element for this class.
       * @type {Element}
       */
      _this.element = element;

      if (addMediaListeners && BaseComponent.hasMediaQueries) {
        _this._registerMediaQueryListeners();
      }
      return _this;
    }

    /**
     * Determine the context for queries to the DOM.
     * @param {Element} [context=this.element] Optional element to search within.
     * @return {!Element}
     * @private
     */


    BaseComponent.prototype._getContext = function _getContext() {
      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.element;

      return context;
    };

    /**
     * Retrieve an element by class name within the main element for this class.
     * @param {string} klass Name of the class to search for.
     * @param {Element} [context] Element to search within. Defaults to main element.
     * @return {?Element} The first element which matches the class name, or null.
     */


    BaseComponent.prototype.getElementByClass = function getElementByClass(klass, context) {
      return this._getContext(context).getElementsByClassName(klass)[0] || null;
    };

    /**
     * Retrieve elements by class name within the main element for this class.
     * @param {string} klass Name of the class to search for.
     * @param {Element} [context] Element to search within. Defaults to main element.
     * @return {Element[]} An array of elements matching the class name.
     */


    BaseComponent.prototype.getElementsByClass = function getElementsByClass(klass, context) {
      return Array.from(this._getContext(context).getElementsByClassName(klass));
    };

    /**
     * Retrieve elements by selector within the main element for this class.
     * @param {string} selector Selector to search for.
     * @param {Element} [context] Element to search within. Defaults to main element.
     * @return {Element[]} An array of elements matching the selector.
     */


    BaseComponent.prototype.getElementsBySelector = function getElementsBySelector(selector, context) {
      return Array.from(this._getContext(context).querySelectorAll(selector));
    };

    /**
     * Alias for the static getter `breakpoint`.
     * @return {Object}
     */


    /**
     * Override this method to respond to media query changes.
     */
    BaseComponent.prototype.onMediaQueryChange = function onMediaQueryChange() {};

    /**
     * Clean up element references and event listeners.
     */


    BaseComponent.prototype.dispose = function dispose() {
      var _this2 = this;

      this.element = null;

      if (this._onMediaChange) {
        Object.keys(BaseComponent.queries).forEach(function (k) {
          BaseComponent.queries[k].removeListener(_this2._onMediaChange);
        });

        this._onMediaChange = null;
      }
    };

    BaseComponent.prototype._registerMediaQueryListeners = function _registerMediaQueryListeners() {
      var _this3 = this;

      this._onMediaChange = debounce(this.onMediaQueryChange.bind(this), 50);
      Object.keys(BaseComponent.queries).forEach(function (k) {
        BaseComponent.queries[k].addListener(_this3._onMediaChange);
      });
    };

    /**
     * Returns an object with `matches` and `current`. This is an alias for
     * `BaseComponent.matches` and `BaseComponent.getCurrentBreakpoint()`.
     * @return {!Object}
     * @static
     */


    /**
     * Query the media query list to see if it currently matches.
     * @param {string} key Breakpoint key to see if it matches.
     * @return {boolean} Whether the given key is the current breakpoint.
     * @throws {Error} Will throw an error if the key is not recognized.
     * @static
     */
    BaseComponent.matches = function matches(key) {
      if (BaseComponent.queries[key]) {
        return BaseComponent.queries[key].matches;
      }

      throw new Error('Unrecognized breakpoint key: "' + key + '"');
    };

    /**
     * Loop through the 4 media query lists to determine which one currently
     * matches. Returns the key which matches or `null` if none match.
     * @return {?string}
     * @static
     */


    BaseComponent.getCurrentBreakpoint = function getCurrentBreakpoint() {
      var key = Object.keys(BaseComponent.queries).find(function (k) {
        return BaseComponent.queries[k].matches;
      });

      return key || null;
    };

    /**
     * Create a new media queries object with keys for each breakpoint.
     * @param {number[]} bps Array of breakpoints.
     * @return {!Object}
     * @private
     * @static
     */


    BaseComponent._getQueries = function _getQueries(bps) {
      return {
        xs: matchMedia('(max-width:' + (bps[0] - 1) + 'px)'),
        sm: matchMedia('(min-width:' + bps[0] + 'px) and (max-width:' + (bps[1] - 1) + 'px)'),
        md: matchMedia('(min-width:' + bps[1] + 'px) and (max-width:' + (bps[2] - 1) + 'px)'),
        lg: matchMedia('(min-width:' + bps[2] + 'px)')
      };
    };

    /**
     * Allows you to redefine the default breakpoints. If you want to redefine
     * breakpoints, make sure you call this method before initializing classes
     * which inherit from BaseComponent.
     * @param {number[]} breakpoints An array of 3 numbers.
     * @static
     */


    BaseComponent.defineBreakpoints = function defineBreakpoints(breakpoints) {
      BaseComponent.BREAKPOINTS = breakpoints;
      BaseComponent.queries = BaseComponent._getQueries(breakpoints);
    };

    createClass(BaseComponent, [{
      key: 'breakpoint',
      get: function get$$1() {
        return BaseComponent.breakpoint;
      }
    }], [{
      key: 'breakpoint',
      get: function get$$1() {
        return {
          matches: BaseComponent.matches,
          get current() {
            return BaseComponent.getCurrentBreakpoint();
          }
        };
      }
    }]);
    return BaseComponent;
  }(TinyEmitter);

  // Define breakpoints commonly used on Odopod projects.


  BaseComponent.defineBreakpoints([768, 1024, 1392]);

  /**
   * Array of breakpoint key names.
   * @type {string[]}
   */
  BaseComponent.BREAKPOINT_NAMES = Object.keys(BaseComponent.queries);

  /**
   * Support: IE9
   * Whether the browser has `addListener` on `MediaQueryList` instances.
   * @type {boolean}
   */
  BaseComponent.hasMediaQueries = typeof BaseComponent.queries.xs.addListener === 'function';

  return BaseComponent;

})));
//# sourceMappingURL=odo-base-component.js.map
