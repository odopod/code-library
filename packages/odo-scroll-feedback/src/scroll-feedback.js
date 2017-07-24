/**
 * @fileoverview The `ScrollFeedback` class listens for input from the user:
 * mouse, keyboard, touch. Based on the input, the `ScrollFeedback` instance will
 * emit navigation events with a `direction` property signifying which way the
 * user should be taken.
 *
 * @author Glen Cheney <glen@odopod.com>
 */

import TinyEmitter from 'tiny-emitter';

/*
 * Detect passive event listeners.
 * https://developers.google.com/web/updates/2017/01/scrolling-intervention
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/dom/passiveeventlisteners.js
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 *
 * Weird istanbul ignore:
 * https://github.com/gotwarlost/istanbul/issues/445#issuecomment-150498338
 */
let supportsPassiveOption = false;
try {
  window.addEventListener('test', null, {
    get passive/* istanbul ignore next */() {
      supportsPassiveOption = true;
    },
  });
} catch (e) { /* continue */ }

const KeyCodes = {
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  UP: 38,
  DOWN: 40,
};

class ScrollFeedback extends TinyEmitter {
  constructor(element, options) {
    super();

    this.element = element;

    this.options = Object.assign({}, ScrollFeedback.Defaults, options);
    this._listenerOptions = ScrollFeedback.PASSIVE_LISTENERS ? { passive: false } : false;

    this.canScroll = true;
    this._isUserPaused = false;
    this.wheelTimeout = null;
    this.scrollTimeout = null;
    this.wheelAmount = { x: 0, y: 0 };
    this.startPosition = { x: 0, y: 0 };

    this._handleWheel = this._handleWheel.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleTouchMove = this._handleTouchMove.bind(this);
    this._resume = this._resume.bind(this);
    this._handleScrollTimerExpired = this._handleScrollTimerExpired.bind(this);
    this._handleScrollEnd = this._handleScrollEnd.bind(this);

    this.enable();
  }

  /**
   * Enable the scroll feedback instance by adding event listeners.
   */
  enable() {
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
  }

  /**
   * Disable the instance by removing event listeners.
   */
  disable() {
    this.element.removeEventListener('wheel', this._handleWheel, this._listenerOptions);
    this.element.removeEventListener('mousewheel', this._handleWheel, this._listenerOptions);

    document.removeEventListener('keydown', this._handleKeydown, this._listenerOptions);

    document.body.removeEventListener('touchstart', this._handleTouchStart, this._listenerOptions);
    document.body.removeEventListener('touchmove', this._touchmoveHandler, this._listenerOptions);
    document.body.removeEventListener('touchend', this._resume, this._listenerOptions);
  }

  /**
   * Mouse wheel event. The cross-browser code is from iScroll 5.
   * @param {Event} evt Event object.
   * @private
   */
  _handleWheel(evt) {
    if (this._shouldIgnoreEvent(evt.target)) {
      return;
    }

    if (this.canScroll) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(this._handleScrollTimerExpired,
        this.options.scrollTimerDelay);

      if (this._intentToNavigate(this.wheelAmount)) {
        this._triggerNavigation(this.wheelAmount);
        this._pause();
      }
    }

    // Execute the scrollEnd event after 300ms the wheel stopped scrolling
    clearTimeout(this.wheelTimeout);
    this.wheelTimeout = setTimeout(this._handleScrollEnd, this.options.scrollEndDelay);

