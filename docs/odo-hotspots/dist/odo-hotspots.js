(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('tiny-emitter')) :
	typeof define === 'function' && define.amd ? define(['tiny-emitter'], factory) :
	(global.OdoHotspots = factory(global.TinyEmitter));
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

var settings = {
  ClassName: {
    HOTSPOT: 'odo-hotspot',
    HOTSPOT_LEFT: 'odo-hotspot--left',
    HOTSPOT_RIGHT: 'odo-hotspot--right',
    HOTSPOT_TOP: 'odo-hotspot--top',
    HOTSPOT_BOTTOM: 'odo-hotspot--bottom',
    BUTTON: 'odo-hotspot__button',
    CONTENT: 'odo-hotspot__content',
    LOADED: 'is-loaded',
    OPEN: 'is-open'
  },

  EventType: {
    INITIALIZED: 'odohotspotsinitialized',
    WILL_OPEN: 'odohotspotswillopen',
    WILL_CLOSE: 'odohotspotswillclose'
  }
};

var count = 0;
function setUniqueId(element) {
  if (!element.id) {
    count += 1;
    element.id = "odo-hotspots" + count;
  }
}

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

var Hotspot = function () {
  /**
   * The hotspot class represents a single hotspot.
   * @param {Element} element Main wrapper element for the hotspot.
   * @param {Hotspots} parent A reference to the parent class.
   * @constructor
   */
  function Hotspot(element, parent) {
    classCallCheck(this, Hotspot);

    this.parent = parent;
    this.isOpen = false;
    this.wrapper = element;
    this.button = element.querySelector('.' + settings.ClassName.BUTTON);
    this.content = element.querySelector('.' + settings.ClassName.CONTENT);
    this.percentPosition = this.parseWrapperPosition();
    this.size = this.getContentSize();
    this.side = this.getSide();
    this.anchor = this.getAnchor();
    this.position = this.getWrapperPosition();
  }

  /**
   * Converts the data-position="x,y" attribute to an object with x and y properties.
   * @return {{x: number, y: number}}
   */


  Hotspot.prototype.parseWrapperPosition = function parseWrapperPosition() {
    var positions = this.wrapper.getAttribute('data-position').split(',');
    return {
      x: parseInt(positions[0], 10),
      y: parseInt(positions[1], 10)
    };
  };

  /**
   * Returns the width and height of the content element.
   * @return {{width: number, height: number}}
   */


  Hotspot.prototype.getContentSize = function getContentSize() {
    return {
      width: this.content.offsetWidth,
      height: this.content.offsetHeight
    };
  };

  /**
   * Returns the class name of the side the hotspot should go to. If it doesn't
   * have a side, a side will be calculated for it.
   * @return {?string}
   */


  Hotspot.prototype.getSide = function getSide() {
    if (this.wrapper.classList.contains(settings.ClassName.HOTSPOT_LEFT)) {
      return settings.ClassName.HOTSPOT_LEFT;
    } else if (this.wrapper.classList.contains(settings.ClassName.HOTSPOT_RIGHT)) {
      return settings.ClassName.HOTSPOT_RIGHT;
    }
    return null;
  };

  /**
   * Returns the class name of the anchor the hotspot should go to. If it doesn't
   * have a anchor, a anchor will be calculated for it.
   * @return {?string}
   */


  Hotspot.prototype.getAnchor = function getAnchor() {
    if (this.wrapper.classList.contains(settings.ClassName.HOTSPOT_TOP)) {
      return settings.ClassName.HOTSPOT_TOP;
    } else if (this.wrapper.classList.contains(settings.ClassName.HOTSPOT_BOTTOM)) {
      return settings.ClassName.HOTSPOT_BOTTOM;
    }
    return null;
  };

  /**
   * Updates the position and size of the hotspot.
   */


  Hotspot.prototype.refresh = function refresh() {
    var _this = this;

    // Read
    this.size = this.getContentSize();
    this.position = this.getWrapperPosition();

    // Write async so that multiple hotspots can be refreshed at a time without
    // causing layout thrashing.
    this.refreshId = requestAnimationFrame(function () {
      _this._removeContentPosition();
      _this._setContentPosition();
    });
  };

  /**
   * Applies the data-position attribute to the wrapper.
   */


  Hotspot.prototype._setWrapperPosition = function _setWrapperPosition() {
    this.wrapper.style.left = this.percentPosition.x + '%';
    this.wrapper.style.top = this.percentPosition.y + '%';
  };

  /**
   * Returns a rectangle describing the wrapper (not the content).
   * @return {Object}
   */


  Hotspot.prototype.getWrapperPosition = function getWrapperPosition() {
    var left = Math.round(this.parent.size.width * this.percentPosition.x / 100);
    var top = Math.round(this.parent.size.height * this.percentPosition.y / 100);
    var width = Math.round(this.wrapper.offsetWidth);
    var height = Math.round(this.wrapper.offsetHeight);
    return {
      left: left,
      top: top,
      right: left + width,
      bottom: top + height
    };
  };

  /**
   * Determines the side which the hotspot should go to based on the container's
   * width and the width of the hotspot content.
   * @return {string}
   */


  Hotspot.prototype._getOptimalSide = function _getOptimalSide() {
    var side = null;

    var fitsRight = this.position.right + this.size.width <= this.parent.size.width;
    var fitsLeft = this.position.left - this.size.width >= 0;

    // If both or neither fit, choose the side which has more room.
    if (fitsLeft && fitsRight || !fitsLeft && !fitsRight) {
      if (this.percentPosition.x < 50) {
        side = settings.ClassName.HOTSPOT_RIGHT;
      } else {
        side = settings.ClassName.HOTSPOT_LEFT;
      }

      // If only on side fits, then it has to be chosen.
    } else if (fitsRight) {
      side = settings.ClassName.HOTSPOT_RIGHT;
    } else /* fitsLeft */{
        side = settings.ClassName.HOTSPOT_LEFT;
      }

    return side;
  };

  /**
   * Determines the anchor which the hotspot should go to based on the container's
   * height and the height of the hotspot content.
   * @return {string}
   */


  Hotspot.prototype._getOptimalAnchor = function _getOptimalAnchor() {
    var anchor = null;

    var fitsTop = this.position.bottom - this.size.height >= 0;
    var fitsBottom = this.position.top + this.size.height <= this.parent.size.height;

    // If both or neither fit, choose the anchor which has more room.
    if (fitsBottom && fitsTop || !fitsBottom && !fitsTop) {
      if (this.percentPosition.y > 50) {
        anchor = settings.ClassName.HOTSPOT_TOP;
      } else {
        anchor = settings.ClassName.HOTSPOT_BOTTOM;
      }

      // If only on anchor fits, then it has to be chosen.
    } else if (fitsTop) {
      anchor = settings.ClassName.HOTSPOT_TOP;
    } else /* fitsBottom */{
        anchor = settings.ClassName.HOTSPOT_BOTTOM;
      }

    return anchor;
  };

  /**
   * If the hotspot does not have a side or anchor, they will be set for it.
   */


  Hotspot.prototype._setContentPosition = function _setContentPosition() {
    if (this.side === null) {
      this.wrapper.classList.add(this._getOptimalSide());
    }

    if (this.anchor === null) {
      this.wrapper.classList.add(this._getOptimalAnchor());
    }
  };

  /**
   * If the hotspot did not have a side or anchor originally, they will be removed.
   */


  Hotspot.prototype._removeContentPosition = function _removeContentPosition() {
    if (this.side === null) {
      this.wrapper.classList.remove(settings.ClassName.HOTSPOT_LEFT, settings.ClassName.HOTSPOT_RIGHT);
    }

    if (this.anchor === null) {
      this.wrapper.classList.remove(settings.ClassName.HOTSPOT_TOP, settings.ClassName.HOTSPOT_BOTTOM);
    }
  };

  /**
   * Positions the wrapper and the content.
   */


  Hotspot.prototype.setPosition = function setPosition() {
    this._setWrapperPosition();
    this._setContentPosition();
  };

  /**
   * Show the hotspot.
   */


  Hotspot.prototype.show = function show() {
    this.wrapper.classList.add(settings.ClassName.OPEN);
    this.content.setAttribute('aria-hidden', false);
    this.button.setAttribute('aria-describedby', this.content.id);
    this.isOpen = true;
  };

  /**
   * Hide the hotspot.
   */


  Hotspot.prototype.hide = function hide() {
    this.wrapper.classList.remove(settings.ClassName.OPEN);
    this.content.setAttribute('aria-hidden', true);
    this.button.removeAttribute('aria-describedby');
    this.isOpen = false;
  };

  /**
   * Set accessibility attributes so that the implementor doesn't have to worry
   * about it.
   */


  Hotspot.prototype.setA11yAttributes = function setA11yAttributes() {
    setUniqueId(this.content);
    this.content.setAttribute('aria-hidden', true);
    this.content.setAttribute('role', 'tooltip');
  };

  Hotspot.prototype._removeA11yAttributes = function _removeA11yAttributes() {
    this.button.removeAttribute('aria-hidden');
    this.content.removeAttribute('role');
  };

  /**
   * Destroys the hotspot instance. It removes DOM references, classes, and styles
   * set by this class.
   */


  Hotspot.prototype.dispose = function dispose() {
    cancelAnimationFrame(this.refreshId);
    this._removeContentPosition();
    this._removeA11yAttributes();
    this.wrapper.style.left = '';
    this.wrapper.style.top = '';
    this.wrapper = null;
    this.button = null;
    this.content = null;
    this.parent = null;
  };

  return Hotspot;
}();

