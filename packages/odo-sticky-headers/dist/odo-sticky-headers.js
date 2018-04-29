(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-window-events'), require('@odopod/odo-scroll-animation')) :
  typeof define === 'function' && define.amd ? define(['@odopod/odo-window-events', '@odopod/odo-scroll-animation'], factory) :
  (global.OdoStickyHeaders = factory(global.OdoWindowEvents,global.OdoScrollAnimation));
}(this, (function (OdoWindowEvents,OdoScrollAnimation) { 'use strict';

  OdoWindowEvents = OdoWindowEvents && OdoWindowEvents.hasOwnProperty('default') ? OdoWindowEvents['default'] : OdoWindowEvents;
  OdoScrollAnimation = OdoScrollAnimation && OdoScrollAnimation.hasOwnProperty('default') ? OdoScrollAnimation['default'] : OdoScrollAnimation;

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
   * @fileoverview This class describes a sticky header element. It caches the
   * offsets for the element and has methods to stick, affix, and unstick the
   * sticky element.
   */

  function applyCss(element, css) {
    Object.keys(css).forEach(function (property) {
      element.style[property] = css[property];
    });
  }

  var StickyItem = function () {
    /**
     * Create a new sticky item.
     * @param {Element} element Element to stick.
     * @constructor
     */
    function StickyItem(element) {
      classCallCheck(this, StickyItem);

      /**
       * Main sticky element.
       * @type {Element}
       */
      this.element = element;

      /**
       * Whether the element is position:fixed.
       * @type {boolean}
       */
      this.isFixed = false;

      /**
       * Whether the element is affixed to the bottom.
       * @type {boolean}
       */
      this.isAtBottom = false;

      /**
       * Whether the element is layer promoted.
       * @type {boolean}
       */
      this.isPromoted = false;

      this._wrapStickyElement();
      this.update();
    }

    /**
     * Initialize by wrapping in an element to take up space while the main
     * element is positin:fixed.
     * @private
     */


    StickyItem.prototype._wrapStickyElement = function _wrapStickyElement() {
      this.wrapper = document.createElement('div');
      this.wrapper.className = StickyItem.Classes.WRAPPER;
      this.element.parentNode.insertBefore(this.wrapper, this.element);

      applyCss(this.element, {
        position: StickyItem.INITIAL_POSITION,
        zIndex: 1,
        top: 0,
        left: 0,
        width: '100%',
        overflow: 'hidden'
      });

      this.element.classList.add(StickyItem.Classes.IS_AT_TOP);
      this.wrapper.appendChild(this.element);
    };

    /**
     * Remove the placeholder element added when this sticky item is initialized.
     * @private
     */


    StickyItem.prototype._unwrapStickyElement = function _unwrapStickyElement() {
      var container = this.wrapper.parentNode;
      container.appendChild(this.element);
      container.removeChild(this.wrapper);
    };

    /**
     * Save the dimensions of the sticky item.
     */


    StickyItem.prototype.update = function update() {
      var rect = this.element.getBoundingClientRect();
      this.top = rect.top + window.pageYOffset;
      this.height = Math.round(rect.height);
    };

    /**
     * Stick the sticky item to a specific value.
     * @param {number} stackHeight The current stack height of sticky elements.
     * @param {Element} [parent] Optional element to put the sticky within.
     */


    StickyItem.prototype.stick = function stick(stackHeight, parent) {
      this.wrapper.style.height = this.height + 'px';
      this.element.style.position = 'fixed';
      this.element.style.top = stackHeight + 'px';
      this.element.classList.add(StickyItem.Classes.IS_FIXED);
      this.element.classList.remove(StickyItem.Classes.IS_AT_BOTTOM);
      this.element.classList.remove(StickyItem.Classes.IS_AT_TOP);

      if (parent) {
        parent.appendChild(this.element);
      }

      this.isAtBottom = false;
      this.isFixed = true;
    };

    /**
     * Remove stickiness of sticky item.
     */


    StickyItem.prototype.unstick = function unstick() {
      this.wrapper.style.height = '';
      this.element.style.position = StickyItem.INITIAL_POSITION;
      this.element.style.top = '';
      this.element.classList.add(StickyItem.Classes.IS_AT_TOP);
      this.element.classList.remove(StickyItem.Classes.IS_FIXED);
      this.element.classList.remove(StickyItem.Classes.IS_AT_BOTTOM);

      if (this.element.parentNode !== this.wrapper) {
        this.wrapper.appendChild(this.element);
      }

      this.isFixed = false;
      this.isAtBottom = false;
    };

    StickyItem.prototype.stickToBottom = function stickToBottom(placement) {
      this.element.style.position = 'absolute';
      this.element.style.top = placement + 'px';
      this.element.classList.add(StickyItem.Classes.IS_AT_BOTTOM);
      this.element.classList.remove(StickyItem.Classes.IS_FIXED);
      this.element.classList.remove(StickyItem.Classes.IS_AT_TOP);

      // When the sticky is position absolute, it has to be absolute relative
      // to the page, not another fixed-position element.
      document.body.appendChild(this.element);

      this.isFixed = false;
      this.isAtBottom = true;
    };

    /**
     * Add styles which will put the affix-element in a new layer.
     */


    StickyItem.prototype.layerPromote = function layerPromote() {
      this.element.style.willChange = 'position';
      this.element.style.transform = 'translateZ(0)';
      this.isPromoted = true;
    };

    /**
     * Remove styles which cause layer promotion.
     */


    StickyItem.prototype.layerDemote = function layerDemote() {
      this.element.style.willChange = '';
      this.element.style.transform = '';
      this.isPromoted = false;
    };

    /**
     * Get rid of this sticky item instance.
     */


    StickyItem.prototype.dispose = function dispose() {
      this.unstick();
      this._unwrapStickyElement();

      applyCss(this.element, {
        position: '',
        zIndex: '',
        top: '',
        left: '',
        width: '',
        overflow: '',
        willChange: '',
        transform: ''
      });

      this.element = null;
      this.wrapper = null;
    };

    return StickyItem;
  }();

  StickyItem.INITIAL_POSITION = 'relative';

  StickyItem.Classes = {
    BASE: 'odo-sticky-headers__item',
    WRAPPER: 'odo-sticky-headers__item-wrapper',
    IS_FIXED: 'is-fixed',
    IS_AT_TOP: 'is-at-top',
    IS_AT_BOTTOM: 'is-at-bottom'
  };

  /**
   * Whether the given thing is an element.
   * @param {*} thing Thing to test.
   * @return {boolean}
   */
  function isElement(thing) {
    return thing && thing.nodeType === 1;
  }

  function withinRange(value, min, max, threshold) {
    return value >= min - threshold && value <= max + threshold;
  }

  var StickyHeaders = function () {
    /**
     * Create a new Sticky instance.
     * @constructor
     */
    function StickyHeaders() {
      classCallCheck(this, StickyHeaders);

      /**
       * Mapping of elements to StickyItem instances.
       * @type {Map.<Element, StickyItem>}
       */
      this.items = new Map();

      /**
       * Items sorted in order they appear on the page.
       * @type {Array}
       */
      this._orderedItems = [];

      /**
       * Scroll event listener id.
       * @type {?string}
       */
      this._scrollId = null;

      /**
       * Window resize id.
       * @type {?string}
       * @private
       */
      this._resizeId = null;

      /**
       * The amount that the ui overlaps the top of the page.
       * @type {number}
       * @private
       */
      this._overlap = 0;

      /**
       * Where to start positioning new sticky items.
       * @type {number}
       * @private
       */
      this._startingOffset = 0;

      /**
       * Element which holds sticky elements.
       * @type {Element}
       * @private
       */
      this._holder = null;

      /**
       * The amount that the ui overlaps the top of the page. A sticky navigation,
       * for example, would cause an overlap equal to its height.
       * @type {function():number}
       * @private
       */
      this._getUiOverlap = function () {
        return 0;
      };

      /**
       * Where to start positioning new sticky items. By default it's the same as
       * the ui overlap, but can be customized.
       * @type {function():number}
       * @private
       */
      this._getUiOffset = this._getUiOverlap;

      /**
       * Which mode to handle sticky headers.
       * @type {StickyHeaders.Mode}
       * @private
       */
      this._mode = StickyHeaders.Mode.PUSH;
    }

    /**
     * Track a sticky item.
     * @param {Element[]|Element} element An array of elements or a single
     *    element which will become sticky.
     * @return {Element} The key to the items map for this new StickyItem.
     */


    StickyHeaders.prototype.add = function add(element) {
      var _this = this;

      var elements = Array.isArray(element) ? element : [element];

      elements.forEach(function (element) {
        if (!isElement(element)) {
          throw new TypeError('StickyHeaders requires an element. Got: "' + element + '"');
        }

        // Avoid adding duplicate items.
        if (!_this.items.has(element)) {
          _this.items.set(element, new StickyItem(element));
        }
      });

      // Add event listeners if they aren't already added.
      if (this._scrollId) {
        this._cacheItemValues();
      } else {
        this._resizeId = OdoWindowEvents.onResize(this.update.bind(this));
        this._scrollId = OdoScrollAnimation.add(this.process.bind(this));
        this._cacheStyles();
      }

      this.process();

      return element;
    };

    /**
     * Stop tracking a sticky item.
     * @param {Element} element Element which was added to the sticky headers.
     */


    StickyHeaders.prototype.remove = function remove(element) {
      if (this.items.has(element)) {
        this.items.get(element).dispose();
        this.items.delete(element);

        // Remove event listeners when there aren't any instances to watch.
        if (this.items.size === 0) {
          OdoScrollAnimation.remove(this._scrollId);
          OdoWindowEvents.remove(this._resizeId);
          this._scrollId = null;
          this._resizeId = null;
        }
      }
    };

    /**
     * On every scroll event, push or stack sticky headers, depending on the mode.
     * @param {number} [scrollTop=window.pageYoffset] Page scroll position.
     */


    StickyHeaders.prototype.process = function process() {
      var scrollTop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.pageYOffset;

      if (this.mode === StickyHeaders.Mode.STACK) {
        this._processStack(scrollTop);
      } else {
        this._processPush(scrollTop);
      }
    };

    /**
     * Depending on the position of the viewport, make sticky headers position
     * fixed. If multiple sticky headers are "fixed", they will stack on each other.
     * @param {number} scrollTop Page scroll position.
     */


    StickyHeaders.prototype._processStack = function _processStack(scrollTop) {
      var _this2 = this;

      this._orderedItems.forEach(function (item) {
        // Because the stack height can change inside the loop, it must be updated.
        var stackHeight = _this2._getStackHeight();
        var top = scrollTop + _this2._overlap + stackHeight;

        if (!item.isFixed && top >= item.top) {
          item.stick(_this2._startingOffset + stackHeight, _this2._holder);
        } else if (item.isFixed && top < item.top + item.height) {
          item.unstick();
        }
      });
    };

    /**
     * Like the Contacts app on iPhone, as new headers come into view, they "push"
     * out the old header and then become stuck at the top until its section has
     * been scrolled through.
     * @param {number} scrollTop Page scroll position.
     */


    StickyHeaders.prototype._processPush = function _processPush(scrollTop) {
      var _this3 = this;

      var top = scrollTop + this._overlap;

      this._orderedItems.forEach(function (item) {
        // Stick (position fixed).
        if (!item.isFixed && top >= item.top && top < item.bottom) {
          item.stick(_this3._startingOffset, _this3._holder);

          // Affix. Item has reached the end of its view-length, stick it to the bottom.
        } else if (!item.isAtBottom && top >= item.bottom) {
          item.stickToBottom(item.bottom);

          // Above the position where the sticky element should be position fixed, so unstick it.
        } else if (item.isFixed && top < item.top) {
          item.unstick();
        }

        _this3._itemPositionCouldChange(item, top);
      });
    };

    /**
     * Sort items by their position on the page.
     * @return {StickyItem[]} Sorted array of StickyItems.
     */


    StickyHeaders.prototype._sortItemsByOffset = function _sortItemsByOffset() {
      return Array.from(this.items.values()).sort(function (a, b) {
        return a.top - b.top;
      });
    };

    /**
     * Add up the heights of all the currrently "stacked" sticky items.
     * @return {number}
     */


    StickyHeaders.prototype._getStackHeight = function _getStackHeight() {
      return this._orderedItems.reduce(function (h, i) {
        return i.isFixed ? h + i.height : h;
      }, 0);
    };

    /**
     * When the sticky-element's position is soon going to change, promote it to a
     * new layer so that the browser does not have to paint it on every scroll.
     * Having the sticky-element layer promoted all the time is inefficient and greedy.
     * @param {StickyItem} item Item to check.
     * @param {number} top Current top position (with any overlap).
     */


    StickyHeaders.prototype._itemPositionCouldChange = function _itemPositionCouldChange(item, top) {
      var isInRange = withinRange(top, item.top, item.bottom, StickyHeaders.PROMOTION_RANGE);
      if (!item.isPromoted && isInRange) {
        item.layerPromote();
      } else if (item.isPromoted && !isInRange) {
        item.layerDemote();
      }
    };

    /**
     * Cache values so they don't need to be queried on scroll.
     */


    StickyHeaders.prototype._cacheStyles = function _cacheStyles() {
      this._overlap = this._getUiOverlap();
      this._startingOffset = this._getUiOffset();
      this._cacheItemValues();
    };

    /**
     * Cache values related to sticky items.
     */


    StickyHeaders.prototype._cacheItemValues = function _cacheItemValues() {
      this._orderedItems = this._sortItemsByOffset();

      if (this.mode === StickyHeaders.Mode.PUSH) {
        this._saveBottomPositionForItems();
      }
    };

    /**
     * Determine the page offset at which each item should become position absolute.
     */


    StickyHeaders.prototype._saveBottomPositionForItems = function _saveBottomPositionForItems() {
      this._orderedItems.forEach(function (item, i, array) {
        var next = array[i + 1];
        item.bottom = next && next.top - item.height || StickyHeaders.LAST_ITEM_BOTTOM;
      });
    };

    /**
     * Re-cache element positions and reposition all sticky headers.
     */


    StickyHeaders.prototype.update = function update() {
      this.items.forEach(function (item) {
        item.unstick();
      });

      this.items.forEach(function (item) {
        item.update();
      });

      this._cacheStyles();

      this.process();
    };

    /**
     * TODO(glen): remove getter/setter.
     * @return {function():number}
     */


    /**
     * Remove element references and event listeners.
     */
    StickyHeaders.prototype.dispose = function dispose() {
      var _this4 = this;

      this.items.forEach(function (item, element) {
        _this4.remove(element);
      });

      this._orderedItems.length = 0;
    };

    createClass(StickyHeaders, [{
      key: 'uiOverlap',
      get: function get$$1() {
        return this._getUiOverlap;
      }

      /**
      * Define a custom getter to determine overlap.
      * @param {function():number} fn
      */
      ,
      set: function set$$1(fn) {
        this._getUiOverlap = fn;
        this.update();
      }

      /**
       * TODO(glen): remove getter/setter.
      * @return {function():number}
      */

    }, {
      key: 'uiOffset',
      get: function get$$1() {
        return this._getUiOffset;
      }

      /**
       * Define a custom getter to determine offset.
       * @param {function():number} fn
       */
      ,
      set: function set$$1(fn) {
        this._getUiOffset = fn;
      }

      /**
       * The location of sticky elements to be placed in the DOM.
       * @return {?Element}
       */

    }, {
      key: 'stickyHolder',
      get: function get$$1() {
        return this._holder;
      }

      /**
       * Set the location of sticky elements to be placed in the DOM.
       * @param {?Element} element Element which sticky items will be appended to.
       */
      ,
      set: function set$$1(element) {
        this._holder = isElement(element) ? element : null;
      }

      /**
       * Retrieve the current mode of StickyHeaders.
       * @return {StickyHeaders.Mode}
       */

    }, {
      key: 'mode',
      get: function get$$1() {
        return this._mode;
      }

      /**
       * Change how the service treats multiple sticky items.
       * @param {StickyHeaders.Mode} mode A mode.
       */
      ,
      set: function set$$1(mode) {
        this._mode = mode;
      }
    }]);
    return StickyHeaders;
  }();

  StickyHeaders.PROMOTION_RANGE = 200;
  StickyHeaders.LAST_ITEM_BOTTOM = Infinity;

  StickyHeaders.Mode = {
    PUSH: 1,
    STACK: 2
  };

  StickyHeaders.StickyItem = StickyItem;

  return StickyHeaders;

})));
//# sourceMappingURL=odo-sticky-headers.js.map
