// Type definitions for OdoStickyHeaders
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

export as namespace OdoStickyHeaders;

export = OdoStickyHeaders;

declare class OdoStickyHeaders {
  constructor();

  /**
   * Mapping of elements to StickyItem instances.
   */
  items: Map<Element, OdoStickyHeaders.StickyItem>;

  /**
   * Change how the service treats multiple sticky items.
   * @type {OdoStickyHeaders.Mode}
   */
  mode: OdoStickyHeaders.Mode;

  /**
   * Set the location of sticky elements to be placed in the DOM.
   * @param {Element|null} element Element which sticky items will be appended to.
   */
  stickyHolder: Element | null;

  /**
   * Define a custom getter to determine overlap.
   */
  uiOverlap: () => number;

  /**
   * Define a custom getter to determine offset.
   */
  uiOffset: () => number;

  /**
   * Track a sticky item.
   * @param {Element[]|Element} element An array of elements or a single
   *    element which will become sticky.
   * @return {Element} The key to the items map for this new StickyItem.
   */
  add(element: Element | Element[]): Element | Element[];

  /**
   * Stop tracking a sticky item.
   * @param {Element} element Element which was added to the sticky headers.
   */
  remove(element: Element): void;

  /**
   * On every scroll event, push or stack sticky headers, depending on the mode.
   * @param {number} scrollTop Page scroll position.
   */
  process(scrollTop?: number): void;

  /**
   * Re-cache element positions and reposition all sticky headers.
   */
  update(): void;

  /**
   * Remove element references and event listeners.
   */
  dispose(): void;
}

declare namespace OdoStickyHeaders {
  export class StickyItem {
    constructor(element: Element);

    /**
     * Main sticky element.
     * @type {Element}
     */
    element: Element;

    /**
     * Whether the element is position:fixed.
     * @type {boolean}
     */
    isFixed: boolean;

    /**
     * Whether the element is affixed to the bottom.
     * @type {boolean}
     */
    isAtBottom: boolean;

    /**
     * Whether the element is layer promoted.
     * @type {boolean}
     */
    isPromoted: boolean;

    /**
     * Save the dimensions of the sticky item.
     */
    update(): void;

    /**
     * Stick the sticky item to a specific value.
     * @param {number} stackHeight The current stack height of sticky elements.
     * @param {Element} [parent] Optional element to put the sticky within.
     */
    stick(stackHeight: number, parent?: Element): void;

    /**
     * Remove stickiness of sticky item.
     */
    unstick(): void;

    stickToBottom(placement: number): void;

    /**
     * Add styles which will put the affix-element in a new layer.
     */
    layerPromote(): void;

    /**
     * Remove styles which cause layer promotion.
     */
    layerDemote(): void;

    /**
     * Get rid of this sticky item instance.
     */
    dispose(): void;
  }

  namespace StickyItem {
    /**
     * HTML class names for elements of the sticky header item.
     */
    enum Classes {
      BASE = 'odo-sticky-headers__item',
      WRAPPER = 'odo-sticky-headers__item-wrapper',
      IS_FIXED = 'is-fixed',
      IS_AT_TOP = 'is-at-top',
      IS_AT_BOTTOM = 'is-at-bottom',
    }

    let INITIAL_POSITION: string;
  }

  enum Mode {
    PUSH = 1,
    STACK = 2,
  }

  let PROMOTION_RANGE: number;
  let LAST_ITEM_BOTTOM: number;
}
