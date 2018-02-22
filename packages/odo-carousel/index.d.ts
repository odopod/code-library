// Type definitions for OdoCarousel
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

import { Coordinate } from '@odopod/odo-helpers';
import OdoDraggable from '@odopod/odo-draggable';
import OdoPointer from '@odopod/odo-pointer';

export as namespace OdoCarousel;

export = OdoCarousel;

type CarouselEventCallback = (data: OdoCarousel.CarouselEvent) => void;

declare class OdoCarousel {

  /**
   * @param {HTMLElement} element The outermost carousel element.
   * @param {OdoCarousel.Options} [opts] An options object.
   * @constructor
   * @throws {TypeError} if element isn't an element.
   */
  constructor(element: HTMLElement, opts?: OdoCarousel.Options);

  /** Main element for this class */
  element: HTMLElement;

  options: OdoCarousel.Options;

  /*~
   *~ From tiny emitter
   *~ https://github.com/scottcorgan/tiny-emitter/blob/master/index.d.ts
   */
  on(event: string, callback: CarouselEventCallback, ctx?: any): OdoCarousel;
  once(event: string, callback: CarouselEventCallback, ctx?: any): OdoCarousel;
  emit(event: string, ...args: any[]): OdoCarousel;
  off(event: string, callback?: CarouselEventCallback): OdoCarousel;

  /**
   * Whether the carousel is vertical or horizontal.
   * @type {boolean}
   * @protected
   */
  protected isVertical: boolean;

  /**
   * The DOM index of the current slide element within the slides' parent.
   * @type {number}
   * @protected
   */
  protected domIndex: number;

  /**
   * The previous domIndex value.
   * @type {number}
   * @protected
   */
  protected lastDomIndex: number;

  /**
   * A flag indicating that the carousel is animating. It also will have
   * a transition end event lister bound to it if the browser can
   * transition transforms.
   * @type {boolean}
   * @protected
   */
  protected isTransitioning: boolean;

  /**
   * Flag indicating dragging has happened. It is set on dragmove and reset
   * after the draggableend event has been dispatched.
   * @type {boolean}
   */
  hasDragged: boolean;

  /**
   * Draggable attached to the carousel element. Used for non-fade carousels.
   * @type {OdoDraggable}
   */
  draggable: OdoDraggable;

  /**
   * Pointer attached to the main element. Used for fading carousels.
   * @type {OdoPointer}
   */
  pointer: OdoPointer;

  /**
   * Finds an element within this class' main element based on a class name.
   * @param {string} className Class name to search for.
   * @param {Element} [context] Optionally provide the context (scope)
   *     for the query. Default is the main element of the class.
   * @return {Element[]} An array which may or may not contain the element
   *     which was searched for.
   */
  getElementsByClass(className: string, context?: Element): Element[];

  /**
   * Retrieve an element by its class name.
   * @param {string} className Class name to search for.
   * @param {Element} [context] Optinal scope for search.
   * @return {Element|null} The element or null if it isn't found.
   */
  getElementByClass(className: string, context?: Element): Element | null;

  /**
   * Listen for dragging events.
   * @protected
   */
  protected bindDragEvents(): void;

  /**
   * Listen for the pointer to come up from the screen, then execute a callback.
   * @protected
   */
  protected bindSwipeEvents(): void;

  /**
   * Add a slide to the end of the carousel.
   * @param {string} slideHtml Html string for the slide.
   */
  addSlide(slideHtml: string): void;

  /**
   * Synchronously reset the slides. Use this when you're sure the elements
   * within the carousel are done changing.
   */
  reset(): void;

  /**
   * Retreives the cached carousel wrapper element.
   * @return {HTMLElement}
   */
  getWrapper(): HTMLElement;

  /**
   * Retreives the cached carousel element.
   * @return {HTMLElement}
   */
  getCarouselElement(): HTMLElement;

