(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.OdoDevice = factory());
}(this, (function () { 'use strict';

  /**
   * Object Model prefixes.
   * @type {Array.<string>}
   * @private
   */
  var prefixes = ['Webkit', 'Moz', 'O', 'ms'];

  /**
   * Prefix lookup cache.
   * @type {Object}
   * @private
   */
  var prefixCache = {};

  function isDefined(thing) {
    return typeof thing !== 'undefined';
  }

  function getCacheName(property, value, isValueDefined) {
    if (isValueDefined) {
      return property + value;
    }

    return property;
  }

  var element = document.createElement('div');

  /**
   * Returns the prefixed style property if it exists.
   * {@link http://perfectionkills.com/feature-testing-css-properties/}
   *
   * @param {string} property The property name.
   * @param {string} [value] Value to set and test. If undefined, this test will
   *     only check that the property exists, not whether it supports the value.
   * @return {string|false} The style property or false.
   */
  function prefixed(property, value) {
    var shouldTestValue = isDefined(value);
    var cacheName = getCacheName(property, value, shouldTestValue);

    // Check cache.
    if (isDefined(prefixCache[cacheName])) {
      return prefixCache[cacheName];
    }

    var ucProp = property.charAt(0).toUpperCase() + property.slice(1);

    // Create an array of prefixed properties. ['transform', 'WebkitTransform'].
    var props = (property + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
    var style = element.style;


    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      var before = style[prop];

      // Check the existence of the property.
      if (isDefined(before)) {
        // Test if the value sticks after setting it.
        if (shouldTestValue) {
          style[prop] = value;

          // If the property value has changed, assume the value used is supported.
          if (style[prop] !== before) {
            prefixCache[cacheName] = prop;
            return prop;
          }
        } else {
          prefixCache[cacheName] = prop;
          return prop;
        }
      }
    }

    prefixCache[cacheName] = false;
    return false;
  }

  /**
   * Hyphenates a javascript style string to a css one. For example:
   * MozBoxSizing -> -moz-box-sizing.
   *
   * @param {string|false} str The string to hyphenate.
   * @return {string} The hyphenated string.
   */
  function hyphenate(str) {
    // Catch booleans.
    if (!str) {
      return '';
    }

    // Turn MozBoxSizing into -moz-box-sizing.
    return str.replace(/([A-Z])/g, function (str, m1) {
      return '-' + m1.toLowerCase();
    }).replace(/^ms-/, '-ms-');
  }

  /**
   * Prefixed style properties.
   * @type {{[key: string]: string|false}}
   */
  var Dom = {
    ANIMATION: prefixed('animation'),
    ANIMATION_DURATION: prefixed('animationDuration'),
    TRANSFORM: prefixed('transform'),
    TRANSITION: prefixed('transition'),
    TRANSITION_PROPERTY: prefixed('transitionProperty'),
    TRANSITION_DURATION: prefixed('transitionDuration'),
    TRANSITION_TIMING_FUNCTION: prefixed('transitionTimingFunction'),
    TRANSITION_DELAY: prefixed('transitionDelay')
  };

  /**
   * Prefixed css properties.
   * @type {{[key: string]: string}}
   */
  var Css = {
    ANIMATION: hyphenate(Dom.ANIMATION),
    ANIMATION_DURATION: hyphenate(Dom.ANIMATION_DURATION),
    TRANSFORM: hyphenate(Dom.TRANSFORM),
    TRANSITION: hyphenate(Dom.TRANSITION),
    TRANSITION_PROPERTY: hyphenate(Dom.TRANSITION_PROPERTY),
    TRANSITION_DURATION: hyphenate(Dom.TRANSITION_DURATION),
    TRANSITION_TIMING_FUNCTION: hyphenate(Dom.TRANSITION_TIMING_FUNCTION),
    TRANSITION_DELAY: hyphenate(Dom.TRANSITION_DELAY)
  };

  /**
   * Whether the browser has css transitions.
   * @type {boolean}
   */
  var HAS_TRANSITIONS = Dom.TRANSITION !== false;

  /**
   * Whether the browser has css animations.
   * @type {boolean}
   */
  var HAS_CSS_ANIMATIONS = Dom.ANIMATION !== false;

  /**
   * Whether the browser has css transitions.
   * @type {boolean}
   */
  var HAS_TRANSFORMS = Dom.TRANSFORM !== false;

  /**
   * The browser can use css transitions and transforms.
   * @type {boolean}
   */
  var CAN_TRANSITION_TRANSFORMS = HAS_TRANSITIONS && HAS_TRANSFORMS;

  /* istanbul ignore next */
  /**
   * Whether the browser supports touch events.
   * @type {boolean}
   */
  var HAS_TOUCH_EVENTS = 'ontouchstart' in window || !!window.DocumentTouch && document instanceof window.DocumentTouch;

  /**
   * Whether the browser supports pointer events.
   * @type {boolean}
   */
  var HAS_POINTER_EVENTS = !!window.PointerEvent;

  /**
   * Whether the browser supports `localStorage`. Safari in private browsing
   * throws an error when calling `setItem`.
   * @type {boolean}
   */
  var HAS_LOCAL_STORAGE = function () {
    try {
      var testKey = 'test';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      /* istanbul ignore next */
      return false;
    }
  }();

  var HAS_PASSIVE_LISTENERS = function () {
    var supportsPassiveOption = false;
    try {
      var options = {
        get passive /* istanbul ignore next */() {
          // eslint-disable-line getter-return
          supportsPassiveOption = true;
        }
      };

      window.addEventListener('test', null, options);
      return supportsPassiveOption;
    } catch (e) {
      /* istanbul ignore next */
      return false;
    }
  }();

  // Export everything as an object otherwise other components are unable to stub
  // properties because webpack writes them as getters and non-configurable.
  var device = {
    prefixed: prefixed,
    hyphenate: hyphenate,
    Dom: Dom,
    Css: Css,
    HAS_TRANSITIONS: HAS_TRANSITIONS,
    HAS_CSS_ANIMATIONS: HAS_CSS_ANIMATIONS,
    HAS_TRANSFORMS: HAS_TRANSFORMS,
    CAN_TRANSITION_TRANSFORMS: CAN_TRANSITION_TRANSFORMS,
    HAS_TOUCH_EVENTS: HAS_TOUCH_EVENTS,
    HAS_POINTER_EVENTS: HAS_POINTER_EVENTS,
    HAS_LOCAL_STORAGE: HAS_LOCAL_STORAGE,
    HAS_PASSIVE_LISTENERS: HAS_PASSIVE_LISTENERS
  };

  return device;

})));
//# sourceMappingURL=odo-device.js.map
