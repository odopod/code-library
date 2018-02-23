import OdoWindowEvents from '@odopod/odo-window-events';
import ViewportItem from './viewport-item';

let instance = null;

function inRange(value, min, max) {
  return min <= value && value <= max;
}

class Viewport {
  /**
   * Viewport singleton.
   * @constructor
   */
  constructor() {
    this.addId = null;
    this.hasActiveHandlers = false;
    this.items = new Map();

    // Assume there is no horizontal scrollbar. documentElement.clientHeight
    // is incorrect on iOS 8 because it includes toolbars.
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = document.documentElement.clientWidth;
    this.viewportTop = 0;

    // What's nice here is that rAF won't execute until the user is on this tab,
    // so if they open the page in a new tab which they aren't looking at,
    // this will execute when they come back to that tab.
    requestAnimationFrame(this.handleScroll.bind(this));
  }

  get viewportBottom() {
    return this.viewportTop + this.viewportHeight;
  }

  /**
   * Listen for scroll and resize.
   */
  bindEvents() {
    // Listen for global debounced resize.
    this.resizeId = OdoWindowEvents.onResize(this.update.bind(this));

    // Throttle scrolling because it doesn't need to be super accurate.
    this.scrollId = OdoWindowEvents.onFastScroll(this.handleScroll.bind(this));

    this.hasActiveHandlers = true;
  }

  /**
   * Remove event listeners when there are no longer any viewport items to watch.
   */
  unbindEvents() {
    if (this.items.size === 0) {
      OdoWindowEvents.remove(this.resizeId);
      OdoWindowEvents.remove(this.scrollId);

      this.hasActiveHandlers = false;
    }
  }

  /**
   * Watch another item.
   * @param {Object} options Viewport item options.
   * @return {string} The new item's id which is used to remove it.
   */
  add(options) {
    const item = new ViewportItem(options, this);
    this.items.set(item.id, item);

    // Event handlers are removed if a callback is triggered and the
    // watch list is empty. Because modules are instantiated asynchronously,
    // another module could potentially add itself to the watch list when the events
    // have been unbound.
    // Check here if events have been unbound and bind them again if they have
    if (!this.hasActiveHandlers) {
      this.bindEvents();
    }

    return item.id;
  }

  /**
   * Update each item's width/height/top/left values and the viewport size.
   */
  saveDimensions() {
    this.items.forEach((item) => {
      item.update();
    });

    // Window width and height without scrollbars.
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = document.documentElement.clientWidth;

    return this;
  }

  /**
   * Throttled scroll event. Update the viewport top position and process items.
   */
  handleScroll() {
    return this.setScrollTop().process();
  }

  /**
   * Update offsets and process items.
   */
  update() {
    return this.saveDimensions().process();
  }

  /**
   * Notify the viewport item it has entered view.
   * @param {ViewportItem} item item.
   */
  triggerEnter(item) {
    item.enter.call(item.element, item);

    if (item.hasExitCallback) {
      item.triggered = true;

      // If the exit property is not a function, the module no longer needs to
      // watch it, so remove from list of viewport items.
    } else {
      Viewport.remove(item.id);

      // If there are no more, unbind from scroll and resize events
      this.unbindEvents();
    }
  }

  /**
   * Notify the viewport item it has exited view.
   * @param {ViewportItem} item item.
   */
  triggerExit(item) {
    item.exit.call(item.element, item);
    item.triggered = false;
  }

  /**
   * Save the new scroll top
   */
  setScrollTop() {
    this.viewportTop = window.pageYOffset;
    return this;
  }

  /**
   * Process each viewport item to see if it is now in view (or out of view).
   */
  process() {
    this.items.forEach(this._processItem, this);
    this.addId = null;

    return this;
  }

  /**
   * Determine if enter or exit callbacks should be executed for a viewport item.
   * @param {ViewportItem} item Item to test.
   */
  _processItem(item) {
    const isVisible = this.isVisible(item);
    const isInView = isVisible && this.isInViewport(item);

    // Whether the item is not in the viewport and doesn't have an exit
    // callback. In this case, the enter callback should be executed
    // because the browser has already scrolled past the trigger point.
    const isTopPastView = isVisible && !item.hasExitCallback && this.isTopPastViewport(item);

    // If the enter callback hasn't been triggered and it's in the viewport,
    // trigger the enter callback.
    if (!item.triggered && (isInView || isTopPastView)) {
      this.triggerEnter(item);
      return;
    }

    // This viewport has already come into view once (viewport item has been
    // triggered) and now the bottom is out of view.
    if (!isInView && item.triggered && item.hasExitCallback &&
      !this.isBottomInViewport(item)) {
      this.triggerExit(item);
    }
  }

