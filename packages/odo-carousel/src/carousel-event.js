
class CarouselEvent {
  /**
   * Object representing a carousel event.
   * @param {string} type Event type.
   * @param {Carousel} carousel The carousel instance.
   * @param {number=} optFrom The logical index the carousel is coming from.
   * @param {number=} optTo The logical index the carouesl is going to.
   * @constructor
   */
  constructor(type, carousel, optFrom, optTo) {
    this.type = type;

    /** @type {HTMLElement} */
    this.target = carousel.element;

    /** @type {number} carousel slid from this index. */
    this.from = optFrom;

    /** @type {number} carousel slid to this index. */
    this.to = optTo;

    /** @type {boolean} Whether the carousel actually changed slides. */
    this.hasSlideChanged = optFrom !== optTo;

    /** @type {boolean} Whether `preventDefault` has been called. */
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

export default CarouselEvent;
