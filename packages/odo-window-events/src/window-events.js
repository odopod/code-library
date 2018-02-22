import throttle from 'throttleit';
import debounce from 'debounce';

let count = 0;
function uniqueId() {
  count += 1;
  return `OdoWindowEvents${count}`;
}

function callEachWithArg(object, args) {
  Object.keys(object).forEach((i) => {
    object[i].call(null, args[0], args[1]);
  });
}

/**
 * Retrieves the scroll offsets. This only works for the page scroll. For
 * scroll positions of an element, the `scrollTop` and `scrollLeft` properties
 * need to be used.
 * @return {{top: number, left: number}}
 */
function getScrollPosition() {
  return {
    top: window.pageYOffset,
    left: window.pageXOffset,
  };
}

/**
 * Retrieve the dimensions of the viewable screen.
 * @return {{width: number, height: number}}
 */
function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function addCallback(object, fn) {
  const id = uniqueId();
  object[id] = fn;
  return id;
}

const WindowEvents = {

  _scrollCallbacks: {},
  _fastScrollCallbacks: {},
  _resizeCallbacks: {},
  _leadingResizeCallbacks: {},

  _callbacks: {
    resize() {
      const viewport = getViewportSize();
      callEachWithArg(WindowEvents._resizeCallbacks, [viewport.width, viewport.height]);
    },

    leadingResize() {
      const viewport = getViewportSize();
      callEachWithArg(WindowEvents._leadingResizeCallbacks, [viewport.width, viewport.height]);
    },

    scroll() {
      const scroll = getScrollPosition();
      callEachWithArg(WindowEvents._scrollCallbacks, [scroll.top, scroll.left]);
    },

    fastScroll() {
      const scroll = getScrollPosition();
      callEachWithArg(WindowEvents._fastScrollCallbacks, [scroll.top, scroll.left]);
    },
  },

  Timing: {
    DEBOUNCE_TIME: 500,
    THROTTLE_TIME_DEFAULT: 500,
    THROTTLE_TIME_FAST: 150,
  },

  /**
   * Bind a callback to window scroll.
   * @param {function(number, number):void} fn Callback to execute on scroll.
   * @return {string} id of event, to be used with service's remove method.
   */
  onScroll(fn) {
    return addCallback(WindowEvents._scrollCallbacks, fn);
  },

  /**
   * Bind a callback to window scroll which executes quicker.
   * @param {function(number, number):void} fn Callback to execute on scroll.
   * @return {string} id of event, to be used with service's remove method.
   */
  onFastScroll(fn) {
    return addCallback(WindowEvents._fastScrollCallbacks, fn);
  },

  /**
   * Bind a callback to window resize.
   * @param {function(number, number):void} fn Callback to execute on resize.
   * @return {string} id of event, to be used with service's remove method.
   */
  onResize(fn) {
    return addCallback(WindowEvents._resizeCallbacks, fn);
  },

  /**
   * Bind a callback to window resize.
   * @param {function(number, number):void} fn Callback to execute on resize.
   * @return {string} id of event, to be used with service's remove method.
   */
  onLeadingResize(fn) {
    return addCallback(WindowEvents._leadingResizeCallbacks, fn);
  },

  /**
   * Remove callback with a given id.
   * @param {string} id Callback ID to remove.
   */
  remove(id) {
    delete WindowEvents._scrollCallbacks[id];
    delete WindowEvents._fastScrollCallbacks[id];
    delete WindowEvents._resizeCallbacks[id];
    delete WindowEvents._leadingResizeCallbacks[id];
  },
};

const resize = debounce(
  WindowEvents._callbacks.resize,
  WindowEvents.Timing.DEBOUNCE_TIME,
);
const leadingResize = debounce(
  WindowEvents._callbacks.leadingResize,
  WindowEvents.Timing.DEBOUNCE_TIME, true,
);
const scrolled = throttle(
  WindowEvents._callbacks.scroll,
  WindowEvents.Timing.THROTTLE_TIME_DEFAULT,
);
const fastScroll = throttle(
  WindowEvents._callbacks.fastScroll,
  WindowEvents.Timing.THROTTLE_TIME_FAST,
);

WindowEvents._resizeCallback = () => {
  leadingResize();
  resize();
};

WindowEvents._scrollCallback = () => {
  scrolled();
  fastScroll();
};

window.addEventListener('resize', WindowEvents._resizeCallback);
window.addEventListener('scroll', WindowEvents._scrollCallback);

export default WindowEvents;
