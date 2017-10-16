/**
 * @fileoverview Emulates `position:sticky` to make an element fixed position
 * while its within a container. This is best for sidebars so that they follow
 * the content, without overlapping sections below it.
 */

import OdoWindowEvents from '@odopod/odo-window-events';
import OdoScrollAnimation from '@odopod/odo-scroll-animation';

class Affix {
  constructor(element) {
    /**
     * Main element.
     * @type {Element}
     */
    this.element = element;

    /**
     * Parent containing element.
     * @type {Element}
     */
    this._anchor = document.getElementById(element.getAttribute('data-anchor'));

    if (!this._anchor) {
      throw new Error(`Unable to find element with id="${element.getAttribute('data-anchor')}"`);
    }

    /**
     * Whether the main element is position fixed.
     * @type {boolean}
     */
    this.isStuck = false;

    /**
     * Whether the main element is stuck to the bottom of its container.
     * @type {boolean}
     */
    this.isAtBottom = false;

    /**
     * Whether the main element has been promoted to its own layer for the GPU.
     * @type {boolean}
     * @protected
     */
    this.isPromoted = false;

    /**
     * Custom overlap getter. Can be overridden by setting `uiOverlap`.
     * @type {?function}
     * @private
     */
    this._customOverlap = null;

    /**
     * Current UI overlap.
     * @type {number}
     * @private
     */
    this._overlap = 0;

    /**
     * Current maximum height for the main sticky element.
     * @type {number}
     * @private
     */
    this._maxHeight = 0;

    /**
     * Main element's top margin.
     * @type {number}
     * @private
     */
    this._marginTop = 0;

    /**
     * Main element's bottom margin.
     * @type {number}
     * @private
     */
    this._marginBottom = 0;

    /**
     * Top offset of the main element.
     * @type {number}
     * @private
     */
    this._top = 0;

    /**
     * Bottom offset of the main element.
     * @type {number}
     * @private
     */
    this._bottom = 0;

    /**
     * Height of the anchor (container).
     * @type {number}
     */
    this.containerHeight = 0;

    /**
     * Unique id for the throttled scroll event listener.
     * @type {string}
     * @private
     */
    this._scrollId = OdoScrollAnimation.add(this.process.bind(this));

    this.element.classList.add(Affix.Classes.BASE);
    this.element.style.overflowY = 'auto';

    // Keep track of instances so they can be batch-processed.
    Affix.instances.push(this);

    this.update();
  }

  /**
   * Cache values so they don't need to be queried on scroll.
   * @protected
   */
  read() {
    const rect = this._anchor.getBoundingClientRect();
    const scrollY = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const asideHeight = this.element.offsetHeight;
    this._asideWidth = this.element.offsetWidth;
    const styles = getComputedStyle(this.element, null);
    this._marginTop = parseFloat(styles.marginTop);
    this._marginBottom = parseFloat(styles.marginBottom);

    this._overlap = this.uiOverlap;
    this._maxHeight = viewportHeight - this._overlap - this._marginTop - this._marginBottom;

    this.containerHeight = Math.round(rect.height);
    this._top = rect.top + scrollY;
    this._bottom = rect.bottom + scrollY - Math.min(asideHeight, this._maxHeight);
  }

  /** @protected */
  write() {
    this.element.style.maxHeight = this._maxHeight + 'px';
    this.element.style.width = this._asideWidth + 'px';
  }

  /**
   * This method runs on every frame to update the placement of the sticky element.
   * @param {number} scrollTop Scroll top of the page.
   */
  process(scrollTop = window.pageYOffset) {
    // Stick (position fixed).
    if ((!this.isStuck && scrollTop >= this.top && scrollTop < this.bottom) ||
        (this.isAtBottom && scrollTop < this.bottom)) {
      this.stick();

    // Affix. Item has reached the end of its view-length, stick it to the bottom.
    } else if (!this.isAtBottom && scrollTop >= this.bottom) {
      this.stickToBottom();

    // Above the position where the sticky element should be position fixed, so unstick it.
    } else if (this.isStuck && scrollTop < this.top) {
      this.unstick();
    }

    // When the affix-element's position is soon going to change, promote it
    // to a new layer so that the browser does not have to paint it on every scroll.
    // Having the affix-element layer promoted all the time is inefficient and greedy.
    const isInRange = this.isInPromotionRange(scrollTop);
    if (!this.isPromoted && isInRange) {
      this.layerPromote();
    } else if (this.isPromoted && !isInRange) {
      this.layerDemote();
    }
  }

  isInPromotionRange(scrollTop) {
    return scrollTop >= this.top - Affix.PROMOTION_RANGE &&
        scrollTop <= this.bottom + Affix.PROMOTION_RANGE;
  }

  /** @protected */
  stick() {
    this.element.style.position = 'fixed';
    this.element.style.top = Math.round(this._overlap) + 'px';
    this.element.classList.remove(Affix.Classes.AT_BOTTOM);
    this.element.classList.remove(Affix.Classes.AT_TOP);
    this.isStuck = true;
    this.isAtBottom = false;
  }