    // Wheeling amount since the last wheel event.
    const { x, y } = this._getWheelDelta(evt);

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
  }

  /**
   * Before navigating, this function determines if the user has scrolled past
   * the wheel threshold constant and that they have scrolled more Y (vertical)
   * than X (horizontal).
   * @param {{x: number, y: number}} delta Amount moved since last movement.
   */
  _intentToNavigate(delta) {
    const absY = Math.abs(delta.y);
    const absX = Math.abs(delta.x);

    return absY > this.options.movementThreshold && absY > absX;
  }

  /**
   * Trigger the navigation, after it's been determined the user's
   * intent was to navigate.
   */
  _triggerNavigation(delta) {
    const direction = delta.y < 0 ?
      ScrollFeedback.Direction.NEXT :
      ScrollFeedback.Direction.PREVIOUS;
    this.navigate(direction);
  }

  /**
   * Scroll events stopped firing. Reset some things and notify.
   * @private
   */
  _handleScrollEnd() {
    clearTimeout(this.scrollTimeout);
    this.wheelTimeout = null;
    this._resume();
    this.emit(ScrollFeedback.Events.SCROLL_END);
    this.wheelAmount = {
      x: 0,
      y: 0,
    };
  }

  /**
   * The scroll timer starts when the first intent to navigate is called. If the
   * user keeps scrolling the page, this timer will expire and trigger the scroll
   * end event to happen.
   */
  _handleScrollTimerExpired() {
    clearTimeout(this.wheelTimeout);
    this._handleScrollEnd();
  }

  /**
   * Event listener for key down. If a special key is pressed, this class will
   * emit an event with the direction the page should go.
   * @param {Event} evt Event object.
   * @private
   */
  _handleKeydown(evt) {
    let direction = null;

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
  }

  /**
   * Save the starting position of the user's finger on touch start.
   * @param {Event} evt Event object.
   * @private
   */
  _handleTouchStart(evt) {
    this.startPosition = {
      x: evt.changedTouches[0].pageX,
      y: evt.changedTouches[0].pageY,
    };
  }

  /**
   * Emits a navigation event if the user has moved their finger far enough.
   * @param {Event} evt Event object.
   * @private
   */
  _handleTouchMove(evt) {
    if (this._shouldIgnoreEvent(evt.target)) {
      return;
    }

    if (!this.canScroll) {
      evt.preventDefault();
      return;
    }

    const pos = {
      x: evt.changedTouches[0].pageX,
      y: evt.changedTouches[0].pageY,
    };

    const delta = {
      x: pos.x - this.startPosition.x,
      y: pos.y - this.startPosition.y,
    };

    if (this._intentToNavigate(delta)) {
      evt.preventDefault();
      this._triggerNavigation(delta);
      this._pause();
    }
  }

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
  _getWheelDelta(e) {
    let wheelDeltaX;
    let wheelDeltaY;

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
      y: wheelDeltaY,
    };
  }

  /**
   * If the element which received the touch move event is one which should
   * be ignored, exit immidiately.
   * @param {Element} element Element to test.
   * @return {boolean} Whether to ignore the event or not.
   */
  _shouldIgnoreEvent(element) {
    return !!this.options.ignore && element.closest(this.options.ignore) !== null;
  }

  /**
   * Emits a NAVIGATE event with a direction.
   * @param {ScrollFeedback.Direction} direction Direction to navigate.
   */
  navigate(direction) {
    this.emit(ScrollFeedback.Events.NAVIGATE, {
      direction,
    });
  }

  /**
   * Scroll and touch events will not be counted as input.
   */
  _pause() {
    this.canScroll = false;
  }

  /**
   * Only set the can scroll flag to true when the user of this component has
   * not paused it.
   */
  _resume() {
    if (!this._isUserPaused) {
      this.canScroll = true;
    }
  }

  /**
   * Scroll and touch events will not be counted as input.
   */
  pause() {
    this._isUserPaused = true;
    this._pause();
  }

  /**
   * Counts scrolls and touch events as inputs.
   */
  resume() {
    this._isUserPaused = false;
    this._resume();
  }

  /**
   * Remove DOM references and event handlers.
   */
  dispose() {
    clearTimeout(this.scrollTimeout);
    clearTimeout(this.wheelTimeout);
    this.disable();
    this.element = null;
  }
}

/** @enum {string} */
ScrollFeedback.Events = {
  NAVIGATE: 'odoscrollfeedback:navigate',
  SCROLL_END: 'odoscrollfeedback:scrollend',
};

/** @enum {number} */
ScrollFeedback.Direction = {
  START: 1,
  PREVIOUS: 2,
  NEXT: 3,
  END: 4,
};

/**
 * Options which can be overriden for the input handler.
 * @type {Object}
 */
ScrollFeedback.Defaults = {
  ignore: null, // A selector string matching elements which should not be interpreted
  movementThreshold: 5, // Amount needed in deltaY (touch or mouse wheel) before event is emitted.
  scrollEndDelay: 350, // The amount of time between scrolls to trigger scroll end
  scrollTimerDelay: 2000, // Delay before one continuous scroll triggers scroll end
};

ScrollFeedback.MOUSE_WHEEL_SPEED = 20;

ScrollFeedback.PASSIVE_LISTENERS = supportsPassiveOption;

export default ScrollFeedback;