  /**
   * Returns the array of slides in the carousel.
   * @return {HTMLElement[]} The slides array.
   */
  getSlides(): HTMLElement[];

  /**
   * Get the slide element at the given index.
   * @param {number} index The logical index of the slide you want.
   * @return {HTMLElement} The slide element.
   */
  getSlide(index: number): HTMLElement;

  /**
   * Get the index of the currently active slide.
   * @return {number} Index of the current slide.
   */
  getSelectedIndex(): number;

  /**
   * @param {number} index Index to test.
   * @return {boolean} Whether a given index is out of range of the carousel.
   */
  isIndexOutOfRange(index: number): boolean;

  /**
   * Constrain an index within bounds.
   * @param {number} index Index to clamp.
   * @return {number}
   */
  clampIndexToSlides(index: number): number;

  /**
   * @return {boolean} Whether the carousel is currently on the first slide.
   */
  isFirstSlide(): boolean;

  /**
   * @return {boolean} Whether the carousel is currently on the last slide.
   */
  isLastSlide(): boolean;

  /**
   * @return {number[]} The slide indices array.
   */
  getSlideIndices(): number[];

  /**
   * Enable or disable dragging of the carousel.
   * @param {boolean} isDraggable Whether it should be draggable.
   */
  setDraggable(isDraggable: boolean): void;

  /**
   * Toggle the enabled/disabled state of the carousel. When it's disabled, it
   * will not be able to navigate slides.
   * @type {boolean}
   */
  isEnabled: boolean;

  /**
   * This function initializes the slideshow functionality for the
   * carousel. It sets an interval for the slideshow to continue animate
   * based on the option slideshowSpeed.
   */
  startSlideshow(): void;

  /**
   * A simple method which pauses the _timer
   * once thats paused the slideshow will stop ticking.
   * Can be re-initialzed by running `startSlideshow()`
   */
  pauseSlideshow(): void;

  /**
   * Goes to a given slide.
   * @param {number} domIndex The slide index relative to DOM order.
   * @param {boolean} [noAnimation] Whether going to the slide should animate.
   * @protected
   */
  protected fadeToSlide(domIndex: number, noAnimation?: boolean): void;

  /**
   * Goes to a given slide.
   * @param {!number} domIndex The slide index relative to DOM order.
   * @param {boolean} [noAnimation] Whether going to the slide should animate.
   * @protected
   */
  goToSlide(domIndex: number, noAnimation?: boolean): void;

  /**
   * Helper function for going to a given index. This method should be used
   * instead of the private one to abstract the DOM order stuff.
   * @param {number} index The logical, zero based index of the slide you wish
   *     the carousel to go to.
   * @param {boolean} [noAnimation] Optional skip the animation in goToSlide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */
  setSelectedIndex(index: number, noAnimation?: boolean): boolean;

  /**
   * Find the nearest slide, and move the carousel to that.
   * @param {boolean} [isNext] Whether it should go to the nearest slide, but
   *     only in the next direction. False means it should go previous and
   *     anything not true or false will go to the nearest slide regardless
   *     of direction.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */
  goToNearestSlide(isNext?: boolean): boolean;

  /**
   * Go to the next slide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */
  goToNextSlide(): boolean;

  /**
   * Go to the previous slide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */
  goToPreviousSlide(): boolean;

  /**
   * Decide what to do after the user drags the carousel.
   * @param {Coordinate} velocity Velocity for x and y directions.
   * @param {OdoPointer.Direction} direction Drag direction.
   * @param {boolean} didMoveOnAxis Whether the drag direction was on the defined axis.
   * @protected
   */
  protected navigateAfterDrag(velocity: Coordinate, direction: OdoPointer.Direction, didMoveOnAxis: boolean): void;

  /**
   * Remove event listeners, DOM references, inline styles, class names, paddles,
   * and pagination added by Carousel.
   */
  dispose(): void;
}

