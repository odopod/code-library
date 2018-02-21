// Type definitions for OdoAffix
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

export as namespace OdoAffix;

export = OdoAffix;

declare class OdoAffix {
  /**
   * Create a new affix instance.
   * @param {HTMLElement} element Main element which represents this class.
   */
  constructor(element: HTMLElement);

  /** Main element for this class */
  element: HTMLElement;

  /**
   * Whether the main element is position fixed.
   * @type {boolean}
   */
  isStuck: boolean;

  /**
   * Whether the main element is stuck to the bottom of its container.
   * @type {boolean}
   */
  isAtBottom: boolean;

  /**
   * Whether the main element has been promoted to its own layer for the GPU.
   * @type {boolean}
   * @protected
   */
  protected isPromoted: boolean;

  /**
   * Cache values so they don't need to be queried on scroll.
   */
  protected read(): void;

  /**
   * Set styles.
   */
  protected write(): void;

  /**
   * This method runs on every frame to update the placement of the sticky element.
   * @param {number} scrollTop Scroll top of the page.
   */
  process(scrollTop?: number): void;

  /**
   * Whether the browser's scroll position is within promotion range.
   */
  isInPromotionRange(scrollTop: number): boolean;

  protected stick(): void;
  protected stickToBottom(): void;
  protected unstick(): void;

  /**
   * Add styles which will put the affix-element in a new layer.
   * @protected
   */
  protected layerPromote(): void;

  /**
   * Remove styles which cause layer promotion.
   * @protected
   */
  protected layerDemote(): void;

  /**
   * Reset values that are set with `write` so that they can be read again.
   * @protected
   */
  protected reset(): void;

  /**
   * Define a custom getter to determine overlap.
   */
  uiOverlap: () => number;

  /**
   * The offset when this component becomes sticky.
   */
  readonly top: number;

  /**
   * The offset when this component sticks to the bottom if its container.
   */
  readonly bottom: number;

  /**
   * Reset everything, cache offsets, and recalculate.
   */
  update(): void;

  /**
   * Close the affix, remove event listeners and element references.
   */
  dispose(): void;
}

declare namespace OdoAffix {

  /**
   * Batch update all instances. This method is more efficient because it syncs
   * reads and writes to the DOM for each instance.
   */
  function update(): void;

  /**
   * Remove an item from an array.
   * @param {any[]} arr Array to use.
   * @param {any} item Item to remove.
   * @return {any} Item removed.
   */
  function arrayRemove(arr: any[], item: any): any;

  /**
   * Array of affix instances.
   * @type {OdoAffix[]}
   */
  const instances: OdoAffix[];

  /**
   * HTML class names for elements of the affix.
   */
  const Classes: {
    [key: string]: string;
  };

  /**
   * Range in pixels before and after the affix point that the element-to-be-affixed
   * should be layer-promoted.
   */
  const PROMOTION_RANGE: number;

  /**
   * Height of the page.
   */
  const documentHeight: number;

  /**
   * Height of the viewport.
   */
  const viewportHeight: number;
}
