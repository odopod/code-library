/**
 * @fileoverview This class describes a sticky header element. It caches the
 * offsets for the element and has methods to stick, affix, and unstick the
 * sticky element.
 */

function applyCss(element, css) {
  Object.keys(css).forEach((property) => {
    element.style[property] = css[property];
  });
}

class StickyItem {

  /**
   * Create a new sticky item.
   * @param {Element} element Element to stick.
   * @constructor
   */
  constructor(element) {
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
  _wrapStickyElement() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = StickyItem.Classes.WRAPPER;
    this.element.parentNode.insertBefore(this.wrapper, this.element);

    applyCss(this.element, {
      position: StickyItem.INITIAL_POSITION,
      zIndex: 1,
      top: 0,
      left: 0,
      width: '100%',
      overflow: 'hidden',
    });

    this.element.classList.add(StickyItem.Classes.IS_AT_TOP);
    this.wrapper.appendChild(this.element);
  }

  /**
   * Remove the placeholder element added when this sticky item is initialized.
   * @private
   */
  _unwrapStickyElement() {
    const container = this.wrapper.parentNode;
    container.appendChild(this.element);
    container.removeChild(this.wrapper);
  }

  /**
   * Save the dimensions of the sticky item.
   */
  update() {
    const rect = this.element.getBoundingClientRect();
    this.top = rect.top + window.pageYOffset;
    this.height = Math.round(rect.height);
  }

  /**
   * Stick the sticky item to a specific value.
   * @param {number} stackHeight The current stack height of sticky elements.
   * @param {Element} [parent] Optional element to put the sticky within.
   */
  stick(stackHeight, parent) {
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
  }

  /**
   * Remove stickiness of sticky item.
   */
  unstick() {
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
  }

  stickToBottom(placement) {
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
  }

  /**
   * Add styles which will put the affix-element in a new layer.
   */
  layerPromote() {
    this.element.style.willChange = 'position';
    this.element.style.transform = 'translateZ(0)';
    this.isPromoted = true;
  }

  /**
   * Remove styles which cause layer promotion.
   */
  layerDemote() {
    this.element.style.willChange = '';
    this.element.style.transform = '';
    this.isPromoted = false;
  }

  /**
   * Get rid of this sticky item instance.
   */
  dispose() {
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
      transform: '',
    });

    this.element = null;
    this.wrapper = null;
  }
}

StickyItem.INITIAL_POSITION = 'relative';

StickyItem.Classes = {
  BASE: 'odo-sticky-headers__item',
  WRAPPER: 'odo-sticky-headers__item-wrapper',
  IS_FIXED: 'is-fixed',
  IS_AT_TOP: 'is-at-top',
  IS_AT_BOTTOM: 'is-at-bottom',
};

export default StickyItem;