declare namespace OdoCarousel {
  export interface Options {
    startIndex?: number,
    isVertical?: boolean,
    isLooped?: boolean,
    isJumped?: boolean,
    isFade?: boolean,
    isCentered?: boolean,
    neighborCount?: number,
    slideshowSpeed?: number,
    animationSpeed?: number,
    crossfadeAmount?: number,
    easing?: string,
    pagination?: boolean,
    getNavPaddleHtml?: () => string,
    getPaginationHtml?: () => string,
    template?: {
      paddles?: string,
      paddleNext?: string,
      paddlePrev?: string,
      paddleNextInner?: string,
      paddlePrevInner?: string,
      pagination?: string,
      paginationDot?: string,
      paginationDotSecondary?: string,
    },
  }

  export class CarouselEvent {
    constructor(type: string, carousel: OdoCarousel, from?: number, to?: number);
    type: string;
    target: HTMLElement;
    from?: number;
    to?: number;
    hasSlideChanged: boolean;
    defaultPrevented: boolean;
    preventDefault(): void;
  }

  /**
   * Because Object.assign only does a shallow merge, merge the template option
   * first and then overwrite the main Object.assign result.
   * @param {OdoCarousel.Options} options Options object.
   * @return {OdoCarousel.Options} Merged options object with defaults.
   */
  function getOptions(options?: OdoCarousel.Options): OdoCarousel.Options;

  /**
   * A simple string replacement template with double curly braces. You can use
   * nested objects and functions too.
   *
   * @example
   * // "Today is Thursday"
   * template("Today is {{ day }}", {
   *   day: 'Thursday',
   * });
   *
   * // "Today is Friday"
   * template("Today is {{ month.day }}", {
   *   month: {
   *     day: 'Friday',
   *   },
   * });
   *
   * // "Today is Saturday"
   * template("Today is {{ day }}", {
   *   today: 'Saturday',
   *   day() {
   *     return this.today;
   *   },
   * });
   *
   * @param {string} str Template.
   * @param {object} data Data object with keys which match your template.
   * @return {string}
   */
  function template(str: string, data: { [key: string]: any }): string;

  /**
   * HTML class names for elements of the carousel.
   */
  enum Classes {
    BASE = 'odo-carousel',
    FADE = 'odo-carousel--fade',
    VERTICAL = 'odo-carousel--vertical',
    WRAPPER = 'odo-carousel__wrapper',
    CAROUSEL_ELEMENT = 'odo-carousel__element',
    SLIDE = 'odo-carousel__slide',
    ACTIVE_SLIDE = 'odo-carousel__slide--active',
    PREVIOUS_SLIDE = 'odo-carousel__slide--previous',
    PAST_SLIDE = 'odo-carousel__slide--past',
    NEXT_SLIDE = 'odo-carousel__slide--next',
    FUTURE_SLIDE = 'odo-carousel__slide--future',
    VISIBLE = 'odo-carousel__slide--visible',
    BEHIND = 'odo-carousel__slide--behind',
    PAGINATION = 'odo-carousel__pagination',
    PAGINATION_DOT = 'odo-carousel__pagination-dot',
    PAGINATION_DOT_SELECTED = 'is-selected',
    PADDLES = 'odo-carousel__nav-paddles',
    PADDLE = 'odo-carousel__nav-paddle',
    PADDLE_NEXT = 'odo-carousel__nav-next',
    PADDLE_PREV = 'odo-carousel__nav-prev',
    PADDLE_DISABLED = 'is-disabled',
    SLIDE_CHILD = 'odo-carousel__slide-child',
  }

  /**
   * Events emitted by carousel instances.
   */
  enum EventType {
    WILL_NAVIGATE = 'odocarousel:willnavigate',
    SLIDE_START = 'odocarousel:slidestart',
    SLIDE_END = 'odocarousel:slideend',
  }

  /**
   * Default options for each instance.
   */
  const Defaults: OdoCarousel.Options;

  let TRANSITION_END_WAIT: number;
}
