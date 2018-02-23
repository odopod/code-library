(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OdoScrollAnimation = factory());
}(this, (function () { 'use strict';

/**
 * @fileoverview A service for adding a scroll listener to a target (like the
 * page or a modal) and receiving a callback which is throttled to once per frame
 * using requestAnimationFrame. If the scroll event is dispatched more than once
 * in one frame, the service cancels the previous request and makes a new one.
 * It will only bind one scroll event listener per target, no matter the number
 * of callbacks associated with it.
 *
 * @author Glen Cheney <glen@odopod.com>
 */

var id = 0;
function uniqueId() {
  id += 1;
  return 'sa_' + id;
}

function isWindow(obj) {
  return obj && obj.window && obj.document && obj.location && obj.alert && obj.setInterval;
}

function isDocument(obj) {
  return obj && obj.nodeType === 9;
}

var service = {

  /**
   * A collection of scroll listeners the service is using.
   * @type {Map.<string, Object>}
   * @private
   */
  _listeners: new Map(),

  /**
   * A map of request animation frame ids for each target.
   * @type {Map.<Element|Window, number>}
   * @private
   */
  _targets: new Map(),

  /**
   * Finds all listeners registered with the given target element.
   * @param {Window|Element} element Target element.
   * @return {Array.<Function>} An array of listener functions.
   * @private
   */
  _getListenersForTarget: function _getListenersForTarget(element) {
    var functions = [];

    this._listeners.forEach(function (obj) {
      if (obj.target === element) {
        functions.push(obj.fn);
      }
    });

    return functions;
  },


  /**
   * The window uses `pageXOffset` and `pageYOffset` while regular elements use
   * `scrollLeft` and `scrollTop`.
   * @param {Element|Window} target The element which scrolled.
   * @return {{top: number, left: number}}
   * @private
   */
  _getScrollPosition: function _getScrollPosition(target) {
    var top = void 0;
    var left = void 0;

    // If this is a document or window, get the offset from the window.
    if (isWindow(target)) {
      // IE9+ have pageYOffset and pageXOffset.
      top = window.pageYOffset;
      left = window.pageXOffset;
    } else {
      top = target.scrollTop;
      left = target.scrollLeft;
    }

    return {
      top: top,
      left: left
    };
  },


  /**
   * Calls all handlers for a give target with the target's new scroll top
   * value.
   * @param {Element} target Element which was scrolled.
   * @private
   */
  _callListeners: function _callListeners(target) {
    var scroll = this._getScrollPosition(target);

    // Find all listeners tied to the element which is currently scrolling.
    var listeners = this._getListenersForTarget(target);
    for (var i = 0, len = listeners.length; i < len; i++) {
      listeners[i](scroll.top, scroll.left);
    }

    // Remove the request id, meaning this request has finished.
    this._targets.set(target, null);
  },


  /**
   * Handles scroll events on an element. It uses request animation frame
   * to execute the real handlers only once per frame.
   * @param {Event} evt Event object.
   * @private
   */
  _handleTargetScrolled: function _handleTargetScrolled(evt) {
    var target = /** @type {Element|Window} */evt.currentTarget;

    // Cancel the last request animation frame if it hasn't executed yet.
    if (this._targets.get(target)) {
      cancelAnimationFrame(this._targets.get(target));
    }

    // Request a new animation frame.
    var requestId = requestAnimationFrame(this._callListeners.bind(this, target));
    this._targets.set(target, requestId);
  },


  /**
   * Adds a scroll listener to a target.
   * @param {Element|Window} target Element.
   * @private
   */
  _register: function _register(target) {
    target.addEventListener('scroll', this._onScroll, false);
    this._targets.set(target, null);
  },


  /**
   * Remove the scroll listener and target from the map.
   * @param {Element} target Target element.
   * @private
   */
  _unregister: function _unregister(target) {
    target.removeEventListener('scroll', this._onScroll, false);
    this._targets.delete(target);
  },


  /**
   * Add a new scroll listener to an optional target. Defaults to when the
   * page is scrolled.
   * @param {Element|Window|function(number):void} target Optional element. Default = window.
   * @param {function(number):void} [fn] Callback method with the new scroll top
   *     value as the first parameter.
   * @return {string} Id to unbind with.
   */
  add: function add(target, fn) {
    // Assume the window/document should be the scroll target if none is provided.
    if (typeof target === 'function') {
      fn = target; // eslint-disable-line no-param-reassign
      target = window; // eslint-disable-line no-param-reassign
    }

    // Attach events to the window instead of the document.
    if (isDocument(target)) {
      target = window; // eslint-disable-line no-param-reassign
    }

    if (!target || !target.addEventListener) {
      throw new TypeError('OdoScrollAnimation: "' + target + '" is not an Element, Document, or Window');
    }

    if (typeof fn !== 'function') {
      throw new TypeError('OdoScrollAnimation: "' + fn + '" is not a function');
    }

    // Check if this target already has a scroll listener.
    if (!this._targets.has(target)) {
      this._register(target);
    }

    var id = uniqueId();

    this._listeners.set(id, {
      target: target,
      fn: fn
    });

    return id;
  },


  /**
   * Remove a scroll listener by id.
   * @param {string} id The id returned from adding it.
   */
  remove: function remove(id) {
    var listener = this._listeners.get(id);
    if (listener) {
      var listeners = this._getListenersForTarget(listener.target);

      // If this listener is the last one listening to this target, unbind
      // the scroll event from it.
      if (listeners.length === 1) {
        this._unregister(listener.target);
      }

      this._listeners.delete(id);
    }
  }
};

// Proxied functions are different every time they are created. To be able to
// remove the same handler, the context is bound here instead of inside `add`.
service._onScroll = service._handleTargetScrolled.bind(service);

return service;

})));
//# sourceMappingURL=odo-scroll-animation.js.map
