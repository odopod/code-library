// Type definitions for OdoBaseComponent
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

export as namespace OdoBaseComponent;

export = OdoBaseComponent;

declare class OdoBaseComponent {
  /**
   * Create a new base component.
   * @param {Element} element Main element which represents this class.
   * @param {boolean} [addMediaListeners=false] Whether or not to add media
   *     query listeners to allow this component to react to media changes.
   * @throws {TypeError} Throws when the element is not defined.
   */
  constructor(element: Element, addMediaListeners = false);

  /** Main element for this class */
  element: Element;

  readonly breakpoint: BreakpointChain;

  /*~
   *~ From tiny emitter
   *~ https://github.com/scottcorgan/tiny-emitter/blob/master/index.d.ts
   */
  on(event: string, callback: Function, ctx?: any): OdoBaseComponent;
  once(event: string, callback: Function, ctx?: any): OdoBaseComponent;
  emit(event: string, ...args: any[]): OdoBaseComponent;
  off(event: string, callback?: Function): OdoBaseComponent;

  /**
   * Retrieve an element by class name within the main element for this class.
   * @param {string} klass Name of the class to search for.
   * @param {Element} [context] Element to search within. Defaults to main element.
   * @return {Element} The first element which matches the class name, or null.
   */
  getElementByClass(klass: string, context?: Element): Element | null;

  /**
   * Retrieve elements by class name within the main element for this class.
   * @param {string} klass Name of the class to search for.
   * @param {Element} [context] Element to search within. Defaults to main element.
   * @return {Element[]} An array of elements matching the class name.
   */
  getElementsByClass(klass: string, context?: Element): Element[];

  /**
   * Retrieve elements by selector within the main element for this class.
   * @param {string} selector Selector to search for.
   * @param {Element} [context] Element to search within. Defaults to main element.
   * @return {Element[]} An array of elements matching the selector.
   */
  getElementsBySelector(selector: string, context?: Element): Element[];

  /**
   * Override this method to respond to media query changes.
   */
  onMediaQueryChange(): void;
}

interface BreakpointChain {
  /**
   * Query the media query list to see if it currently matches.
   * @param {string} key Breakpoint key to see if it matches. One of "xs", "sm", "md", or "lg".
   * @return {boolean} Whether the given key is the current breakpoint.
   * @throws {Error} Will throw an error if the key is not recognized.
   */
  matches(key: string): boolean;

  /**
   * Loop through the 4 media query lists to determine which one currently
   * matches. Returns the key which matches or `null` if none match.
   * @return {?string}
   * @static
   */
  current: string | null;
}

declare namespace OdoBaseComponent {
  /**
   * Query the media query list to see if it currently matches.
   * @param {string} key Breakpoint key to see if it matches. One of "xs", "sm", "md", or "lg".
   * @return {boolean} Whether the given key is the current breakpoint.
   * @throws {Error} Will throw an error if the key is not recognized.
   * @static
   */
  static function matches(key: string): boolean;

  const breakpoint: BreakpointChain;

  /**
   * Loop through the 4 media query lists to determine which one currently
   * matches. Returns the key which matches or `null` if none match.
   * @return {?string}
   * @static
   */
  static function getCurrentBreakpoint(): string | null

  /**
   * Allows you to redefine the default breakpoints. If you want to redefine
   * breakpoints, make sure you call this method before initializing classes
   * which inherit from BaseComponent.
   * @param {number[]} breakpoints An array of 3 numbers.
   * @static
   */
  static function defineBreakpoints(breakpoints: number[]): void;

  /**
   * Array of breakpoint key names.
   * @type {string[]}
   */
  let BREAKPOINT_NAMES: ['xs', 'sm', 'md', 'lg'];

  /**
   * Array of breakpoint values.
   * @type {number[]}
   */
  let BREAKPOINTS: [768, 1024, 1392];

  let queries: { xs: MediaQueryList, sm: MediaQueryList, md: MediaQueryList, lg: MediaQueryList };

  /**
   * Support: IE9
   * Whether the browser has `addListener` on `MediaQueryList` instances.
   * @type {boolean}
   */
  let hasMediaQueries: boolean;
}