  /** @protected */
  stickToBottom() {
    this.element.style.position = 'absolute';
    this.element.style.top = Math.round(this._bottom - this._top - this._marginBottom) + 'px';
    this.element.classList.remove(Affix.Classes.AT_TOP);
    this.element.classList.add(Affix.Classes.AT_BOTTOM);
    this.isAtBottom = true;
  }

  /** @protected */
  unstick() {
    this.element.style.position = '';
    this.element.classList.add(Affix.Classes.AT_TOP);
    this.element.classList.remove(Affix.Classes.AT_BOTTOM);
    this.isStuck = false;
    this.isAtBottom = false;
  }

  /**
   * Add styles which will put the affix-element in a new layer.
   * @protected
   */
  layerPromote() {
    this.element.style.willChange = 'position';
    this.element.style.transform = 'translateZ(0)';
    this.isPromoted = true;
  }

  /**
   * Remove styles which cause layer promotion.
   * @protected
   */
  layerDemote() {
    this.element.style.willChange = '';
    this.element.style.transform = '';
    this.isPromoted = false;
  }

  /**
   * Reset values that are set with `write` so that they can be read again.
   * @protected
   */
  reset() {
    this.element.style.maxHeight = '';
    this.element.style.width = '';
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
   * The offset when this component becomes sticky.
   * @return {number}
   */
  get top() {
    return this._top - this._overlap;
  }

  /**
   * The offset when this component sticks to the bottom of its container.
   * @return {number}
   */
  get bottom() {
    return this._bottom - this._marginBottom;
  }

  /**
   * Reset everything, cache offsets, and recalculate.
   */
  update() {
    const { scrollTop } = this.element;
    this.unstick();
    this.reset();
    this.read();
    this.write();
    this.process();
    this.element.scrollTop = scrollTop;
  }

  /**
   * Remove event listeners and references.
   */
  dispose() {
    this.layerDemote();
    this.element.classList.remove(Affix.Classes.BASE);
    this.element.style.position = '';
    this.element.style.top = '';
    this.element.style.maxHeight = '';
    this.element.style.width = '';
    this.element.style.overflowY = '';
    this.element = null;
    this._anchor = null;
    OdoWindowEvents.remove(this._resizeId);
    OdoScrollAnimation.remove(this._scrollId);
    Affix.arrayRemove(Affix.instances, this);
  }

  /**
   * Since 'load' events on images do not bubble, the event listener cannot be
   * delegated and must be added to every image.
   * The load event is not removed once the image loads because the image could
   * be a responsive image which could have multiple load events.
   */
  static _addImageLoadHandlers() {
    const images = document.getElementsByTagName('img');

    for (let i = 0, len = images.length; i < len; i++) {
      images[i].addEventListener('load', Affix._scheduleUpdate, false);
    }
  }

  /**
   * Schedule a throttled update to check if offsets need to be recalculated.
   */
  static _scheduleUpdate() {
    window.removeEventListener('load', Affix._scheduleUpdate);

    // Cancel a previous update if it exists.
    if (Affix._updateId) {
      window.cancelAnimationFrame(Affix._updateId);
    }

    // Throttle updates to once per frame.
    Affix._updateId = window.requestAnimationFrame(Affix._handleImageLoad);
  }

  /**
   * When an image loads, it could possibly change the layout/geometry of the
   * entire page. Because Affix relies on offsets, everything must be
   * updated here.
   */
  static _handleImageLoad() {
    Affix._updateId = null;
    Affix.documentHeight = document.body.offsetHeight;
    Affix.viewportHeight = window.innerHeight;
    Affix.update();
  }

  /**
   * Batch update all instances. This method is more efficient because it syncs
   * reads and writes to the DOM for each instance.
   */
  static update() {
    const scrollY = window.pageYOffset;
    const scrollPositions = Affix.instances.map(instance => instance.element.scrollTop);

    // Write
    Affix.instances.forEach((instance) => {
      instance.unstick();
      instance.reset();
    });

    // Read
    Affix.instances.forEach((instance) => {
      instance.read();
    });

    // Write
    Affix.instances.forEach((instance) => {
      instance.write();
      instance.process(scrollY);
    });

    Affix.instances.forEach((instance, i) => {
      instance.element.scrollTop = scrollPositions[i];
    });
  }

  /**
   * Remove an item from an array.
   * @param {Array} arr Array to use.
   * @param {*} item Item to remove.
   * @return {*} Item removed.
   */
  static arrayRemove(arr, item) {
    const index = arr.indexOf(item);
    arr.splice(index, 1);
    return item;
  }
}

Affix.PROMOTION_RANGE = 200;
Affix.instances = [];
Affix._updateId = null;
Affix.documentHeight = document.body.offsetHeight;
Affix.viewportHeight = window.innerHeight;
Affix._addImageLoadHandlers();
Affix._resizeId = OdoWindowEvents.onResize(Affix._scheduleUpdate);
window.addEventListener('load', Affix._scheduleUpdate);

Affix.Classes = {
  BASE: 'odo-affix',
  AT_TOP: 'odo-affix--at-top',
  AT_BOTTOM: 'odo-affix--at-bottom',
};

export default Affix;
