(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@odopod/odo-device')) :
  typeof define === 'function' && define.amd ? define(['exports', '@odopod/odo-device'], factory) :
  (factory((global.OdoHelpers = {}),global.OdoDevice));
}(this, (function (exports,OdoDevice) { 'use strict';

  OdoDevice = OdoDevice && OdoDevice.hasOwnProperty('default') ? OdoDevice['default'] : OdoDevice;

  /**
   * @param {*} value Anything.
   * @return {boolean}
   */
  function isDefined(value) {
    return value !== undefined && value !== null;
  }

  var transitions = {};
  var transitionId = 0;

  /**
   * Store a pending transition.
   * @param {HTMLElement} element Element which has the transitionend listener.
   * @param {number} timerId Timer id from setTimeout to cancel the transition.
   * @param {(evt: TransitionEvent) => void} listener Callback.
   * @return {number} Transition id.
   */
  function saveTransition(element, timerId, listener) {
    transitionId += 1;
    transitions[transitionId] = {
      element: element,
      timerId: timerId,
      listener: listener
    };
    return transitionId;
  }

  /**
   * Remove a transition id from the stored list.
   * @param {number} transitionId Transition id to remove.
   */
  function clearTransition(transitionId) {
    delete transitions[transitionId];
  }

  /**
   * Retrieve a transition object.
   * @param {number} transitionId Transition id to retrieve.
   * @return {{element: HTMLElement, timerId: number, listener: (evt: TransitionEvent) => void}}
   *   Transition object.
   */
  function getTransition(transitionId) {
    return transitions[transitionId];
  }

  /**
   * Retrieve all transition objects.
   * @return {object}
   */
  function getTransitions() {
    return transitions;
  }

  /**
   * Returns the element when the first parameter is a jQuery collection.
   * @param {HTMLElement|jQuery} elem An element or a jQuery collection.
   * @return {HTMLElement}
   * @throws {Error} If it's a jQuery collection of more than one element.
   */
  function getElement(elem) {
    if (elem.jquery) {
      if (elem.length > 1) {
        throw new TypeError('This method only supports transition end for one element, not a collection');
      }

      return elem[0];
    }

    return elem;
  }

  function isOwnEvent(event) {
    return event.target === event.currentTarget;
  }

  function isSameTransitionProperty(event, prop) {
    return event.fake || !isDefined(prop) || event.propertyName === prop;
  }

  function getFakeEvent(elem) {
    return {
      target: elem,
      currentTarget: elem,
      fake: true
    };
  }

  var Classes = {
    FADE: 'fade',
    IN: 'in',
    INVISIBLE: 'invisible'
  };

  function noop() {}

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

  /**
   * @fileoverview A simple class for providing a stepping function for each
   * animation frame over a given length of time. Uses requestAnimationFrame
   * where available. Its API is similar to the AnimationPlayer in `Element.animate`.
   *
   * Assumes `requestAnimationFrame`, `Function.prototype.bind`, and `Object.assign`
   * are available.
   *
   * @author Glen Cheney <glen@odopod.com>
   */

  var Stepper = function () {
    /**
     * Easy animation stepper.
     *
     * @param {Object} [options] Options object.
     * @param {number} [options.start] Starting number. Value to animate from.
     * @param {number} [options.end] Ending number. Value to animate to.
     * @param {function(number, number):void} [options.step] Step function which
     *     will receive the step value and the current percentage completed.
     * @param {number} [options.duration] Length of the animation. Default is 250ms.
     * @param {Object} [options.context] The object scope to invoke the function in.
     * @param {function(number):number} [options.easing] Easing function to apply.
     * @constructor
     */
    function Stepper(options) {
      classCallCheck(this, Stepper);

      this.options = Object.assign({}, Stepper.Defaults, options);

      /**
       * The percentage value which the scrubber and reveals will be animated to.
       * @type {number}
       * @private
       */
      this._animationAmount = this.options.end - this.options.start;

      /**
       * Time when the animation timer started.
       * @type {number}
       * @private
       */
      this._animationStart = +new Date();

      this._handler = this._animateLoop.bind(this);

      /**
       * Called at the end of the animation with `options.context`.
       * @type {function:void}
       */
      this.onfinish = noop;

      // Start loop.
      this._requestId = requestAnimationFrame(this._handler);
    }

    /**
     * Internal loop ticker.
     * @private
     */


    Stepper.prototype._animateLoop = function _animateLoop() {
      var now = new Date().getTime();
      var remainingTime = this._animationStart + this.options.duration - now;

      // Even when duration is zero, this will result in Infinity, which will only
      // call the step method once then onfinish, which is desired.
      var percent = 1 - remainingTime / this.options.duration;

      // Abort if already at or past 100%.
      if (percent >= 1) {
        // Make sure it always finishes with 1.
        this.options.step.call(this.options.context, this.options.end, 1);
        this.onfinish.call(this.options.context);
        this.dispose();
        return;
      }

      // Apply easing.
      percent = this.options.easing(percent);

      // Request animation frame.
      this._requestId = requestAnimationFrame(this._handler);

      // Tick.
      this.options.step.call(this.options.context, this.options.start + this._animationAmount * percent, percent);
    };

    /**
     * Stop the animation and dispose of it.
     */


    Stepper.prototype.cancel = function cancel() {
      cancelAnimationFrame(this._requestId);
      this.dispose();
    };

    /**
     * Destroy the animation instance.
     */


    Stepper.prototype.dispose = function dispose() {
      this._handler = null;
      this.options.context = null;
    };

    return Stepper;
  }();

  Stepper.Defaults = {
    start: 0,
    end: 1,
    duration: 250,
    step: noop,
    context: window,
    easing: function easing(k) {
      return -0.5 * (Math.cos(Math.PI * k) - 1);
    }
  };

  var Box =
  /**
   * Class for representing a box. A box is specified as a top, right, bottom,
   * and left. A box is useful for representing margins and padding.
   * @param {number} top Top.
   * @param {number} right Right.
   * @param {number} bottom Bottom.
   * @param {number} left Left.
   * @constructor
   */
  function Box(top, right, bottom, left) {
    classCallCheck(this, Box);

    /**
     * Top
     * @type {number}
     */
    this.top = top;

    /**
     * Right
     * @type {number}
     */
    this.right = right;

    /**
     * Bottom
     * @type {number}
     */
    this.bottom = bottom;

    /**
     * Left
     * @type {number}
     */
    this.left = left;
  };

  /**
   * Returns the prefixed or unprefixed pointer event name or null if not pointer events.
   * @param {string} event The event name. e.g. "pointerdown".
   * @return {?string} The event name or null.
   */
  function getPointerEvent(event) {
    /* istanbul ignore else */
    if (OdoDevice.HAS_POINTER_EVENTS) {
      return event;
    }

    /* istanbul ignore next */
    return null;
  }

  /**
   * Returns a normalized transition end event name.
   *
   * Issue with Modernizr prefixing related to stock Android 4.1.2
   * That version of Android has both unprefixed and prefixed transitions
   * built in, but will only listen to the prefixed on in certain cases
   * https://github.com/Modernizr/Modernizr/issues/897
   *
   * @return {string} A patched transition end event name.
   */
  function getTransitionEndEvent() {
    var div = document.createElement('div');
    div.style.transitionProperty = 'width';

    // Test the value which was just set. If it wasn't able to be set,
    // then it shouldn't use unprefixed transitions.
    /* istanbul ignore next */
    if (div.style.transitionProperty !== 'width' && 'webkitTransition' in div.style) {
      return 'webkitTransitionEnd';
    }

    return {
      // Saf < 7, Android Browser < 4.4
      WebkitTransition: 'webkitTransitionEnd',
      transition: 'transitionend'
    }[OdoDevice.Dom.TRANSITION];
  }

  /**
   * Returns a normalized animation end event name.
   * @return {string}
   */
  function getAnimationEndEvent() {
    return {
      WebkitAnimation: 'webkitAnimationEnd',
      animation: 'animationend'
    }[OdoDevice.Dom.ANIMATION];
  }

  var events = {
    // Mouse events
    CLICK: 'click',
    DBLCLICK: 'dblclick',
    MOUSEDOWN: 'mousedown',
    MOUSEUP: 'mouseup',
    MOUSEOVER: 'mouseover',
    MOUSEOUT: 'mouseout',
    MOUSEMOVE: 'mousemove',

    // IE, Safari, Chrome
    SELECTSTART: 'selectstart',

    // Key events
    KEYPRESS: 'keypress',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',

    // Focus
    BLUR: 'blur',
    FOCUS: 'focus',

    // IE only
    DEACTIVATE: 'deactivate',

    FOCUSIN: 'focusin',
    FOCUSOUT: 'focusout',

    // Forms
    CHANGE: 'change',
    SELECT: 'select',
    SUBMIT: 'submit',
    INPUT: 'input',

    // IE only
    PROPERTYCHANGE: 'propertychange',

    // Drag and drop
    DRAGSTART: 'dragstart',
    DRAG: 'drag',
    DRAGENTER: 'dragenter',
    DRAGOVER: 'dragover',
    DRAGLEAVE: 'dragleave',
    DROP: 'drop',
    DRAGEND: 'dragend',

    // WebKit touch events.
    TOUCHSTART: 'touchstart',
    TOUCHMOVE: 'touchmove',
    TOUCHEND: 'touchend',
    TOUCHCANCEL: 'touchcancel',

    // Misc
    BEFOREUNLOAD: 'beforeunload',
    CONTEXTMENU: 'contextmenu',
    ERROR: 'error',
    HELP: 'help',
    LOAD: 'load',
    LOSECAPTURE: 'losecapture',
    READYSTATECHANGE: 'readystatechange',
    RESIZE: 'resize',
    SCROLL: 'scroll',
    UNLOAD: 'unload',

    // HTML 5 History events
    // See http://www.w3.org/TR/html5/history.html#event-definitions
    HASHCHANGE: 'hashchange',
    PAGEHIDE: 'pagehide',
    PAGESHOW: 'pageshow',
    POPSTATE: 'popstate',

    // Copy and Paste
    // Support is limited. Make sure it works on your favorite browser
    // before using.
    // http://www.quirksmode.org/dom/events/cutcopypaste.html
    COPY: 'copy',
    PASTE: 'paste',
    CUT: 'cut',
    BEFORECOPY: 'beforecopy',
    BEFORECUT: 'beforecut',
    BEFOREPASTE: 'beforepaste',

    // HTML5 online/offline events.
    // http://www.w3.org/TR/offline-webapps/#related
    ONLINE: 'online',
    OFFLINE: 'offline',

    // HTML 5 worker events
    MESSAGE: 'message',
    CONNECT: 'connect',

    // Css transition events.
    TRANSITIONEND: getTransitionEndEvent(),

    ANIMATIONEND: getAnimationEndEvent(),

    // Pointer events
    POINTERCANCEL: getPointerEvent('pointercancel'),
    POINTERDOWN: getPointerEvent('pointerdown'),
    POINTERMOVE: getPointerEvent('pointermove'),
    POINTEROVER: getPointerEvent('pointerover'),
    POINTEROUT: getPointerEvent('pointerout'),
    POINTERUP: getPointerEvent('pointerup')
  };

  /**
   * Remove the event listener for `transitionend`.
   * @param {number} id The number returned by `onTransitionEnd`.
   * @return {boolean} Whether the transition was canceled or not. If the transition
   *     already finished, this method will return false.
   */
  function cancelTransitionEnd(id) {
    var obj = getTransition(id);

    if (obj) {
      clearTimeout(obj.timerId);

      if (OdoDevice.HAS_TRANSITIONS) {
        obj.element.removeEventListener(events.TRANSITIONEND, obj.listener);
      }

      clearTransition(id);
      return true;
    }
    return false;
  }

  /**
   * Capitalize a string.
   * @param {string} str String to capitalize.
   * @return {string} Capitalized string.
   */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Ask the browser for a property that will cause it to recalculate styles
   * and layout the element (and possibly surrounding/parent elements).
   * @param {HTMLElement} element Element to for a layout for.
   * @return {number} Width of the element. If you actually need the width of
   *     element, use the `style.getSize` method.
   */
  function causeLayout(element) {
    return element.offsetWidth;
  }

  /**
   * Make an array of smaller arrays from an array.
   * @param {Array.<*>} array An array to take chunks from.
   * @param {number} size The number of items per chunk.
   * @return {Array.<Array.<*>>}
   */
  function chunk(array, size) {
    if (!size) {
      return [];
    }

    var numArrays = Math.ceil(array.length / size);
    var chunked = new Array(numArrays);

    // eslint-disable-next-line no-plusplus
    for (var i = 0, index = 0; i < numArrays; index += size, i++) {
      chunked[i] = array.slice(index, index + size);
    }

    return chunked;
  }

  /**
   * Takes a number and clamps it to within the provided bounds.
   * @param {number} value The input number.
   * @param {number} min The minimum value to return.
   * @param {number} max The maximum value to return.
   * @return {number} The input number if it is within bounds, or the nearest
   *     number within the bounds.
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Given an array of numbers (`arr`), find the item in the array closest
   * to a given number (`num`).
   *
   * @param  {Array.<number>} arr An array of numbers.
   * @param  {number} num Close number to search from.
   * @return {?number} The closest number in the array.
   */
  function closest(arr, num) {
    var closest = null;

    arr.reduce(function (closestDiff, value) {
      var diff = Math.abs(value - num);
      if (diff < closestDiff) {
        closest = value;
        return diff;
      }

      return closestDiff;
    }, Infinity);

    return closest;
  }

  /**
   * Given an array of numbers (`arr`), find the item in the array closest
   * to a given number (`num`), while also greater than (`num`).
   *
   * @param  {Array.<number>} arr An array of numbers.
   * @param  {number} num Close number to search from.
   * @return {?number} The closest number in the array.
   */
  function closestGreaterThan(arr, num) {
    return closest(arr.filter(function (value) {
      return value > num;
    }), num);
  }

  /**
   * Given an array of numbers (`arr`), find the item in the array closest
   * to a given number (`num`), while also less than (`num`).
   *
   * @param  {Array.<number>} arr An array of numbers.
   * @param  {number} num Close number to search from.
   * @return {?number} The closest number in the array.
   */
  function closestLessThan(arr, num) {
    return closest(arr.filter(function (value) {
      return value < num;
    }), num);
  }

  var Coordinate = function () {
    /**
     * Class for representing coordinates and positions.
     * @param {number} [x=0] Left, defaults to 0.
     * @param {number} [y=0] Top, defaults to 0.
     * @constructor
     */
    function Coordinate() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      classCallCheck(this, Coordinate);

      /**
       * X-value
       * @type {number}
       */
      this.x = x;

      /**
       * Y-value
       * @type {number}
       */
      this.y = y;
    }

    /**
     * Returns a duplicate of this coordinate.
     * @return {Coordinate}
     */


    Coordinate.prototype.clone = function clone() {
      return new Coordinate(this.x, this.y);
    };

    /**
     * Scales this coordinate by the given scale factors. The x and y values are
     * scaled by {@code sx} and {@code optSy} respectively.  If {@code optSy}
     * is not given, then {@code sx} is used for both x and y.
     * @param {number} sx The scale factor to use for the x dimension.
     * @param {number=} optSy The scale factor to use for the y dimension.
     * @return {!Coordinate} This coordinate after scaling.
     */


    Coordinate.prototype.scale = function scale(sx) {
      var optSy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : sx;

      this.x *= sx;
      this.y *= optSy;
      return this;
    };

    /**
     * Translates this box by the given offsets. If a {@code Coordinate}
     * is given, then the x and y values are translated by the coordinate's x and y.
     * Otherwise, x and y are translated by {@code tx} and {@code opt_ty}
     * respectively.
     * @param {number|Coordinate} tx The value to translate x by or the
     *     the coordinate to translate this coordinate by.
     * @param {number} [ty] The value to translate y by.
     * @return {!Coordinate} This coordinate after translating.
     */


    Coordinate.prototype.translate = function translate(tx, ty) {
      if (tx instanceof Coordinate) {
        this.x += tx.x;
        this.y += tx.y;
      } else {
        this.x += tx;
        this.y += ty;
      }

      return this;
    };

    /**
     * Compares coordinates for equality.
     * @param {Coordinate} a A Coordinate.
     * @param {Coordinate} b A Coordinate.
     * @return {boolean} True iff the coordinates are equal, or if both are null.
     */


    Coordinate.equals = function equals(a, b) {
      if (a === b) {
        return true;
      }

      if (!a || !b) {
        return false;
      }

      return a.x === b.x && a.y === b.y;
    };

    /**
     * Returns the distance between two coordinates.
     * @param {!Coordinate} a A Coordinate.
     * @param {!Coordinate} b A Coordinate.
     * @return {number} The distance between {@code a} and {@code b}.
     */


    Coordinate.distance = function distance(a, b) {
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * Returns the difference between two coordinates as a new Coordinate.
     * @param {!Coordinate} a A Coordinate.
     * @param {!Coordinate} b A Coordinate.
     * @return {!Coordinate} A Coordinate representing the difference
     *     between {@code a} and {@code b}.
     */


    Coordinate.difference = function difference(a, b) {
      return new Coordinate(a.x - b.x, a.y - b.y);
    };

    /**
     * Returns the sum of two coordinates as a new Coordinate.
     * @param {!Coordinate} a A Coordinate.
     * @param {!Coordinate} b A Coordinate.
     * @return {!Coordinate} A Coordinate representing the sum of the two coordinates.
     */


    Coordinate.sum = function sum(a, b) {
      return new Coordinate(a.x + b.x, a.y + b.y);
    };

    /**
     * Returns the product of two coordinates as a new Coordinate.
     * @param {!Coordinate} a A Coordinate.
     * @param {!Coordinate} b A Coordinate.
     * @return {!Coordinate} A Coordinate representing the product of the two coordinates.
     */


    Coordinate.product = function product(a, b) {
      return new Coordinate(a.x * b.x, a.y * b.y);
    };

    /**
     * Returns the quotient of two coordinates as a new Coordinate.
     * @param {!Coordinate} a A Coordinate.
     * @param {!Coordinate} b A Coordinate.
     * @return {!Coordinate} A Coordinate representing the quotient of the two coordinates.
     */


    Coordinate.quotient = function quotient(a, b) {
      return new Coordinate(a.x / b.x, a.y / b.y);
    };

    /**
     * Scales this coordinate by the given scale factors. This does not affect the
     * properites of the coordinate parameter.
     * @param {!Coordinate} a A Coordinate.
     * @param {number} sx The scale factor to use for the x dimension.
     * @param {number=} optSy The scale factor to use for the y dimension.
     * @return {!Coordinate} This coordinate after scaling.
     */


    Coordinate.scale = function scale(a, sx) {
      var optSy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : sx;

      return new Coordinate(a.x * sx, a.y * optSy);
    };

    return Coordinate;
  }();

  /**
   * Fallback to a specified default if an input is undefined or null.
   * @param {*} obj The input to test.
   * @param {*} defaultValue The fallback if the input is undefined.
   * @param {boolean=} test If defined, `test` will be used to determine which
   *     value should be used.
   * @return {*} The sanitized output, either `obj` or `defaultValue`.
   */
  function defaultsTo(obj, defaultValue) {
    var test = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : isDefined(obj);

    return test ? obj : defaultValue;
  }

  /**
   * Returns a promise which resolves when the window load event is fired, or
   * one which resolves immediately if that has already happened.
   * @type {Promise<void>}
   */
  var domLoaded = new Promise(function (resolve) {
    /* istanbul ignore if */
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', function complete() {
        window.removeEventListener('load', complete);
        resolve();
      });
    }
  });

  /**
   * Returns a promise which resolves when the DOMContentLoaded event is fired, or
   * one which resolves immediately if that has already happened.
   * @type {Promise<void>}
   */
  var domReady = new Promise(function (resolve) {
    /* istanbul ignore if */
    if (document.readyState === 'interactive') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', function ready() {
        document.removeEventListener('DOMContentLoaded', ready);
        resolve();
      });
    }
  });

  /**
   * Determine which element in an array is the tallest.
   * @param {ArrayLike<HTMLElement>} elements Array-like of elements.
   * @return {number} Height of the tallest element.
   */
  function getTallest(elements) {
    var tallest = 0;

    for (var i = elements.length - 1; i >= 0; i--) {
      if (elements[i].offsetHeight > tallest) {
        tallest = elements[i].offsetHeight;
      }
    }

    return tallest;
  }

  /**
   * Set the height of every element in an array to a value.
   * @param {ArrayLike<HTMLElement>} elements Array-like of elements.
   * @param {string} height Height value to set.
   */
  function setAllHeights(elements, height) {
    for (var i = elements.length - 1; i >= 0; i--) {
      elements[i].style.height = height;
    }
  }

  /**
   * For groups of elements which should be the same height. Using this method
   * will create far less style recalculations and layouts.
   * @param {ArrayLike.<HTMLElement>|ArrayLike.<ArrayLike.<HTMLElement>>} groups An
   *     array-like collection of an array-like collection of elements.
   * @return {number|Array.<number>} An array containing the pixel value of the
   *     tallest element for each group, or just a number if it's one group.
   */
  function evenHeights(groups) {
    var list = Array.from(groups);

    // If the first item in the list is an element, then it needs to be wrapped
    // in an array so the rest of the methods will work.
    var isGroup = true;
    if (list[0] && list[0].nodeType) {
      isGroup = false;
      list = [list];
    }

    // First, reset the height for every element.
    // This is done first, otherwise we dirty the DOM on each loop!
    list.forEach(function (elements) {
      setAllHeights(elements, '');
    });

    // Now, measure heights in each group and save the tallest value. Instead of
    // setting the height value for the entire group, save it. If it were set,
    // the next iteration in the loop would have to recalculate styles in the DOM
    var tallests = list.map(function (elements) {
      return getTallest(elements);
    });

    // Lastly, set them all.
    list.forEach(function (elements, i) {
      setAllHeights(elements, tallests[i] + 'px');
    });

    if (isGroup) {
      return tallests;
    }
    return tallests[0];
  }

  function onTransitionEnd(elem, fn) {
    var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;
    var property = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var timeout = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    var element = getElement(elem);

    var callback = fn.bind(context);
    var timerId = void 0;

    /**
     * @param {TransitionEvent|{target: Element, currentTarget: Element}} evt Event object.
     */

    function transitionEnded(evt) {
      // Some other element's transition event could have bubbled up to this.
      // or
      // If the optional property exists and it's not the property which was
      // transitioned, exit out of the function and continue waiting for the
      // right transition property.
      if (!isOwnEvent(evt) || !isSameTransitionProperty(evt, property)) {
        return;
      }

      // Remove from active transitions.
      clearTransition(transitionId); // eslint-disable-line no-use-before-define

      // If the browser has transitions, there will be a listener bound to the
      // `transitionend` event which needs to be removed.
      if (OdoDevice.HAS_TRANSITIONS) {
        evt.currentTarget.removeEventListener(events.TRANSITIONEND, transitionEnded);
      }

      // Done!
      callback(evt);
      clearTimeout(timerId);
    }

    if (OdoDevice.HAS_TRANSITIONS) {
      element.addEventListener(events.TRANSITIONEND, transitionEnded);

      // Sometimes the transition end event doesn't fire, usually when
      // properties don't change or when iOS decides to just snap instead of
      // transition. To get around this, a timer is set which will trigger the
      // fake event.
      if (timeout) {
        timerId = setTimeout(function () {
          transitionEnded(getFakeEvent(element));
        }, timeout);
      }
    } else {
      // Push to the end of the queue with a fake event which will pass the checks
      // inside the callback function.
      timerId = setTimeout(function () {
        transitionEnded(getFakeEvent(element));
      }, 0);
    }

    // Save this active transition end listener so it can be canceled.
    var transitionId = saveTransition(element, timerId, transitionEnded);

    // Return id used to cancel the transition end listener, similar to setTimeout
    // and requestAnimationFrame.
    return transitionId;
  }

  /**
   * Fade out an element and then set visibilty hidden on it.
   * @param {Element} elem Element to fade.
   * @param {boolean} [isOut] Whether to fade out or in.
   * @param {Function} [fn=noop] Callback function when faded out.
   * @param {Window|HTMLElement} [context=window] Context for the callback.
   * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
   *     element once it has faded out. Defaults to false.
   * @return {number} id used to cancel the transition end listener.
   */
  function fadeElement(elem, isOut) {
    var fn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;
    var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : window;
    var invisible = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    var element = getElement(elem);

    // Bind the context to the callback here so that the context and function
    // references can be garbage collected and the only things left are `callback`
    // and `invisible`.
    var callback = fn.bind(context);

    // Make sure the transition will actually happen.
    // isIn and has `in` and `fade` classes or
    // isIn but doesn't have `fade` or
    // isOut and has `fade`, but doesn't have `in` class.
    var hasIn = element.classList.contains(Classes.IN);
    var hasFade = element.classList.contains(Classes.FADE);
    if (!isOut && hasIn && hasFade || !isOut && !hasFade || isOut && !hasIn && hasFade) {
      var fakeEvent = getFakeEvent(element);

      // This is expected to be async.
      setTimeout(function () {
        callback(fakeEvent);
      }, 0);

      return 0;
    }

    /**
     * Internal callback when the element has finished its transition.
     * @param {{target: Element, currentTarget: Element}} evt Event object.
     */
    function faded(evt) {
      // Element has faded out, add invisible class.
      if (isOut && invisible) {
        evt.currentTarget.classList.add(Classes.INVISIBLE);
      }

      callback(evt);
    }

    // Fading in, remove invisible class.
    if (!isOut && invisible) {
      elem.classList.remove(Classes.INVISIBLE);
    }

    // Make sure it has the "fade" class. It won't do anything if it already does.
    elem.classList.add(Classes.FADE);

    // Remove (or add) the "in" class which triggers the transition.
    // If the element had neither of these classes, adding the "fade" class
    // will trigger the transition.
    elem.classList.toggle(Classes.IN, !isOut);

    return onTransitionEnd(elem, faded, null, 'opacity');
  }

  /**
   * Fade in an element and optionally remove a class which sets visibility
   * to hidden.
   * @param {Element} elem Element to fade.
   * @param {Function} [fn=noop] Callback function when faded out.
   * @param {Window|HTMLElement} [context=window] Context for the callback.
   * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
   *     element once it has faded. Defaults to false.
   */
  function fadeInElement(elem, fn, context, invisible) {
    return fadeElement(elem, false, fn, context, invisible);
  }

  /**
   * Fade in an element and optionally add a class which sets visibility
   * to hidden.
   * @param {Element} elem Element to fade.
   * @param {Function} [fn=noop] Callback function when faded out.
   * @param {Window|HTMLElement} [context=window] Context for the callback.
   * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
   *     element once it has faded. Defaults to false.
   */
  function fadeOutElement(elem, fn, context, invisible) {
    return fadeElement(elem, true, fn, context, invisible);
  }

  /**
   * Force the page to be repainted.
   */
  function forceRedraw() {
    var tempStyleSheet = document.createElement('style');
    document.body.appendChild(tempStyleSheet);
    document.body.removeChild(tempStyleSheet);
  }

  /**
   * Gets the height and with of an element when the display is not none.
   * @param {HTMLElement} element Element to get size of.
   * @return {!{width: number, height: number}} Object with width/height.
   */
  function getSize(element) {
    return {
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  }

  /**
   * Parse string to return numerical value.
   * @param {string} value String of number
   * @return {number} Numerical value or 0 if parseFloat returns NaN
   */
  function getFloat(value) {
    return parseFloat(value) || 0;
  }

  function getBox(element, property) {
    var props = window.getComputedStyle(element, null);
    return new Box(getFloat(props[property + 'Top']), getFloat(props[property + 'Right']), getFloat(props[property + 'Bottom']), getFloat(props[property + 'Left']));
  }

  function getMarginBox(element) {
    return getBox(element, 'margin');
  }

  /**
   * Returns the size (width or height) of a list of elements, including margins.
   * @param {HTMLElement[]} elements An array of child elements (not a NodeList).
   * @param {string} dimension `'width'` or `'height'`.
   * @return {number}
   */
  function getElementsSize(elements, dimension) {
    return elements.reduce(function (memo, el) {
      var outerSize = getSize(el)[dimension];
      var margins = getMarginBox(el);
      var marginSize = dimension === 'height' ? margins.top + margins.bottom : margins.left + margins.right;

      return memo + outerSize + marginSize;
    }, 0);
  }

  /**
   * Detects the version of iOS operating system.
   * @param {string} userAgent The user agent string.
   * @return {number} iOS version. iOS 8.4.0, for example, will return `840`.
   */
  function getIOSVersion(userAgent) {
    var iosUserAgent = userAgent.match(/OS\s+([\d_]+)/i);
    var iosVersion = iosUserAgent[1].split('_');

    // The iOS ua string doesn't include the patch version if it's zero.
    if (iosVersion.length === 2) {
      iosVersion[2] = '0';
    }

    return parseInt(iosVersion.reduce(function (str, number) {
      return str + number;
    }, ''), 10);
  }

  /**
   * Retrieves the nth sibling of an element, or null if the would be nth sibling
   * does not exist. Heads up! This function excludes text nodes.
   * @param {Element} node Element to start looking from.
   * @param {number} n An integer representing the desired element relative to
   *     `node`. For example, `2` would look for `node.nextSibling.nextSibling`.
   * @param {boolean=} optIsForward Whether to look forwards or backwards. Default is true.
   * @return {?Element} The nth sibling or null.
   */
  function getNthSibling(node, n, optIsForward) {
    var isForward = optIsForward !== false;
    var siblingCount = 0;
    var sibling = node;
    do {
      sibling = isForward ? sibling.nextElementSibling : sibling.previousElementSibling;
      siblingCount += 1;
    } while (sibling && siblingCount < n);
    return sibling;
  }

  /**
   * Parse a value as a number. If it's not numeric, then the default value will
   * be returned.
   * @param {*} value The option.
   * @param {*} defaultValue The fallback value.
   * @return {*} If value is numeric, value, else defaultValue.
   */
  function getNumberOption(value, defaultValue) {
    var number = parseFloat(value);
    return defaultsTo(number, defaultValue, !Number.isNaN(number));
  }

  function getPaddingBox(element) {
    return getBox(element, 'padding');
  }

  /**
   * @param {*} value Anything.
   * @return {boolean}
   */
  function isString(value) {
    return typeof value === 'string';
  }

  /**
   * Parse a value as a string. If it's not a string, then the default value
   * will be returned.
   * @param {*} value The option.
   * @param {*} defaultValue The fallback value.
   * @return {*} If value is a string, value, else defaultValue.
   */
  function getStringOption(value, defaultValue) {
    return defaultsTo(value, defaultValue, isString(value));
  }

  /**
   * Parse a value as a percentage. If it's a string with '%' in it, it will
   * be parsed as a string, otherwise it will be parsed as a number.
   * @param {*} value The option.
   * @param {*} defaultValue The fallback value.
   * @return {*}
   */
  function getPercentageOption(value, defaultValue) {
    if (isString(value) && value.indexOf('%') > -1) {
      return getStringOption(value, defaultValue);
    }

    return getNumberOption(value, defaultValue);
  }

  /**
   * Ripped from: goog.testing.editor.dom.getRelativeDepth_.
   *
   * Returns the depth of the given node relative to the given parent node, or -1
   * if the given node is not a descendant of the given parent node. E.g. if
   * node == parentNode returns 0, if node.parentNode == parentNode returns 1,
   * etc.
   * @param {Node} node Node whose depth to get.
   * @param {Node} parentNode Node relative to which the depth should be
   *     calculated.
   * @return {number} The depth of the given node relative to the given parent
   *     node, or -1 if the given node is not a descendant of the given parent
   *     node.
   */
  function getRelativeDepth(node, parentNode) {
    var depth = 0;
    var child = node;
    while (child) {
      if (child === parentNode) {
        return depth;
      }

      child = child.parentNode;
      depth += 1;
    }

    return -1;
  }

  /**
   * Set an id on an element if one doesn't exist.
   * @param {Element} element Element to give an id.
   * @param {string|function(): string} fn Returns an id to set.
   */
  function giveId(element, fn) {
    if (!element.id) {
      element.id = typeof fn === 'function' ? fn() : fn;
    }
  }

  /**
   * Detects the native Android Operating System.
   * @param {string} userAgent The user agent string.
   * @return {boolean}
   */
  function isAndroidOS(userAgent) {
    return userAgent.includes('Mozilla/5.0') && userAgent.includes('Android ');
  }

  /**
   * Check for Microsoft Edge string.
   * @param {string} userAgent The user agent string.
   * @return {boolean}
   */
  function isEdge(userAgent) {
    return userAgent.includes('Edge/');
  }

  /**
   * Detects all Google Chrome browsers.
   * @param {string} userAgent The user agent string.
   * @return {boolean}
   */
  function isChrome(userAgent) {
    return !isEdge(userAgent) && userAgent.includes('Chrome');
  }

  /**
   * Whether the give user agent is from the stock Android browser.
   * @param {string} userAgent User agent string.
   * @return {boolean}
   */
  function isNativeAndroid(userAgent) {
    return isAndroidOS(userAgent) && !isChrome(userAgent);
  }

  /**
   * Detects the iOS operating system.
   * @param {string} userAgent  The user agent string.
   * @return {boolean}
   */
  function isIOS(userAgent) {
    return (/(iPad|iPhone|iPod)/g.test(userAgent)
    );
  }

  /**
   * User agent test for IOS. Determines whether current version is < 8. Version 8
   * and higher allow javascript execution while scrolling.
   * @param {string} userAgent The user agent string.
   * @return {boolean}
   */
  function hasScrollEvents(userAgent) {
    if (isIOS(userAgent)) {
      return getIOSVersion(userAgent) >= 800;
    }
    return !isNativeAndroid(userAgent);
  }

  /**
   * Hyphenates a javascript style string to a css one. For example:
   * MozBoxSizing -> -moz-box-sizing.
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
   * Check for Microsoft Internet Explorer string.
   * @param {string} userAgent The user agent string.
   * @return {boolean}
   */
  function isIE(userAgent) {
    return userAgent.includes('Trident/');
  }

  /**
   * Execute a callback when a css animation finishes.
   * @param {Element} elem The element which as an animation on it.
   * @param {Function} fn Callback function
   * @param {Object} [context=window] Optional context for the callback.
   */
  function onAnimationEnd(elem, fn) {
    var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

    var element = getElement(elem);

    var callback = fn.bind(context);

    function animationEnded(evt) {
      // Ensure the `animationend` event was from the element specified.
      // Difficult to test without tracking callbacks.
      /* istanbul ignore next */
      if (!isOwnEvent(evt)) {
        return;
      }

      // Remove the listener if it was bound.
      if (OdoDevice.HAS_CSS_ANIMATIONS) {
        evt.currentTarget.removeEventListener(events.ANIMATIONEND, animationEnded);
      }

      callback(evt);
    }

    if (OdoDevice.HAS_CSS_ANIMATIONS) {
      element.addEventListener(events.ANIMATIONEND, animationEnded);
    } else {
      // Callback is expected to be async, so push it to the end of the queue.
      setTimeout(function () {
        animationEnded(getFakeEvent(element));
      }, 0);
    }
  }

  /**
   * Remove an item from an array.
   * @param {Array.<*>} arr An array.
   * @param {*} item Thing to remove from the array.
   * @return {?*} The item which was removed or null.
   */
  function pull(arr, item) {
    var index = arr.indexOf(item);
    if (index === -1) {
      return null;
    }

    arr.splice(index, 1);
    return item;
  }

  /**
   * Creates a random string for IDs, etc.
   * http://stackoverflow.com/a/8084248/995529
   * @return {string} Random string.
   */
  function random() {
    return Math.random().toString(36).substring(7);
  }

  var Rect = function () {
    /**
     * Class for representing rectangular regions.
     * @param {number} x Left.
     * @param {number} y Top.
     * @param {number} w Width.
     * @param {number} h Height.
     * @constructor
     */
    function Rect(x, y, w, h) {
      classCallCheck(this, Rect);

      /**
       * Left
       * @type {number}
       */
      this.left = x;

      /**
       * Top
       * @type {number}
       */
      this.top = y;

      /**
       * Width
       * @type {number}
       */
      this.width = w;

      /**
       * Height
       * @type {number}
       */
      this.height = h;
    }

    /**
     * Right
     * @type {number}
     */


    /**
     * Returns whether two rectangles intersect. Two rectangles intersect if they
     * touch at all, for example, two zero width and height rectangles would
     * intersect if they had the same top and left.
     * @param {Rect} a A Rectangle.
     * @param {Rect} b A Rectangle.
     * @return {boolean} Whether a and b intersect.
     */
    Rect.intersects = function intersects(a, b) {
      return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
    };

    createClass(Rect, [{
      key: "right",
      get: function get$$1() {
        return this.left + this.width;
      }

      /**
       * Bottom
       * @type {number}
       */

    }, {
      key: "bottom",
      get: function get$$1() {
        return this.top + this.height;
      }
    }]);
    return Rect;
  }();

  /**
   * Removes all children from a parent node.
   * @param {Element} element Parent node.
   */
  function removeChildren(element) {
    element.textContent = '';
  }

  /* istanbul ignore next */
  function normalizeHash(hash) {
    if (typeof hash !== 'string') {
      throw new Error('Hash must be of type string');
    } else {
      return hash.replace(/^#/, '');
    }
  }

  /**
   * Updates the browser's hash
   * @param {string} newHash New hash, without `#`
   */
  function setHash(newHash) {
    var hash = normalizeHash(newHash);
    var st = void 0;

    // When resetting the hash with `''`, the page will scroll back to the top,
    // so we cache the current scroll position.
    if (!hash) {
      st = window.pageYOffset;
    }

    window.location.hash = hash;

    // Scroll back to the position from before.
    if (!hash) {
      window.scrollTo(0, st);
    }
  }

  /**
   * Updates the user's history with new hash
   * @param {string} newHash New hash, without `#`
   */
  function replaceWithHash(newHash) {
    var hash = normalizeHash(newHash);
    if (window.history.replaceState) {
      hash = normalizeHash(hash);

      // If resetting the hash, the whole path is needed. `''` doesn't work.
      if (hash) {
        hash = '#' + hash;
      } else {
        hash = window.location.pathname + window.location.search;
      }

      window.history.replaceState({}, null, hash);
    } else {
      setHash(hash);
    }
  }

  /**
   * Scroll the page to a destination.
   * @param {number} [position] End scroll position.
   * @param {number} [duration] Duration in milliseconds.
   * @param {function:void} [callback] Optional callback.
   * @param {function(number):number} [easing] Easing function.
   */
  function scrollTo() {
    var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;
    var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;
    var easing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

    var options = {
      start: window.pageYOffset,
      end: position,
      duration: duration,
      step: function step(scrollTop) {
        window.scrollTo(0, scrollTop);
      }
    };

    // Avoid setting `easing` to `undefined`.
    if (typeof easing === 'function') {
      options.easing = easing;
    }

    var anim = new Stepper(options);
    anim.onfinish = callback;
    return anim;
  }

  /**
   * Swaps element1 with element2 in the DOM.
   * @param {Element} elm1 first element.
   * @param {Element} elm2 second element.
   */
  function swapElements(elm1, elm2) {
    if (!elm1 || !elm2) {
      return;
    }

    var parent1 = elm1.parentNode;
    var next1 = elm1.nextSibling;
    var parent2 = elm2.parentNode;
    var next2 = elm2.nextSibling;

    parent1.insertBefore(elm2, next1);
    parent2.insertBefore(elm1, next2);
  }

  var Timer = function () {
    /**
     * A simple timer class. The timer does not start automatically when
     * initialized.
     * @param {Function} fn Callback for when the timer expires.
     * @param {number} delay Timer length in milliseconds.
     * @param {boolean} [continuous] If true, the timer will automatically
     *     restart itself when it expires.
     * @constructor
     */
    function Timer(fn, delay) {
      var continuous = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      classCallCheck(this, Timer);

      this.timerId = null;
      this.startTime = null;
      this.isPaused = false;
      this.isTicking = false;
      this.isContinuous = continuous;
      this.delay = delay;
      this.remaining = delay;
      this.fn = fn;

      this.resume = this.start;
      this.pause = this.stop;
    }

    /**
     * Starts ticking the timer.
     * @return {number|boolean} The remaining time or false if the timer is
     *     already ticking.
     */


    Timer.prototype.start = function start() {
      var _this = this;

      if (this.isTicking) {
        return false;
      }

      this.startTime = Date.now();
      this.timerId = setTimeout(function () {
        _this.fn();

        // If the timer wasn't stopped in the callback and this is a continuous
        // timer, start it again.
        if (!_this.isPaused && _this.isContinuous) {
          _this.restart();
        } else {
          _this.reset();
        }
      }, this.remaining);
      this.isTicking = true;
      this.isPaused = false;
      return this.remaining;
    };

    /**
     * Pauses the timer. Resuming will continue it with the remaining time.
     * @return {number} Time remaining.
     */


    Timer.prototype.stop = function stop() {
      this.clear();
      this.remaining -= Date.now() - this.startTime;
      this.isPaused = true;
      this.isTicking = false;
      return this.remaining;
    };

    /**
     * Sets time remaining to initial delay and clears timer.
     */


    Timer.prototype.reset = function reset() {
      this.remaining = this.delay;
      this.clear();
    };

    /**
     * Resets the timer to the original delay, clears the current timer, and
     * starts the timer again.
     */


    Timer.prototype.restart = function restart() {
      this.reset();
      this.resume();
    };

    /**
     * Clears timer.
     */


    Timer.prototype.clear = function clear() {
      clearTimeout(this.timerId);
      this.isPaused = false;
      this.isTicking = false;
    };

    /**
     * Destroy the timer.
     */


    Timer.prototype.dispose = function dispose() {
      this.clear();
      this.fn = null;
    };

    return Timer;
  }();

  /**
   * Calculates the offset index for a circular list.
   * @param {number} index Starting index.
   * @param {number} displacement Offset from the starting index. Can be negative
   *     or positive. For example, -2 or 2.
   * @param {number} length Length of the list.
   * @return {number} The index of the relative displacement, wrapping around
   *     the end of the list to the start when the displacement is larger than
   *     what's left in the list.
   */
  function wrapAroundList(index, displacement, length) {
    return (index + displacement + length * 10) % length;
  }

  exports.getTransitions = getTransitions;
  exports.animationClasses = Classes;
  exports.Stepper = Stepper;
  exports.Box = Box;
  exports.cancelTransitionEnd = cancelTransitionEnd;
  exports.capitalize = capitalize;
  exports.causeLayout = causeLayout;
  exports.chunk = chunk;
  exports.clamp = clamp;
  exports.closestGreaterThan = closestGreaterThan;
  exports.closestLessThan = closestLessThan;
  exports.closest = closest;
  exports.Coordinate = Coordinate;
  exports.defaultsTo = defaultsTo;
  exports.domLoaded = domLoaded;
  exports.domReady = domReady;
  exports.evenHeights = evenHeights;
  exports.events = events;
  exports.fadeInElement = fadeInElement;
  exports.fadeOutElement = fadeOutElement;
  exports.forceRedraw = forceRedraw;
  exports.getElementsSize = getElementsSize;
  exports.getIOSVersion = getIOSVersion;
  exports.getMarginBox = getMarginBox;
  exports.getNthSibling = getNthSibling;
  exports.getNumberOption = getNumberOption;
  exports.getPaddingBox = getPaddingBox;
  exports.getPercentageOption = getPercentageOption;
  exports.getRelativeDepth = getRelativeDepth;
  exports.getSize = getSize;
  exports.getStringOption = getStringOption;
  exports.giveId = giveId;
  exports.hasScrollEvents = hasScrollEvents;
  exports.hyphenate = hyphenate;
  exports.isAndroidOS = isAndroidOS;
  exports.isChrome = isChrome;
  exports.isDefined = isDefined;
  exports.isEdge = isEdge;
  exports.isIE = isIE;
  exports.isIOS = isIOS;
  exports.isNativeAndroid = isNativeAndroid;
  exports.isString = isString;
  exports.noop = noop;
  exports.onAnimationEnd = onAnimationEnd;
  exports.onTransitionEnd = onTransitionEnd;
  exports.pull = pull;
  exports.randomString = random;
  exports.Rect = Rect;
  exports.removeChildren = removeChildren;
  exports.replaceWithHash = replaceWithHash;
  exports.scrollToTop = scrollTo;
  exports.scrollTo = scrollTo;
  exports.setHash = setHash;
  exports.swapElements = swapElements;
  exports.Timer = Timer;
  exports.wrapAroundList = wrapAroundList;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=odo-helpers.js.map