var Hotspots = function (_TinyEmitter) {
  inherits(Hotspots, _TinyEmitter);

  /**
   * Component which has a draggable element in the middle which reveals one or
   * the other sides as the user drags.
   *
   * @constructor
   */
  function Hotspots(el) {
    classCallCheck(this, Hotspots);

    var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

    _this.element = el;

    _this.size = _this._getContainerSize();
    _this.hotspots = _this._getHotspots();
    _this._noopElement = _this._getFirstBodyDescendant();
    _this._noop = function () {};

    _this._activeHotspot = null;

    _this._bindEvents();

    _this.hotspots.forEach(function (hotspot) {
      hotspot.setA11yAttributes();
      hotspot.setPosition();
    });

    _this.element.classList.add(Hotspots.ClassName.LOADED);
    _this.dispatchEvent(Hotspots.EventType.INITIALIZED);
    return _this;
  }

  /**
   * Scope the query to the main element.
   * @param {string} className Class name of the desired elements.
   * @return {Array.<Element>} An array of elements.
   */


  Hotspots.prototype.getElementsByClass = function getElementsByClass(className) {
    return Array.from(this.element.querySelectorAll('.' + className));
  };

  /**
   * In iOS, event delegation does not work for click events.
   * http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   * @return {?Element} The first child of the body which is a parent of the
   *     main element in this class.
   */


  Hotspots.prototype._getFirstBodyDescendant = function _getFirstBodyDescendant() {
    var element = this.element;

    while (element) {
      var parent = element.parentElement;
      if (parent === document.body) {
        return element;
      }

      element = parent;
    }

    return null;
  };

  /**
   * Creates the hotspot instances.
   * @return {Array.<Hotspot>}
   */


  Hotspots.prototype._getHotspots = function _getHotspots() {
    var _this2 = this;

    return this.getElementsByClass(Hotspots.ClassName.HOTSPOT).map(function (element) {
      return new Hotspot(element, _this2);
    });
  };

  /**
   * Finds the hotspot instance which uses the given wrapper element.
   * @param {Element} wrapper Element.
   * @return {?Hotspot}
   */


  Hotspots.prototype._getHotspotByWrapper = function _getHotspotByWrapper(wrapper) {
    for (var i = 0, len = this.hotspots.length; i < len; i++) {
      if (this.hotspots[i].wrapper === wrapper) {
        return this.hotspots[i];
      }
    }

    return null;
  };

  /**
   * Retrieves the dimensions of the main element.
   * @return {{width: number, height: number}}
   */


  Hotspots.prototype._getContainerSize = function _getContainerSize() {
    return {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight
    };
  };

  /**
   * Triggers a custom event on the main element.
   * @param {string} eventName Name of event.
   * @param {Hotspot} [hotspot] Optional hotspot object.
   * @return {boolean} Whether preventDefault was called on the event.
   */


  Hotspots.prototype.dispatchEvent = function dispatchEvent(eventName, hotspot) {
    var event = {
      defaultPrevented: false,
      preventDefault: function preventDefault() {
        this.defaultPrevented = true;
      }
    };

    if (hotspot) {
      event.hotspot = hotspot;
    }

    this.emit(eventName, event);
    return event.defaultPrevented;
  };

  /**
   * Add event listeners.
   */


  Hotspots.prototype._bindEvents = function _bindEvents() {
    var _this3 = this;

    this._clickHandler = this._handleHotspotClick.bind(this);
    this._resizeHandler = debounce(this._handleResize.bind(this), 200);
    this._loadHandler = this._handleLoad.bind(this);
    this._outerClickHandler = this._handleOuterClick.bind(this);

    window.addEventListener('resize', this._resizeHandler, false);
    window.addEventListener('load', this._loadHandler, false);

    this.hotspots.forEach(function (hotspot) {
      hotspot.button.addEventListener('click', _this3._clickHandler, false);
    });
  };

  /**
   * Closes all open hotspots so that only one can be open at a time.
   */


  Hotspots.prototype.closeAllHotspots = function closeAllHotspots() {
    var _this4 = this;

    this.hotspots.forEach(function (hotspot) {
      _this4.closeHotspot(hotspot);
    });
  };

  /**
   * Toggles the display of a hotspot.
   * @param {Hotspot} hotspot Hotspot to toggle.
   */


  Hotspots.prototype.toggleHotspot = function toggleHotspot(hotspot) {
    if (hotspot.isOpen) {
      this.closeHotspot(hotspot);
    } else {
      this.openHotspot(hotspot);
    }
  };

  /**
   * Attempts to show the hotspot. It will emit an event which, if preventDefault
   * is called on, can be canceled.
   * @param {Hotspot} hotspot Hotspot to open.
   */


  Hotspots.prototype.openHotspot = function openHotspot(hotspot) {
    var _this5 = this;

    // If preventDefault is called on this event, do not open the hotspot.
    if (hotspot.isOpen || this.dispatchEvent(Hotspots.EventType.WILL_OPEN, hotspot)) {
      return;
    }

    this.closeAllHotspots();
    hotspot.show();
    this.setActiveHotspot(hotspot);

    // Listen for clicks outside the hotspot which will close it.
    // In a timeout so that a click on the hotspot button doesn't bubble
    // up to the body and register as a click outside the hotspot.
    setTimeout(function () {
      _this5._listenForOuterClicks();
    }, 0);
  };

  /**
   * Attempts to hide the hotspot. It will emit an event which, if preventDefault
   * is called on, can be canceled.
   * @param {Hotspot} hotspot Hotspot to close.
   */


  Hotspots.prototype.closeHotspot = function closeHotspot(hotspot) {
    // If preventDefault is called on this event, do not close the hotspot.
    if (!hotspot.isOpen || this.dispatchEvent(Hotspots.EventType.WILL_CLOSE, hotspot)) {
      return;
    }

    hotspot.hide();
    this.setActiveHotspot(null);
    this._removeOuterClick();
  };

  /**
   * Bind a click listener to the body which closes any active hotspots if the
   * user clicked outside of the current hotspot. This method also adds a no-op
   * event lister to the first child of the body that is a parent of this module.
   * This is due to a bug in iOS where click events do not bubble properly.
   * The no-op element's tap highlight color is also set to transparent because
   * it would show the default color on tap because it has a click handler.
   */


  Hotspots.prototype._listenForOuterClicks = function _listenForOuterClicks() {
    this._noopElement.addEventListener('click', this._noop, false);
    this._noopElement.style.WebkitTapHighlightColor = 'transparent';
    document.body.addEventListener('click', this._outerClickHandler, false);
  };

  /**
   * Remove the delegated click listeners and tap highlight color.
   */


  Hotspots.prototype._removeOuterClick = function _removeOuterClick() {
    this._noopElement.removeEventListener('click', this._noop, false);
    this._noopElement.style.WebkitTapHighlightColor = '';
    document.body.removeEventListener('click', this._outerClickHandler, false);
  };

  /**
   * Listener for clicks on the button inside the hotspot and toggles the hotspot's state.
   * @param {Event} evt Click event object.
   */


  Hotspots.prototype._handleHotspotClick = function _handleHotspotClick(evt) {
    evt.preventDefault();
    var hotspot = this._getHotspotByWrapper(evt.currentTarget.parentElement);
    this.toggleHotspot(hotspot);
  };

  /**
   * When a hotspot is open, this handler is active. If the user clicks outside
   * the hotspot, it will be closed.
   * @param {Event} evt Click event object.
   */


  Hotspots.prototype._handleOuterClick = function _handleOuterClick(evt) {
    if (!this.getActiveHotspot().content.contains(evt.target)) {
      this.closeHotspot(this.getActiveHotspot());
    }
  };

  /**
   * When the window size changes, recalculate things.
   */


  Hotspots.prototype._handleResize = function _handleResize() {
    this.refresh();
  };

  /**
   * Refresh when the page has finished loading. There are likely images within
   * the hotspot content which may now have a width/height which affects the
   * size of the hotspot content.
   */


  Hotspots.prototype._handleLoad = function _handleLoad() {
    window.removeEventListener('load', this._loadHandler, false);
    this.refresh();
  };

  /**
   * Returns the currently open hotspot or null if none are open.
   * @return {?Hotspot}
   */


  Hotspots.prototype.getActiveHotspot = function getActiveHotspot() {
    return this._activeHotspot;
  };

  /**
   * Update the active hotspot property.
   * @param {Hotspot} hotspot
   */


  Hotspots.prototype.setActiveHotspot = function setActiveHotspot(hotspot) {
    this._activeHotspot = hotspot;
  };

  /**
   * Recalculates offsets and sizes.
   */


  Hotspots.prototype.refresh = function refresh() {
    this.size = this._getContainerSize();
    this.hotspots.forEach(function (hotspot) {
      hotspot.refresh();
    });
  };

  /**
   * Remove event listeners and DOM references.
   */


  Hotspots.prototype.dispose = function dispose() {
    var _this6 = this;

    this.closeAllHotspots();

    this.hotspots.forEach(function (hotspot) {
      hotspot.button.removeEventListener('click', _this6._clickHandler, false);
      hotspot.dispose();
    });

    this.hotspots = null;

    window.removeEventListener('load', this._loadHandler, false);
    window.removeEventListener('resize', this._resizeHandler, false);

    this.element.classList.remove(Hotspots.ClassName.LOADED);

    this.element = null;
    this._activeHotspot = null;
    this._noopElement = null;
  };

  return Hotspots;
}(TinyEmitter);

Object.assign(Hotspots, settings);

return Hotspots;

})));
//# sourceMappingURL=odo-hotspots.js.map
