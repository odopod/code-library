/**
 * Object Model prefixes.
 * @type {Array.<string>}
 * @private
 */
const prefixes = [
  'Webkit',
  'Moz',
  'O',
  'ms',
];

/**
 * Prefix lookup cache.
 * @type {Object}
 * @private
 */
const prefixCache = {};

function isDefined(thing) {
  return typeof thing !== 'undefined';
}

function getCacheName(property, value, isValueDefined) {
  if (isValueDefined) {
    return property + value;
  }

  return property;
}

const element = document.createElement('div');

/**
 * Returns the prefixed style property if it exists.
 * {@link http://perfectionkills.com/feature-testing-css-properties/}
 *
 * @param {string} propName The property name.
 * @param {string} [value] Value to set and test. If undefined, this test will
 *     only check that the property exists, not whether it supports the value.
 * @return {string|boolean} The style property or false.
 */
function prefixed(property, value) {
  const shouldTestValue = isDefined(value);
  const cacheName = getCacheName(property, value, shouldTestValue);

  // Check cache.
  if (isDefined(prefixCache[cacheName])) {
    return prefixCache[cacheName];
  }

  const ucProp = property.charAt(0).toUpperCase() + property.slice(1);

  // Create an array of prefixed properties. ['transform', 'WebkitTransform'].
  const props = (`${property} ${prefixes.join(ucProp + ' ')}${ucProp}`).split(' ');
  const style = element.style;

  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const before = style[prop];

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
 * @param {string|boolean} str The string to hyphenate.
 * @return {string} The hyphenated string.
 */
function hyphenate(str) {
  // Catch booleans.
  if (!str) {
    return '';
  }

  // Turn MozBoxSizing into -moz-box-sizing.
  return str.replace(/([A-Z])/g, (str, m1) => `-${m1.toLowerCase()}`).replace(/^ms-/, '-ms-');
}

/**
 * Prefixed style properties.
 * @enum {string|boolean}
 */
const Dom = {
  ANIMATION: prefixed('animation'),
  ANIMATION_DURATION: prefixed('animationDuration'),
  TRANSFORM: prefixed('transform'),
  TRANSITION: prefixed('transition'),
  TRANSITION_PROPERTY: prefixed('transitionProperty'),
  TRANSITION_DURATION: prefixed('transitionDuration'),
  TRANSITION_TIMING_FUNCTION: prefixed('transitionTimingFunction'),
  TRANSITION_DELAY: prefixed('transitionDelay'),
};

/**
 * Prefixed css properties.
 * @enum {string}
 */
const Css = {
  ANIMATION: hyphenate(Dom.ANIMATION),
  ANIMATION_DURATION: hyphenate(Dom.ANIMATION_DURATION),
  TRANSFORM: hyphenate(Dom.TRANSFORM),
  TRANSITION: hyphenate(Dom.TRANSITION),
  TRANSITION_PROPERTY: hyphenate(Dom.TRANSITION_PROPERTY),
  TRANSITION_DURATION: hyphenate(Dom.TRANSITION_DURATION),
  TRANSITION_TIMING_FUNCTION: hyphenate(Dom.TRANSITION_TIMING_FUNCTION),
  TRANSITION_DELAY: hyphenate(Dom.TRANSITION_DELAY),
};

/**
 * Whether the browser has css transitions.
 * @type {boolean}
 */
const HAS_TRANSITIONS = Dom.TRANSITION !== false;

/**
 * Whether the browser has css animations.
 * @type {boolean}
 */
const HAS_CSS_ANIMATIONS = Dom.ANIMATION !== false;

/**
 * Whether the browser has css transitions.
 * @type {boolean}
 */
const HAS_TRANSFORMS = Dom.TRANSFORM !== false;

/**
 * The browser can use css transitions and transforms.
 * @type {boolean}
 */
const CAN_TRANSITION_TRANSFORMS = HAS_TRANSITIONS && HAS_TRANSFORMS;

/* istanbul ignore next */
/**
 * Whether the browser supports touch events.
 * @type {boolean}
 */
const HAS_TOUCH_EVENTS = 'ontouchstart' in window ||
  !!window.DocumentTouch && document instanceof window.DocumentTouch;

/**
 * Whether the browser supports pointer events.
 * @type {boolean}
 */
const HAS_POINTER_EVENTS = !!window.PointerEvent;

/**
 * Whether the browser supports `localStorage`. Safari in private browsing
 * throws an error when calling `setItem`.
 * @type {boolean}
 */
const HAS_LOCAL_STORAGE = (() => {
  try {
    const testKey = 'test';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    /* istanbul ignore next */
    return false;
  }
})();

// Export everything as an object otherwise other components are unable to stub
// properties because webpack writes them as getters and non-configurable.
export default {
  prefixed,
  hyphenate,
  Dom,
  Css,
  HAS_TRANSITIONS,
  HAS_CSS_ANIMATIONS,
  HAS_TRANSFORMS,
  CAN_TRANSITION_TRANSFORMS,
  HAS_TOUCH_EVENTS,
  HAS_POINTER_EVENTS,
  HAS_LOCAL_STORAGE,
};
