(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('tiny-emitter')) :
	typeof define === 'function' && define.amd ? define(['tiny-emitter'], factory) :
	(global.OdoScrollFeedback = factory(global.TinyEmitter));
}(this, (function (TinyEmitter) { 'use strict';

TinyEmitter = TinyEmitter && TinyEmitter.hasOwnProperty('default') ? TinyEmitter['default'] : TinyEmitter;

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

/**
 * @fileoverview The `ScrollFeedback` class listens for input from the user:
 * mouse, keyboard, touch. Based on the input, the `ScrollFeedback` instance will
 * emit navigation events with a `direction` property signifying which way the
 * user should be taken.
 *
 * @author Glen Cheney <glen@odopod.com>
 */

/*
 * Detect passive event listeners.
 * https://developers.google.com/web/updates/2017/01/scrolling-intervention
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/dom/passiveeventlisteners.js
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 *
 * Weird istanbul ignore:
 * https://github.com/gotwarlost/istanbul/issues/445#issuecomment-150498338
 */
var supportsPassiveOption = false;
try {
  window.addEventListener('test', null, {
    get passive /* istanbul ignore next */() {
      // eslint-disable-line getter-return
      supportsPassiveOption = true;
    }
  });
} catch (e) {/* continue */}

var KeyCodes = {
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  UP: 38,
  DOWN: 40
};

var ScrollFeedback = function (_TinyEmitter) {
  inherits(ScrollFeedback, _TinyEmitter);

  function ScrollFeedback(element, options) {
    classCallCheck(this, ScrollFeedback);

    var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

    _this.element = element;

    _this.options = Object.assign({}, ScrollFeedback.Defaults, options);
    _this._listenerOptions = ScrollFeedback.PASSIVE_LISTENERS ? { passive: false } : false;

    _this.canScroll = true;
    _this._isUserPaused = false;
    _this.wheelTimeout = null;
    _this.scrollTimeout = null;
    _this.wheelAmount = { x: 0, y: 0 };
    _this.startPosition = { x: 0, y: 0 };

    _this._handleWheel = _this._handleWheel.bind(_this);
    _this._handleKeydown = _this._handleKeydown.bind(_this);
    _this._handleTouchStart = _this._handleTouchStart.bind(_this);
    _this._handleTouchMove = _this._handleTouchMove.bind(_this);
    _this._resume = _this._resume.bind(_this);
    _this._handleScrollTimerExpired = _this._handleScrollTimerExpired.bind(_this);
    _this._handleScrollEnd = _this._handleScrollEnd.bind(_this);

    _this.enable();
    return _this;
  }

  /**
   * Enable the scroll feedback instance by adding event listeners.
   */


  ScrollFeedback.prototype.enable = function enable() {
    // `wheel` is the standard, but Safari<8 only supports `mousewheel`.
    // IE9+, Chrome, Firefox, Opera all use `wheel`.
    this.element.addEventListener('wheel', this._handleWheel, this._listenerOptions);
    this.element.addEventListener('mousewheel', this._handleWheel, this._listenerOptions);

    // Use the arrow keys to navigate next and previous as well.
    document.addEventListener('keydown', this._handleKeydown, this._listenerOptions);

    // Prevent touch events from scrolling the page. They need to be interpreted.
    document.body.addEventListener('touchstart', this._handleTouchStart, this._listenerOptions);
    document.body.addEventListener('touchmove', this._handleTouchMove, this._listenerOptions);
    document.body.addEventListener('touchend', this._resume, this._listenerOptions);
  };

  /**
   * Disable the instance by removing event listeners.
   */


  ScrollFeedback.prototype.disable = function disable() {
    this.element.removeEventListener('wheel', this._handleWheel, this._listenerOptions);
    this.element.removeEventListener('mousewheel', this._handleWheel, this._listenerOptions);

    document.removeEventListener('keydown', this._handleKeydown, this._listenerOptions);

    document.body.removeEventListener('touchstart', this._handleTouchStart, this._listenerOptions);
    document.body.removeEventListener('touchmove', this._handleTouchMove, this._listenerOptions);
    document.body.removeEventListener('touchend', this._resume, this._listenerOptions);
  };

  /**
   * Mouse wheel event. The cross-browser code is from iScroll 5.
   * @param {Event} evt Event object.
   * @private
   */


  ScrollFeedback.prototype._handleWheel = function _handleWheel(evt) {
    if (this._shouldIgnoreEvent(evt.target)) {
      return;
    }

    if (this.canScroll) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(this._handleScrollTimerExpired, this.options.scrollTimerDelay);

      if (this._intentToNavigate(this.wheelAmount)) {
        this._triggerNavigation(this.wheelAmount);
        this._pause();
      }
    }

    // Execute the scrollEnd event after 300ms the wheel stopped scrolling
    clearTimeout(this.wheelTimeout);
    this.wheelTimeout = setTimeout(this._handleScrollEnd, this.options.scrollEndDelay);

    // Wheeling amount since the last wheel event.

    var _getWheelDelta2 = this._getWheelDelta(evt),
        x = _getWheelDelta2.x,
        y = _getWheelDelta2.y;

    // Using prevent default all the time stops the swipe-to-go-back on the
    // magic mouse (and probably others). Only prevent the default if there is
    // no vertical movement and some horizontal movement.


    if (!(y === 0 && Math.abs(x) > 0)) {
      evt.preventDefault();
      evt.stopPropagation();
    }

    // Keep a running total of the amount in each direction.
    this.wheelAmount.x += x;
    this.wheelAmount.y += y;
  };

  /**
   * Before navigating, this function determines if the user has scrolled past
   * the wheel threshold constant and that they have scrolled more Y (vertical)
   * than X (horizontal).
   * @param {{x: number, y: number}} delta Amount moved since last movement.
   */


  ScrollFeedback.prototype._intentToNavigate = function _intentToNavigate(delta) {
    var absY = Math.abs(delta.y);
    var absX = Math.abs(delta.x);

    return absY > this.options.movementThreshold && absY > absX;
  };

  /**
   * Trigger the navigation, after it's been determined the user's
   * intent was to navigate.
   */


  ScrollFeedback.prototype._triggerNavigation = function _triggerNavigation(delta) {
    var direction = delta.y < 0 ? ScrollFeedback.Direction.NEXT : ScrollFeedback.Direction.PREVIOUS;
    this.navigate(direction);
  };

  /**
   * Scroll events stopped firing. Reset some things and notify.
   * @private
   */


  ScrollFeedback.prototype._handleScrollEnd = function _handleScrollEnd() {
    clearTimeout(this.scrollTimeout);
    this.wheelTimeout = null;
    this._resume();
    this.emit(ScrollFeedback.Events.SCROLL_END);
    this.wheelAmount = {
      x: 0,
      y: 0
    };
  };

  /**
   * The scroll timer starts when the first intent to navigate is called. If the
   * user keeps scrolling the page, this timer will expire and trigger the scroll
   * end event to happen.
   */


  ScrollFeedback.prototype._handleScrollTimerExpired = function _handleScrollTimerExpired() {
    clearTimeout(this.wheelTimeout);
    this._handleScrollEnd();
  };

  /**
   * Event listener for key down. If a special key is pressed, this class will
   * emit an event with the direction the page should go.
   * @param {Event} evt Event object.
   * @private
   */


  ScrollFeedback.prototype._handleKeydown = function _handleKeydown(evt) {
    var direction = null;

    switch (evt.which) {
      // Up and page up.
      // Falls through
      case KeyCodes.UP:
      case KeyCodes.PAGE_UP:
        direction = ScrollFeedback.Direction.PREVIOUS;
        break;

      // Down arrow and page down.
      // Falls through
      case KeyCodes.DOWN:
      case KeyCodes.PAGE_DOWN:
        direction = ScrollFeedback.Direction.NEXT;
        break;

      // Space bar normally scrolls the page down, advance to the next
      // waypoint on spacebar press. Holding shift and pressing space scrolls
      // the page up.
      case KeyCodes.SPACE:
        if (evt.shiftKey) {
          direction = ScrollFeedback.Direction.PREVIOUS;
        } else {
          direction = ScrollFeedback.Direction.NEXT;
        }

        break;

      case KeyCodes.HOME:
        direction = ScrollFeedback.Direction.START;
        break;

      case KeyCodes.END:
        direction = ScrollFeedback.Direction.END;
        break;

      // no default
    }

    if (direction) {
      // Stop up and down from scrolling the page.
      evt.preventDefault();
      evt.stopPropagation();

      if (this.canScroll) {
        this.navigate(direction);
      }
    }
  };

  /**
   * Save the starting position of the user's finger on touch start.
   * @param {Event} evt Event object.
   * @private
   */


  ScrollFeedback.prototype._handleTouchStart = function _handleTouchStart(evt) {
    this.startPosition = {
      x: evt.changedTouches[0].pageX,
      y: evt.changedTouches[0].pageY
    };
  };

  /**
   * Emits a navigation event if the user has moved their finger far enough.
   * @param {Event} evt Event object.
   * @private
   */


  ScrollFeedback.prototype._handleTouchMove = function _handleTouchMove(evt) {
    if (this._shouldIgnoreEvent(evt.target)) {
      return;
    }

    if (!this.canScroll) {
      evt.preventDefault();
      return;
    }

    var pos = {
      x: evt.changedTouches[0].pageX,
      y: evt.changedTouches[0].pageY
    };

    var delta = {
      x: pos.x - this.startPosition.x,
      y: pos.y - this.startPosition.y
    };

    if (this._intentToNavigate(delta)) {
      evt.preventDefault();
      this._triggerNavigation(delta);
      this._pause();
    }
  };

  /**
   * Calculate the amount of wheeling since the last wheel event.
   *
   * Info on deltaMode in Firefox https://github.com/cubiq/iscroll/issues/577
   * Wheel event on MDN https://developer.mozilla.org/en-US/docs/Web/Events/wheel
   *
   * @param {WheelEvent} e Event object.
   * @return {{x: number, y: number}}
   * @private
   */


  ScrollFeedback.prototype._getWheelDelta = function _getWheelDelta(e) {
    var wheelDeltaX = void 0;
    var wheelDeltaY = void 0;

    // Normalize the wheel delta value.
    if ('deltaX' in e) {
      // deltaMode can be three different values: pixels, lines, or pages. 0, 1, or 2.
      if (e.deltaMode === 1) {
        wheelDeltaX = -e.deltaX * ScrollFeedback.MOUSE_WHEEL_SPEED;
        wheelDeltaY = -e.deltaY * ScrollFeedback.MOUSE_WHEEL_SPEED;
      } else {
        wheelDeltaX = -e.deltaX;
        wheelDeltaY = -e.deltaY;
      }

      // Support Safari<8
    } else if ('wheelDeltaX' in e) {
      wheelDeltaX = e.wheelDeltaX / 120 * ScrollFeedback.MOUSE_WHEEL_SPEED;
      wheelDeltaY = e.wheelDeltaY / 120 * ScrollFeedback.MOUSE_WHEEL_SPEED;
    }

    return {
      x: wheelDeltaX,
      y: wheelDeltaY
    };
  };

  /**
   * If the element which received the touch move event is one which should
   * be ignored, exit immidiately.
   * @param {Element} element Element to test.
   * @return {boolean} Whether to ignore the event or not.
   */


  ScrollFeedback.prototype._shouldIgnoreEvent = function _shouldIgnoreEvent(element) {
    return !!this.options.ignore && element.closest(this.options.ignore) !== null;
  };

  /**
   * Emits a NAVIGATE event with a direction.
   * @param {ScrollFeedback.Direction} direction Direction to navigate.
   */


  ScrollFeedback.prototype.navigate = function navigate(direction) {
    this.emit(ScrollFeedback.Events.NAVIGATE, {
      direction: direction
    });
  };

  /**
   * Scroll and touch events will not be counted as input.
   */


  ScrollFeedback.prototype._pause = function _pause() {
    this.canScroll = false;
  };

  /**
   * Only set the can scroll flag to true when the user of this component has
   * not paused it.
   */


  ScrollFeedback.prototype._resume = function _resume() {
    if (!this._isUserPaused) {
      this.canScroll = true;
    }
  };

  /**
   * Scroll and touch events will not be counted as input.
   */


  ScrollFeedback.prototype.pause = function pause() {
    this._isUserPaused = true;
    this._pause();
  };

  /**
   * Counts scrolls and touch events as inputs.
   */


  ScrollFeedback.prototype.resume = function resume() {
    this._isUserPaused = false;
    this._resume();
  };

  /**
   * Remove DOM references and event handlers.
   */


  ScrollFeedback.prototype.dispose = function dispose() {
    clearTimeout(this.scrollTimeout);
    clearTimeout(this.wheelTimeout);
    this.disable();
    this.element = null;
  };

  return ScrollFeedback;
}(TinyEmitter);

/** @enum {string} */


ScrollFeedback.Events = {
  NAVIGATE: 'odoscrollfeedback:navigate',
  SCROLL_END: 'odoscrollfeedback:scrollend'
};

/** @enum {number} */
ScrollFeedback.Direction = {
  START: 1,
  PREVIOUS: 2,
  NEXT: 3,
  END: 4
};

/**
 * Options which can be overriden for the input handler.
 * @type {Object}
 */
ScrollFeedback.Defaults = {
  ignore: null, // A selector string matching elements which should not be interpreted
  movementThreshold: 5, // Amount needed in deltaY (touch or mouse wheel) before event is emitted.
  scrollEndDelay: 350, // The amount of time between scrolls to trigger scroll end
  scrollTimerDelay: 2000 // Delay before one continuous scroll triggers scroll end
};

ScrollFeedback.MOUSE_WHEEL_SPEED = 20;

ScrollFeedback.PASSIVE_LISTENERS = supportsPassiveOption;

return ScrollFeedback;

})));
//# sourceMappingURL=odo-scroll-feedback.js.map