  /**
   * Whether a viewport item is considered to be in view.
   * @param {ViewportItem} item Item to test.
   * @return {boolean}
   */
  isInViewport(item) {
    const isTopInView = this.isTopInViewport(item);

    // If the item has not come into view, ignore checking to see if the bottom
    // is in view because this can conflict with the top being in view when the
    // offset is greater than the height of the watched element.
    let isBottomInView;
    if (item.offset >= 0) {
      if (item.triggered) {
        isBottomInView = this.isBottomInViewport(item);
      } else {
        isBottomInView = false;
      }
    } else {
      // If the offset is negative, assume that it shouldn't wait until the top
      // is in view before checking the bottom again.
      isBottomInView = this.isBottomInViewport(item);
    }

    const isViewPastBottom = this.isViewportPastBottom(item);
    const spanningViewport = !isTopInView && !isBottomInView && this.doesSpanViewport(item);

    const isSideInView = this.isSideInViewport(item);

    return (isTopInView || isBottomInView || spanningViewport) && !isViewPastBottom && isSideInView;
  }

  /**
   * Determine whether a side of the viewport item is within the viewport. A side
   * is also considered to be in view if the viewport item is wider than the viewport
   * and its left and right sides are out of view.
   * @param {ViewportItem} item Item to test.
   * @return {boolean}
   */
  isSideInViewport(item) {
    const isLeftInView = inRange(item.left, 0, this.viewportWidth);
    const isRightInView = inRange(item.right, 0, this.viewportWidth);

    // To span the viewport, it must:
    // * Wider than the viewport.
    // * Left side not in view.
    // * left side less than zero.
    // * Right side not in view.
    // * Right side greater than window width.
    const spansViewport = item.width >= this.viewportWidth && !isLeftInView && !isRightInView &&
      item.left < 0 && item.right > this.viewportWidth;

    return isLeftInView || isRightInView || spansViewport;
  }

  /**
   * If an element is hidden (has a parent with display:none), getBoundingClientRect
   * will return all zeros
   * @param {ViewportItem} item item Item to test.
   * @return {boolean}
   */
  isVisible(item) {
    return !(item.width === 0 && item.height === 0);
  }

  isTopPastViewport(item) {
    return this.viewportTop > item.top;
  }

  isViewportPastBottom(item) {
    return this.viewportTop >= item.bottom;
  }

  isTopInViewport(item) {
    const elementTop = item.top + item.offset;
    return inRange(elementTop, this.viewportTop, this.viewportBottom);
  }

  isBottomInViewport(item) {
    // Account for threshold only from the element top. Otherwise the element
    // won't be "out of view" from the bottom until after the extra threshold.
    return inRange(item.bottom, this.viewportTop, this.viewportBottom);
  }

  doesSpanViewport(item) {
    const elementTop = item.top + item.offset;
    const elementBottom = item.bottom;
    return item.height >= this.viewportHeight &&
      elementTop < this.viewportTop && elementBottom > this.viewportBottom;
  }

  /**
   * Remove all viewport items and unbind events.
   */
  static flush() {
    const instance = Viewport.getInstance();
    if (instance.addId) {
      cancelAnimationFrame(instance.addId);
      instance.addId = null;
    }

    instance.items.forEach((item, id) => {
      Viewport.remove(id);
    });

    instance.items.clear();
    instance.unbindEvents();
  }

  /**
   * Add a viewport item to watch.
   * @param {object|object[]} options Optional options object or array of
   *     options objects to initialize.
   * @param {Element} options.element Element to watch.
   * @param {number|string} [options.threshold] Optional - either a number representing
   *     the threshold offset (like 100), a float between zero and one representing
   *     a percentage, or a string like '50%' for a percentage.
   * @param {function} options.enter Callback when the element enters view.
   * @param {function} [options.exit] Optional callback when the element exits view.
   * @return {string|string[]} Viewport item id or array of item ids if
   *     `options` is an array.
   */
  static add(options) {
    const instance = Viewport.getInstance();

    let id;
    if (Array.isArray(options)) {
      id = options.map(option => instance.add(option));
    } else {
      id = instance.add(options);
    }

    // Avoid adding multiple rAFs when it should really only be processed once.
    if (instance.addId) {
      cancelAnimationFrame(instance.addId);
    }

    instance.addId = requestAnimationFrame(instance.process.bind(instance));

    return id;
  }

  /**
   * Remove a viewport item from the list of viewport items to watch.
   * @param {string} id The id returned from adding the viewport item.
   */
  static remove(id) {
    const instance = Viewport.getInstance();
    if (instance.items.has(id)) {
      instance.items.get(id).dispose();
      instance.items.delete(id);
    }
  }

  /**
   * Tell the viewport instance that offsets need to be updated.
   */
  static update() {
    Viewport.getInstance().update();
  }

  /**
   * Retrieve the viewport instance.
   * @return {Viewport}
   */
  static getInstance() {
    if (!instance) {
      instance = new Viewport();
    }

    return instance;
  }
}

export default Viewport;
