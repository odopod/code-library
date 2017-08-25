import debounce from 'debounce';
import TinyEmitter from 'tiny-emitter';

/**
 * A class to be inherited from for components which interact with the DOM.
 * @extends {TinyEmitter}
 */
class BaseComponent extends TinyEmitter {
  /**
   * Create a new base component.
   * @param {Element} element Main element which represents this class.
   * @param {boolean} [addMediaListeners=false] Whether or not to add media
   *     query listeners to allow this component to react to media changes.
   * @throws {TypeError} Throws when the element is not defined.
   */
  constructor(element, addMediaListeners = false) {
    super();

    if (!element) {
      throw new TypeError(`${this.constructor.name}'s "element" in the constructor must be element. Got: "${element}".`);
    }

    /**
     * Main element for this class.
     * @type {Element}
     */
    this.element = element;

    if (addMediaListeners && BaseComponent.hasMediaQueries) {
      this._registerMediaQueryListeners();
    }
  }

  /**
   * Determine the context for queries to the DOM.
   * @param {Element} [context=this.element] Optional element to search within.
   * @return {!Element}
   * @private
   */
  _getContext(context = this.element) {
    return context;
  }

  /**
   * Retrieve an element by class name within the main element for this class.
   * @param {string} klass Name of the class to search for.
   * @param {Element} [context] Element to search within. Defaults to main element.
   * @return {?Element} The first element which matches the class name, or null.
   */
  getElementByClass(klass, context) {
    return this._getContext(context).getElementsByClassName(klass)[0] || null;
  }

  /**
   * Retrieve elements by class name within the main element for this class.
   * @param {string} klass Name of the class to search for.
   * @param {Element} [context] Element to search within. Defaults to main element.
   * @return {Element[]} An array of elements matching the class name.
   */
  getElementsByClass(klass, context) {
    return Array.from(this._getContext(context).getElementsByClassName(klass));
  }

  /**
   * Retrieve elements by selector within the main element for this class.
   * @param {string} selector Selector to search for.
   * @param {Element} [context] Element to search within. Defaults to main element.
   * @return {Element[]} An array of elements matching the selector.
   */
  getElementsBySelector(selector, context) {
    return Array.from(this._getContext(context).querySelectorAll(selector));
  }

  /**
   * Alias for the static getter `breakpoint`.
   * @return {Object}
   */
  get breakpoint() {
    return BaseComponent.breakpoint;
  }

  /**
   * Override this method to respond to media query changes.
   */
  onMediaQueryChange() {}

  /**
   * Clean up element references and event listeners.
   */
  dispose() {
    this.element = null;

    if (this._onMediaChange) {
      Object.keys(BaseComponent.queries).forEach((k) => {
        BaseComponent.queries[k].removeListener(this._onMediaChange);
      });

      this._onMediaChange = null;
    }
  }

  _registerMediaQueryListeners() {
    this._onMediaChange = debounce(this.onMediaQueryChange.bind(this), 50);
    Object.keys(BaseComponent.queries).forEach((k) => {
      BaseComponent.queries[k].addListener(this._onMediaChange);
    });
  }

  /**
   * Returns an object with `matches` and `current`. This is an alias for
   * `BaseComponent.matches` and `BaseComponent.getCurrentBreakpoint()`.
   * @return {!Object}
   * @static
   */
  static get breakpoint() {
    return {
      matches: BaseComponent.matches,
      get current() {
        return BaseComponent.getCurrentBreakpoint();
      },
    };
  }

  /**
   * Query the media query list to see if it currently matches.
   * @param {string} key Breakpoint key to see if it matches.
   * @return {boolean} Whether the given key is the current breakpoint.
   * @throws {Error} Will throw an error if the key is not recognized.
   * @static
   */
  static matches(key) {
    if (BaseComponent.queries[key]) {
      return BaseComponent.queries[key].matches;
    }

    throw new Error(`Unrecognized breakpoint key: "${key}"`);
  }

  /**
   * Loop through the 4 media query lists to determine which one currently
   * matches. Returns the key which matches or `null` if none match.
   * @return {?string}
   * @static
   */
  static getCurrentBreakpoint() {
    const key = Object.keys(BaseComponent.queries)
      .find(k => BaseComponent.queries[k].matches);

    return key || null;
  }

  /**
   * Create a new media queries object with keys for each breakpoint.
   * @param {number[]} bps Array of breakpoints.
   * @return {!Object}
   * @private
   * @static
   */
  static _getQueries(bps) {
    return {
      xs: matchMedia(`(max-width:${bps[0] - 1}px)`),
      sm: matchMedia(`(min-width:${bps[0]}px) and (max-width:${bps[1] - 1}px)`),
      md: matchMedia(`(min-width:${bps[1]}px) and (max-width:${bps[2] - 1}px)`),
      lg: matchMedia(`(min-width:${bps[2]}px)`),
    };
  }

  /**
   * Allows you to redefine the default breakpoints. If you want to redefine
   * breakpoints, make sure you call this method before initializing classes
   * which inherit from BaseComponent.
   * @param {number[]} breakpoints An array of 3 numbers.
   * @static
   */
  static defineBreakpoints(breakpoints) {
    BaseComponent.BREAKPOINTS = breakpoints;
    BaseComponent.queries = BaseComponent._getQueries(breakpoints);
  }
}

// Define breakpoints commonly used on Odopod projects.
BaseComponent.defineBreakpoints([768, 1024, 1392]);

/**
 * Array of breakpoint key names.
 * @type {string[]}
 */
BaseComponent.BREAKPOINT_NAMES = Object.keys(BaseComponent.queries);

/**
 * Support: IE9
 * Whether the browser has `addListener` on `MediaQueryList` instances.
 * @type {boolean}
 */
BaseComponent.hasMediaQueries = typeof BaseComponent.queries.xs.addListener === 'function';

export default BaseComponent;
