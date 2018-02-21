// Type definitions for OdoDevice
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

export as namespace OdoDevice;

export = OdoDevice;

declare namespace OdoDevice {

  function prefixed(property: string, value?: string): string|false;

  function hyphenate(str: string|false): string;

  /**
   * Prefixed style properties.
   */
  const Dom: {
    ANIMATION: string|false,
    ANIMATION_DURATION: string|false,
    TRANSFORM: string|false,
    TRANSITION: string|false,
    TRANSITION_PROPERTY: string|false,
    TRANSITION_DURATION: string|false,
    TRANSITION_TIMING_FUNCTION: string|false,
    TRANSITION_DELAY: string|false,
  };

  /**
   * Prefixed css properties.
   */
  const Css: {
    ANIMATION: string,
    ANIMATION_DURATION: string,
    TRANSFORM: string,
    TRANSITION: string,
    TRANSITION_PROPERTY: string,
    TRANSITION_DURATION: string,
    TRANSITION_TIMING_FUNCTION: string,
    TRANSITION_DELAY: string,
  };

  /**
   * Whether the browser has css transitions.
   * @type {boolean}
   */
  const HAS_TRANSITIONS: boolean;

  /**
   * Whether the browser has css animations.
   * @type {boolean}
   */
  const HAS_CSS_ANIMATIONS: boolean;

  /**
   * Whether the browser has css transitions.
   * @type {boolean}
   */
  const HAS_TRANSFORMS: boolean;

  /**
   * The browser can use css transitions and transforms.
   * @type {boolean}
   */
  const CAN_TRANSITION_TRANSFORMS: boolean;

  /**
   * Whether the browser supports touch events.
   * @type {boolean}
   */
  const HAS_TOUCH_EVENTS: boolean;

  /**
   * Whether the browser supports pointer events.
   * @type {boolean}
   */
  const HAS_POINTER_EVENTS: boolean;

  /**
   * Whether the browser supports `localStorage`. Safari in private browsing
   * throws an error when calling `setItem`.
   * @type {boolean}
   */
  const HAS_LOCAL_STORAGE: boolean;
}
