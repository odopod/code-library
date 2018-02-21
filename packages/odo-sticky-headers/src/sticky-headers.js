import OdoWindowEvents from '@odopod/odo-window-events';
import OdoScrollAnimation from '@odopod/odo-scroll-animation';
import StickyItem from './sticky-item';

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

class StickyHeaders {
  /**
   * Create a new Sticky instance.
   * @constructor
   */
  constructor() {
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
     * Custom overlap getter. Can be overridden by setting `uiOverlap`.
     * @type {?function}
     * @private
     */
    this._customOverlap = null;

    /**
     * Custom offset getter. Can be overridden by setting `uiOffset`.
     * @type {?function}
     * @private
     */
    this._customOffset = null;

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
  add(element) {
    const elements = Array.isArray(element) ? element : [element];

    elements.forEach((element) => {
      if (!isElement(element)) {
        throw new TypeError(`StickyHeaders requires an element. Got: "${element}"`);
      }

      // Avoid adding duplicate items.
      if (!this.items.has(element)) {
        this.items.set(element, new StickyItem(element));
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
  }

  /**
   * Stop tracking a sticky item.
   * @param {Element} element Element which was added to the sticky headers.
   */
  remove(element) {
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
  }

  /**
   * On every scroll event, push or stack sticky headers, depending on the mode.
   * @param {number} scrollTop Page scroll position.
   */
  process(scrollTop = window.pageYOffset) {
    if (this.mode === StickyHeaders.Mode.STACK) {
      this._processStack(scrollTop);
    } else {
      this._processPush(scrollTop);
    }
  }

  /**
   * Depending on the position of the viewport, make sticky headers position
   * fixed. If multiple sticky headers are "fixed", they will stack on each other.
   * @param {number} scrollTop Page scroll position.
   */
  _processStack(scrollTop) {
    this._orderedItems.forEach((item) => {
      // Because the stack height can change inside the loop, it must be updated.
      const stackHeight = this._getStackHeight();
      const top = scrollTop + this._overlap + stackHeight;

      if (!item.isFixed && top >= item.top) {
        item.stick(this._startingOffset + stackHeight, this._holder);
      } else if (item.isFixed && top < item.top + item.height) {
        item.unstick();
      }
    });
  }

  /**
   * Like the Contacts app on iPhone, as new headers come into view, they "push"
   * out the old header and then become stuck at the top until its section has
   * been scrolled through.
   * @param {number} scrollTop Page scroll position.
   */
  _processPush(scrollTop) {
    const top = scrollTop + this._overlap;

    this._orderedItems.forEach((item) => {
      // Stick (position fixed).
      if (!item.isFixed && top >= item.top && top < item.bottom) {
        item.stick(this._startingOffset, this._holder);

      // Affix. Item has reached the end of its view-length, stick it to the bottom.
      } else if (!item.isAtBottom && top >= item.bottom) {
        item.stickToBottom(item.bottom);

      // Above the position where the sticky element should be position fixed, so unstick it.
      } else if (item.isFixed && top < item.top) {
        item.unstick();
      }

      this._itemPositionCouldChange(item, top);
    });
  }

  /**
   * Sort items by their position on the page.
   * @return {StickyItem[]} Sorted array of StickyItems.
   */
  _sortItemsByOffset() {
    return Array.from(this.items.values()).sort((a, b) => a.top - b.top);
  }

  /**
   * Add up the heights of all the currrently "stacked" sticky items.
   * @return {number}
   */
  _getStackHeight() {
    return this._orderedItems.reduce((h, i) => (i.isFixed ? h + i.height : h), 0);
  }

  /**
   * When the sticky-element's position is soon going to change, promote it to a
   * new layer so that the browser does not have to paint it on every scroll.
   * Having the sticky-element layer promoted all the time is inefficient and greedy.
   * @param {StickyItem} item Item to check.
   * @param {number} top Current top position (with any overlap).
   */
  _itemPositionCouldChange(item, top) {
    const isInRange = withinRange(top, item.top, item.bottom, StickyHeaders.PROMOTION_RANGE);
    if (!item.isPromoted && isInRange) {
      item.layerPromote();
    } else if (item.isPromoted && !isInRange) {
      item.layerDemote();
    }
  }

  /**
   * Cache values so they don't need to be queried on scroll.
   */
  _cacheStyles() {
    this._overlap = this.uiOverlap;
    this._startingOffset = this.uiOffset;
    this._cacheItemValues();
  }

  /**
   * Cache values related to sticky items.
   */
  _cacheItemValues() {
    this._orderedItems = this._sortItemsByOffset();

    if (this.mode === StickyHeaders.Mode.PUSH) {
      this._saveBottomPositionForItems();
    }
  }

  /**
   * Determine the page offset at which each item should become position absolute.
   */
  _saveBottomPositionForItems() {
    this._orderedItems.forEach((item, i, array) => {
      const next = array[i + 1];
      item.bottom = (next && next.top - item.height) || StickyHeaders.LAST_ITEM_BOTTOM;
    });
  }

  /**
   * Re-cache element positions and reposition all sticky headers.
   */
  update() {
    this.items.forEach((item) => {
      item.unstick();
    });

    this.items.forEach((item) => {
      item.update();
    });

    this._cacheStyles();

    this.process();
  }

  /**
   * The amount that the ui overlaps the top of the page. A sticky navigation,
   * for example, would cause an overlap equal to its height.
   * @return {number}
   */
  get uiOverlap() {
    if (this._customOverlap) {
      return this._customOverlap();
    }

    return 0;
  }

  /**
  * Define a custom getter to determine overlap.
  * @param {function():number} fn
  */
  set uiOverlap(fn) {
    this._customOverlap = fn;
    this.update();
  }

  /**
  * Where to start positioning new sticky items. By default it's the same as
  * the ui overlap, but can be customized.
  * @return {number}
  */
  get uiOffset() {
    if (this._customOffset) {
      return this._customOffset();
    }

    return this.uiOverlap;
  }

  /**
   * Define a custom getter to determine offset.
   * @param {function():number} fn
   */
  set uiOffset(fn) {
    this._customOffset = fn;
  }

  /**
   * The location of sticky elements to be placed in the DOM.
   * @return {?Element}
   */
  get stickyHolder() {
    return this._holder;
  }

  /**
   * Set the location of sticky elements to be placed in the DOM.
   * @param {?Element} element Element which sticky items will be appended to.
   */
  set stickyHolder(element) {
    this._holder = isElement(element) ? element : null;
  }

  /**
   * Retrieve the current mode of StickyHeaders.
   * @return {StickyHeaders.Mode}
   */
  get mode() {
    return this._mode;
  }

  /**
   * Change how the service treats multiple sticky items.
   * @param {StickyHeaders.Mode} mode A mode.
   */
  set mode(mode) {
    this._mode = mode;
  }

  /**
   * Remove element references and event listeners.
   */
  dispose() {
    this.items.forEach((item, element) => {
      this.remove(element);
    });

    this._orderedItems.length = 0;
  }
}

StickyHeaders.PROMOTION_RANGE = 200;
StickyHeaders.LAST_ITEM_BOTTOM = Infinity;

StickyHeaders.Mode = {
  PUSH: 1,
  STACK: 2,
};

StickyHeaders.StickyItem = StickyItem;

export default StickyHeaders;
