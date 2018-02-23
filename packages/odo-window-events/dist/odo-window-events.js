(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OdoWindowEvents = factory());
}(this, (function () { 'use strict';

var throttleit = throttle;

/**
 * Returns a new function that, when invoked, invokes `func` at most once per `wait` milliseconds.
 *
 * @param {Function} func Function to wrap.
 * @param {Number} wait Number of milliseconds that must elapse between `func` invocations.
 * @return {Function} A new function that wraps the `func` function passed in.
 */

function throttle(func, wait) {
  var ctx, args, rtn, timeoutID; // caching
  var last = 0;

  return function throttled() {
    ctx = this;
    args = arguments;
    var delta = new Date() - last;
    if (!timeoutID) if (delta >= wait) call();else timeoutID = setTimeout(call, wait - delta);
    return rtn;
  };

  function call() {
    timeoutID = 0;
    last = +new Date();
    rtn = func.apply(ctx, args);
    ctx = null;
    args = null;
  }
}

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

  debounced.flush = function () {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;

      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

var count = 0;
function uniqueId() {
  count += 1;
  return 'OdoWindowEvents' + count;
}

function callEachWithArg(object, args) {
  Object.keys(object).forEach(function (i) {
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
    left: window.pageXOffset
  };
}

/**
 * Retrieve the dimensions of the viewable screen.
 * @return {{width: number, height: number}}
 */
function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function addCallback(object, fn) {
  var id = uniqueId();
  object[id] = fn;
  return id;
}

var WindowEvents = {

  _scrollCallbacks: {},
  _fastScrollCallbacks: {},
  _resizeCallbacks: {},
  _leadingResizeCallbacks: {},

  _callbacks: {
    resize: function resize() {
      var viewport = getViewportSize();
      callEachWithArg(WindowEvents._resizeCallbacks, [viewport.width, viewport.height]);
    },
    leadingResize: function leadingResize() {
      var viewport = getViewportSize();
      callEachWithArg(WindowEvents._leadingResizeCallbacks, [viewport.width, viewport.height]);
    },
    scroll: function scroll() {
      var scroll = getScrollPosition();
      callEachWithArg(WindowEvents._scrollCallbacks, [scroll.top, scroll.left]);
    },
    fastScroll: function fastScroll() {
      var scroll = getScrollPosition();
      callEachWithArg(WindowEvents._fastScrollCallbacks, [scroll.top, scroll.left]);
    }
  },

  Timing: {
    DEBOUNCE_TIME: 500,
    THROTTLE_TIME_DEFAULT: 500,
    THROTTLE_TIME_FAST: 150
  },

  /**
   * Bind a callback to window scroll.
   * @param {function(number, number):void} fn Callback to execute on scroll.
   * @return {string} id of event, to be used with service's remove method.
   */
  onScroll: function onScroll(fn) {
    return addCallback(WindowEvents._scrollCallbacks, fn);
  },


  /**
   * Bind a callback to window scroll which executes quicker.
   * @param {function(number, number):void} fn Callback to execute on scroll.
   * @return {string} id of event, to be used with service's remove method.
   */
  onFastScroll: function onFastScroll(fn) {
    return addCallback(WindowEvents._fastScrollCallbacks, fn);
  },


  /**
   * Bind a callback to window resize.
   * @param {function(number, number):void} fn Callback to execute on resize.
   * @return {string} id of event, to be used with service's remove method.
   */
  onResize: function onResize(fn) {
    return addCallback(WindowEvents._resizeCallbacks, fn);
  },


  /**
   * Bind a callback to window resize.
   * @param {function(number, number):void} fn Callback to execute on resize.
   * @return {string} id of event, to be used with service's remove method.
   */
  onLeadingResize: function onLeadingResize(fn) {
    return addCallback(WindowEvents._leadingResizeCallbacks, fn);
  },


  /**
   * Remove callback with a given id.
   * @param {string} id Callback ID to remove.
   */
  remove: function remove(id) {
    delete WindowEvents._scrollCallbacks[id];
    delete WindowEvents._fastScrollCallbacks[id];
    delete WindowEvents._resizeCallbacks[id];
    delete WindowEvents._leadingResizeCallbacks[id];
  }
};

var resize = debounce(WindowEvents._callbacks.resize, WindowEvents.Timing.DEBOUNCE_TIME);
var leadingResize = debounce(WindowEvents._callbacks.leadingResize, WindowEvents.Timing.DEBOUNCE_TIME, true);
var scrolled = throttleit(WindowEvents._callbacks.scroll, WindowEvents.Timing.THROTTLE_TIME_DEFAULT);
var fastScroll = throttleit(WindowEvents._callbacks.fastScroll, WindowEvents.Timing.THROTTLE_TIME_FAST);

WindowEvents._resizeCallback = function () {
  leadingResize();
  resize();
};

WindowEvents._scrollCallback = function () {
  scrolled();
  fastScroll();
};

window.addEventListener('resize', WindowEvents._resizeCallback);
window.addEventListener('scroll', WindowEvents._scrollCallback);

return WindowEvents;

})));
//# sourceMappingURL=odo-window-events.js.map
