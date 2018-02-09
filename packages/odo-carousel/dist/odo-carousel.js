(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('tiny-emitter'), require('@odopod/odo-device'), require('@odopod/odo-pointer'), require('@odopod/odo-draggable'), require('@odopod/odo-helpers')) :
	typeof define === 'function' && define.amd ? define(['tiny-emitter', '@odopod/odo-device', '@odopod/odo-pointer', '@odopod/odo-draggable', '@odopod/odo-helpers'], factory) :
	(global.OdoCarousel = factory(global.TinyEmitter,global.OdoDevice,global.OdoPointer,global.OdoDraggable,global.OdoHelpers));
}(this, (function (TinyEmitter,OdoDevice,OdoPointer,OdoDraggable,odoHelpers) { 'use strict';

TinyEmitter = TinyEmitter && TinyEmitter.hasOwnProperty('default') ? TinyEmitter['default'] : TinyEmitter;
OdoDevice = OdoDevice && OdoDevice.hasOwnProperty('default') ? OdoDevice['default'] : OdoDevice;
OdoPointer = OdoPointer && OdoPointer.hasOwnProperty('default') ? OdoPointer['default'] : OdoPointer;
OdoDraggable = OdoDraggable && OdoDraggable.hasOwnProperty('default') ? OdoDraggable['default'] : OdoDraggable;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var CarouselEvent = function () {
  /**
   * Object representing a carousel event.
   * @param {string} type Event type.
   * @param {Carousel} carousel The carousel instance.
   * @param {number=} optFrom The logical index the carousel is coming from.
   * @param {number=} optTo The logical index the carouesl is going to.
   * @constructor
   */
  function CarouselEvent(type, carousel, optFrom, optTo) {
    classCallCheck(this, CarouselEvent);

    this.type = type;

    /** @type {Element} */
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

  CarouselEvent.prototype.preventDefault = function preventDefault() {
    this.defaultPrevented = true;
  };

  return CarouselEvent;
}();

var settings = {

  /**
   * Event types emitted by the carousel.
   * @enum {string}
   */
  EventType: {
    WILL_NAVIGATE: 'odocarousel:willnavigate',
    SLIDE_START: 'odocarousel:slidestart',
    SLIDE_END: 'odocarousel:slideend'
  },

  /** @enum {string} */
  Classes: {
    BASE: 'odo-carousel',
    FADE: 'odo-carousel--fade',
    VERTICAL: 'odo-carousel--vertical',
    WRAPPER: 'odo-carousel__wrapper',
    CAROUSEL_ELEMENT: 'odo-carousel__element',

    SLIDE: 'odo-carousel__slide',
    ACTIVE_SLIDE: 'odo-carousel__slide--active',
    PREVIOUS_SLIDE: 'odo-carousel__slide--previous',
    PAST_SLIDE: 'odo-carousel__slide--past',
    NEXT_SLIDE: 'odo-carousel__slide--next',
    FUTURE_SLIDE: 'odo-carousel__slide--future',

    VISIBLE: 'odo-carousel__slide--visible',
    BEHIND: 'odo-carousel__slide--behind',

    PAGINATION: 'odo-carousel__pagination',
    PAGINATION_DOT: 'odo-carousel__pagination-dot',
    PAGINATION_DOT_SELECTED: 'is-selected',

    PADDLES: 'odo-carousel__nav-paddles',
    PADDLE: 'odo-carousel__nav-paddle',
    PADDLE_NEXT: 'odo-carousel__nav-next',
    PADDLE_PREV: 'odo-carousel__nav-prev',
    PADDLE_DISABLED: 'is-disabled',

    SLIDE_CHILD: 'odo-carousel__slide-child'
  },

  Defaults: {
    startIndex: 0,
    isVertical: false,
    isLooped: false,
    isJumped: false,
    isFade: false,
    isCentered: false,
    neighborCount: 1,
    slideshowSpeed: 1000,
    animationSpeed: 400,
    crossfadeAmount: 0.875,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    pagination: false,
    getNavPaddleHtml: null,
    getPaginationHtml: null,
    template: {
      paddles: '<nav class="odo-carousel__nav-paddles">{{ prev }}{{ next }}</nav>',
      paddleNext: '<a href="javascript:void(0)" role="button" aria-label="next slide" class="odo-carousel__nav-paddle odo-carousel__nav-next">{{ paddleInner }}</a>',
      paddlePrev: '<a href="javascript:void(0)" role="button" aria-label="previous slide" class="odo-carousel__nav-paddle odo-carousel__nav-prev">{{ paddleInner }}</a>',
      paddleNextInner: '<svg viewBox="75.4 27 461.2 738"><path d="M167.7 27l368.9 369-368.9 369-92.3-92.3 276.7-276.7-276.7-276.7z"/></svg>',
      paddlePrevInner: '<svg viewBox="75.396 26.994 461.208 738.012"><path d="M444.336 765.006l-368.94-369.006 368.94-369.006 92.268 92.268-276.738 276.738 276.738 276.738z"/></svg>',
      pagination: '<nav class="odo-carousel__pagination" role="tablist">{{ dots }}</nav>',
      paginationDot: '<a href="javascript:void(0)" role="tab" aria-label="Go to slide {{ index1 }}" aria-controls="{{ slideId }}" aria-selected="false" class="odo-carousel__pagination-dot" data-index="{{ index }}"></a>',
      paginationDotSecondary: '<a href="javascript:void(0)" role="tab" aria-label="Go to slide {{ index1 }}" aria-controls="{{ slideId }}" aria-selected="false" class="odo-carousel__pagination-dot" data-index="{{ index }}" data-secondary-index="{{ secondaryIndex }}" aria-hidden="{{ hidden }}"></a>'
    }
  },

  TRANSITION_END_WAIT: 32
};

/**
 * A simple string replacement template with double curly braces. You can use
 * nested objects and functions too.
 *
 * Usage:
 *     template("Today is {{ day }}", {
 *       day: 'Friday'
 *     }); // "Today is Friday"
 *
 *     template("Today is {{ month.day }}", {
 *       month: {
 *         day: "Friday"
 *       }
 *     }); // "Today is Friday
 *
 *     template("Today is {{ day }}", {
 *       dayOfTheWeek: 'Friday',
 *       day: function() {
 *         return this.dayOfTheWeek;
 *       }
 *     }); // "Today is Friday"
 *
 *
 * @param {string} str Template.
 * @param {Object} data Data object with keys which match your template.
 * @return {string}
 */
function template(str, data) {
  // A modified version of Malsup's template method for Cycle.
  // https://github.com/malsup/cycle2/blob/master/src/jquery.cycle2.tmpl.js

  // Regex which matches {{cool}} or {{ cool }} where `cool` is what should
  // be replaced.
  return str.replace(/{{\s?((.)?.*?)\s?}}/g, function (match, str) {
    var names = str.split('.');
    var obj = data;
    var property = void 0;

    // If the name has dots in it, "person.name", loop through each one.
    if (names.length > 1) {
      property = obj;
      for (var i = 0; i < names.length; i++) {
        obj = property;
        property = property[names[i]] || str;
      }

      // Otherwise, it's a simple assignment from the data object.
    } else {
      property = obj[str];
    }

    // If they passed a function, use that.
    if (typeof property === 'function') {
      return property.call(obj);
    }

    // Return the string if it exists.
    if (property !== undefined && property !== null && property !== str) {
      return property;
    }

    // Otherwise, return the original string.
    return str;
  });
}

function getTranslate(str) {
  // If no transform is set, the computed transform will be "none".
  if (str === 'none') {
    return {
      x: 0,
      y: 0
    };
  }

  var array = str.match(/(-?[\d.]+)/g);
  return {
    x: parseFloat(array[4]),
    y: parseFloat(array[5])
  };
}

var count = 0;
function uniqueId() {
  count += 1;
  return 'odo-carousel' + count;
}

/**
 * Find every element within the parent which is focusable via tabbing and
 * enable/disable it. Ideally, some property could be set on the parent
 * element itself to prevent tabbing into it. visibility:hidden accomplishes
 * this, but there can be slides in view which are not the current slide.
 * @param {Element} parent Ancestor element to disable tabbing into.
 * @param {boolean} canFocus Whether to enable or disable focusability.
 */
function toggleFocusability(parent, canFocus) {
  var focusableElements = 'a[href],button,details,iframe,input,textarea,select,*[tabindex]';
  var elements = Array.from(parent.querySelectorAll(focusableElements));

  // Test the parent element itself. Odo Helpers polyfills `matches`.
  if (parent.matches(focusableElements)) {
    elements.push(parent);
  }

  for (var i = elements.length - 1; i >= 0; i--) {
    if (canFocus) {
      // Prefer resetting the tabIndex property by using removeAttribute to lets
      // the browser decide if it should go back to 0 (like if it was a button)
      // or to -1 if it wasn't originally focusable.
      elements[i].removeAttribute('tabindex');
    } else {
      elements[i].tabIndex = -1;
    }
  }
}

/**
 * @fileoverview A UI Component for creating versatile carousels. They are
 * peformant, draggable, and can ininitely loop.
 *
 * @author glen@odopod.com (Glen Cheney)
 */

var Carousel = function (_TinyEmitter) {
  inherits(Carousel, _TinyEmitter);

  /**
   * @param {Element} element The outermost carousel element.
   * @param {Object} [options] An options object.
   * @constructor
   * @throws {TypeError} if element isn't an element.
   */
  function Carousel(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Carousel);

    var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

    if (!(element instanceof Element)) {
      throw new TypeError('OdoCarousel requires an element. Got: "' + element + '"');
    }

    _this.element = element;

    /**
     * Deep copy from the defaults and override defaults with options passed in.
     * @public
     */
    _this.options = Carousel.getOptions(options);

    /**
     * Whether the carousel is vertical or horizontal.
     * @type {boolean}
     * @protected
     */
    _this.isVertical = _this.options.isVertical;

    /**
     * Whether this is a looped carousel which is not a fading carousel.
     * @type {boolean}
     */
    _this._isSlidingLooped = _this.options.isLooped && !_this.options.isFade;

    /**
     * The DOM index of the current slide element within the slides' parent.
     * @type {number}
     * @protected
     */
    _this.domIndex = 0;

    /**
     * The previous domIndex value.
     * @type {number}
     * @protected
     */
    _this.lastDomIndex = 0;

    /**
     * Current logical index.
     * @type {number}
     */
    _this._selectedIndex = 0;

    /**
     * The slide container's parent.
     * @type {Element}
     * @private
     */
    _this._slideContainerParentEl = null;

    /**
     * The container for the slides and the element which is moved around with
     * transforms or absolute positioning.
     * @type {Element}
     * @private
     */
    _this._carouselEl = null;

    /**
     * An array of slides (elements) in the carousel.
     * @type {Array.<!Element>}
     * @private
     */
    _this._slides = [];

    /**
     * Whether the carousel is currently skipping slides. For example, going from
     * slide 1 to 3, a jumping carousel repositions the slides so that 3 is next
     * to 1 and only has to animate one slide length to get to it. This flag
     * indicates a slide has been repositioned.
     * @type {boolean}
     * @private
     */
    _this._isJumped = false;

    /**
     * Whether the carousel is able to be used. This can be changed with the
     * `setEnabled` method.
     * @type {boolean}
     * @private
     */
    _this._isEnabled = true;

    /**
     * Top or left.
     * @type {string}
     * @private
     */
    _this._posAttr = _this.isVertical ? 'top' : 'left';

    /**
     * offsetTop or offsetLeft.
     * @type {string}
     * @private
     */
    _this._offsetPosition = 'offset' + odoHelpers.capitalize(_this._posAttr);

    /**
     * Height or width.
     * @type {string}
     * @private
     */
    _this._dimensionAttr = _this.isVertical ? 'height' : 'width';

    /**
     * Value used in `translate{X|Y}()`.
     * @type {string}
     */
    _this._translateAxis = _this.isVertical ? 'Y' : 'X';

    /**
     * A flag indicating that the carousel is animating. It also will have
     * a transition end event lister bound to it if the browser can
     * transition transforms.
     * @type {boolean}
     * @protected
     */
    _this.isTransitioning = false;

    /**
     * The id returned from onTransitionEnd which is used to cancel
     * the transitionend listener.
     * @type {string}
     */
    _this._transitionId = null;

    /**
     * If a selector is specified, gotoSlide will look for this on the last
     * slide and not reveal unneccesary whitespace to the right of the last
     * matched element.
     * @type {boolean}
     * @private
     */
    _this._hasSlideChildren = false;

    /**
     * Default to true for being able to drag the carousel between slides.
     * @type {boolean}
     * @private
     */
    _this._isDraggable = true;

    /**
     * Flag indicating dragging has happened. It is set on dragmove and reset
     * after the draggableend event has been dispatched.
     * @type {boolean}
     */
    _this.hasDragged = false;

    /**
     * Whether the carousel is at a resting position or between slides.
     * @type {boolean}
     */
    _this._isOffset = false;

    /**
     * A Timer used to make the carousel an autoplaying slideshow.
     * @type {Timer}
     * @private
     */
    _this._timer = null;

    /**
     * Time, in milliseconds, to wait before adding zero opacity to the slide,
     * which triggers the css transition. timeout = speed - (speed * %).
     * @type {number}
     * @private
     */
    _this._crossfadeTimeout = _this.options.animationSpeed - _this.options.animationSpeed * _this.options.crossfadeAmount;

    /**
     * When carousel slides are centered, they won't be aligned with the starting
     * edge of the carousel wrapper. The starting edge (relative zero) is used
     * to determine which slide is closest to the current position.
     * @type {number}
     */
    _this._startEdge = 0;

    /**
     * Draggable attached to the carousel element. Used for non-fade carousels.
     * @type {OdoDraggable}
     */
    _this.draggable = null;

    /**
     * Pointer attached to the main element. Used for fading carousels.
     * @type {OdoDraggable}
     */
    _this.pointer = null;

    /**
     * Carousels containing only two slides with looping functionality are special
     * cases. Slides need to be duplicated and pagination needs to be rendered
     * differently. This is because in order for the user to navigate in either
     * direction from the active slide, the second slide would need to be present in
     * both the 'previous' and 'next' positions. 'Bidirectional' will refer to
     * carousels with content that unnaturally exists for the sake of navigational
     * purposes.
     * @type {boolean}
     */
    _this._isBidirectional = false;

    // Deprecated method.
    _this.resetSync = _this.reset;

    // Go.
    _this.decorate();
    return _this;
  }

  /**
   * Finds an element within this class' main element based on a class name.
   * @param {string} className Class name to search for.
   * @param {Element} [context] Optionally provide the context (scope)
   *     for the query. Default is the main element of the class.
   * @return {Array.<Element>} An array which may or may not contain the element
   *     which was searched for.
   */


  Carousel.prototype.getElementsByClass = function getElementsByClass(className) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.element;

    return Array.from(context.getElementsByClassName(className));
  };

  /**
   * Retrieve an element by its class name.
   * @param {string} className Class name to search for.
   * @param {Element} [context] Optinal scope for search.
   * @return {?Element} The element or null if it isn't found.
   */


  Carousel.prototype.getElementByClass = function getElementByClass(className, context) {
    return this.getElementsByClass(className, context)[0] || null;
  };

  /**
   * Modify the DOM to be a carousel.
   */


  Carousel.prototype.decorate = function decorate() {
    this._saveDomElements();

    // After we determine the number of slides, we have enough information to decide if
    // this carousel will be a special bidirectional one.
    if (this.options.isLooped && this._slides.length === 2) {
      this._decorateBidirectionalCarousel();
    }

    this._setA11yAttributes();
    this._renderPaddles();

    if (this.options.pagination) {
      this._renderPagination();
    }

    this._saveRenderedElements();

    this._setSlideIndices();

    if (this.options.isFade) {
      this._decorateFadeCarousel();
    } else {
      this._decorateRegularCarousel();
    }

    this._onClick = this._handleClick.bind(this);
    this.element.addEventListener('click', this._onClick);

    // Set the selected index without animation.
    this.setSelectedIndex(this._getSafeIndex(this.options.startIndex), true);

    // Changes viewport, so it needs to come after the goto zero.
    if (this._isSlidingLooped) {
      this._setNeighborSlides();
      this._snapToCurrentSlide();
    }
  };

  /**
   * Sliding (regular) carousels needs a few more styles and events.
   * @private
   */


  Carousel.prototype._decorateRegularCarousel = function _decorateRegularCarousel() {
    // Add easing to container
    this._carouselEl.style[OdoDevice.Dom.TRANSITION_PROPERTY] = OdoDevice.Css.TRANSFORM;
    this._carouselEl.style[OdoDevice.Dom.TRANSITION_TIMING_FUNCTION] = this.options.easing;

    this._hasSlideChildren = this._getSlideChildren().length > 0;

    this.bindDragEvents();
  };

  /**
   * Sliding (regular) carousels needs a few more styles and events.
   * @private
   */


  Carousel.prototype._decorateFadeCarousel = function _decorateFadeCarousel() {
    var _this2 = this;

    this._isDraggable = false;

    // Add transitions to each slide.
    this.getSlides().forEach(function (slide, i) {
      slide.style[OdoDevice.Dom.TRANSITION] = 'opacity ' + _this2.options.animationSpeed + 'ms linear';

      // The first slide needs to have the visible class.
      if (i === 0) {
        slide.classList.add(Carousel.Classes.VISIBLE);
      }
    });

    this.bindSwipeEvents();
  };

  /**
   * Sets up the additional DOM modifications that will be needed for bidirectional
   * carousels. We will essentially be duplicating both carousel slides so that no
   * matter the current index, the active slide will alway have neighbors on either side.
   * Then later on, we hide the additional pagination.
   * @private
   */


  Carousel.prototype._decorateBidirectionalCarousel = function _decorateBidirectionalCarousel() {
    var _this3 = this;

    // Bidirectional carousels automatically will need to become a jumped carousels,
    // since we will be adding artificial slides that ruin natural navigation.
    this._isBidirectional = true;
    this._isJumped = true;

    // Turn 2 slides into 4.
    this._slides.forEach(function (slide) {
      _this3.getCarouselElement().appendChild(slide.cloneNode(true));
    });

    // Update the global slides variable to include the new elements.
    this._slides = this.getElementsByClass(Carousel.Classes.SLIDE);
  };

  /**
   * Set static accessibility attributes.
   */


  Carousel.prototype._setA11yAttributes = function _setA11yAttributes() {
    this.getWrapper().setAttribute('aria-live', 'polite');
    this.getCarouselElement().setAttribute('role', 'list');
    this.getSlides().forEach(function (slide) {
      odoHelpers.giveId(slide, uniqueId);
      slide.setAttribute('role', 'listitem');
    });
  };

  /**
   * Remove static accessibility attributes.
   */


  Carousel.prototype._removeA11yAttributes = function _removeA11yAttributes() {
    this.getWrapper().removeAttribute('aria-live');
    this.getCarouselElement().removeAttribute('role');
    this.getSlides().forEach(function (slide) {
      slide.removeAttribute('role');
    });
  };

  /**
   * Store references to commonly used DOM elements.
   * @private
   */


  Carousel.prototype._saveDomElements = function _saveDomElements() {
    // Element which wraps the element which contains all the slides.
    this._slideContainerParentEl = this.getElementByClass(Carousel.Classes.WRAPPER);

    // Element which contains all the slides.
    this._carouselEl = this.getElementByClass(Carousel.Classes.CAROUSEL_ELEMENT);

    // Because carousels can have carousels inside them, finding elements by
    // class retrieves too many elements.
    this._slides = this.getElementsByClass(Carousel.Classes.SLIDE);
  };

  /**
   * Store references to generated elements. The pagination dots cannot be save in
   * `_saveDomElements` because the number of slides is not yet known.
   * @private
   */


  Carousel.prototype._saveRenderedElements = function _saveRenderedElements() {
    this._paddlePrevious = this.getElementByClass(Carousel.Classes.PADDLE_PREV);
    this._paddleNext = this.getElementByClass(Carousel.Classes.PADDLE_NEXT);
    this._paginationDots = this.getElementsByClass(Carousel.Classes.PAGINATION_DOT).map(function (dot) {
      return {
        dot: dot,
        i: parseInt(dot.getAttribute('data-index'), 10),
        i2: parseInt(dot.getAttribute('data-secondary-index'), 10)
      };
    });
  };

  /**
   * Add navigation paddles (previous and next buttons) to the carousel.
   * @private
   */


  Carousel.prototype._renderPaddles = function _renderPaddles() {
    this.element.insertAdjacentHTML('beforeend', this._getNavPaddleHtml());
  };

  /**
   * Remove navigation paddles from the carousel (if they exist).
   * @private
   */


  Carousel.prototype._removePaddles = function _removePaddles() {
    this._removeByClass(Carousel.Classes.PADDLES);
  };

  /**
   * Remove a child element by class, if it exists.
   * @param {string} className Class name of the element to find and remove.
   */


  Carousel.prototype._removeByClass = function _removeByClass(className) {
    var element = this.getElementByClass(className);
    if (element) {
      element.parentNode.removeChild(element);
    }
  };

  /**
   * Retrieves the html string for the nav paddles from the templates.
   * @return {string} A string of html.
   * @private
   */


  Carousel.prototype._getNavPaddleHtml = function _getNavPaddleHtml() {
    if (typeof this.options.getNavPaddleHtml === 'function') {
      return this.options.getNavPaddleHtml.call(this, this);
    }

    return Carousel.template(this.options.template.paddles, {
      prev: Carousel.template(this.options.template.paddlePrev, {
        paddleInner: this.options.template.paddlePrevInner
      }),
      next: Carousel.template(this.options.template.paddleNext, {
        paddleInner: this.options.template.paddleNextInner
      })
    });
  };

  /**
   * Add pagination (the dots) to the carousel.
   * @private
   */


  Carousel.prototype._renderPagination = function _renderPagination() {
    this.element.insertAdjacentHTML('beforeend', this._getPaginationHtml());
  };

  /**
   * Remove pagination from the carousel (if they exist).
   * @private
   */


  Carousel.prototype._removePagination = function _removePagination() {
    this._removeByClass(Carousel.Classes.PAGINATION);
  };

  /**
   * Retrieves the html string for the pagination from the templates.
   * @return {string} A string of html.
   * @private
   */


  Carousel.prototype._getPaginationHtml = function _getPaginationHtml() {
    if (typeof this.options.getPaginationHtml === 'function') {
      return this.options.getPaginationHtml.call(this, this);
    }

    var dots = this._buildPaginationHtml();

    return Carousel.template(this.options.template.pagination, {
      dots: dots
    });
  };

  /**
   * Builds and returns the HTML string of the pagination dots.
   * Bidirectional carousels utilize a separate template that includes
   * secondary indices.
   * @return {string}
   * @private
   */


  Carousel.prototype._buildPaginationHtml = function _buildPaginationHtml() {
    var _this4 = this;

    var template$$1 = this._isBidirectional ? this.options.template.paginationDotSecondary : this.options.template.paginationDot;

    return this.getSlides().reduce(function (dotsHtml, slide, i, arr) {
      var data = {
        index: i,
        index1: i + 1,
        slideId: slide.id
      };

      if (_this4._isBidirectional) {
        // If you are rendering pagination for a bidirectional carousel, you will need
        // secondary indices computed. This returns the secondary index based on the primary.
        // i.e. For 4 slides, 1 returns 3, 2 returns 4 and the inverse.
        data.secondaryIndex = i > 1 ? i % 2 : i + 2;
        data.hidden = i >= arr.length / 2;
      }

      return dotsHtml + Carousel.template(template$$1, data);
    }, '');
  };

  /**
   * Listen for dragging events.
   * @protected
   */


  Carousel.prototype.bindDragEvents = function bindDragEvents() {
    this.draggable = new OdoDraggable(this._carouselEl, {
      axis: this.isVertical ? OdoPointer.Axis.Y : OdoPointer.Axis.X
    });

    this._onDragStart = this._handleDragStart.bind(this);
    this._onDragMove = this._handleDragMove.bind(this);
    this._onDragEnd = this._handleDragEnd.bind(this);

    this.draggable.on(OdoDraggable.EventType.START, this._onDragStart);
    this.draggable.on(OdoDraggable.EventType.MOVE, this._onDragMove);
    this.draggable.on(OdoDraggable.EventType.END, this._onDragEnd);
  };

  /**
   * Listen for the pointer to come up from the screen, then execute a callback.
   * @protected
   */


  Carousel.prototype.bindSwipeEvents = function bindSwipeEvents() {
    this.pointer = new OdoPointer(this._carouselEl, {
      axis: OdoPointer.Axis.X,
      preventEventDefault: true
    });

    this._onPointerEnd = this._handlePointerEnd.bind(this);
    this.pointer.on(OdoPointer.EventType.END, this._onPointerEnd);
  };

  /**
   * Add a slide to the end of the carousel.
   * @param {string} slideHtml Html string for the slide.
   */


  Carousel.prototype.addSlide = function addSlide(slideHtml) {
    // Make sure looped carousels are in the right order without any neighbors.
    this._setSlidesToLogicalOrder();

    // Insert new slide at the end.
    this._carouselEl.insertAdjacentHTML('beforeend', slideHtml);

    this.reset();
  };

  /**
   * Synchronously reset the slides. Use this when you're sure the elements
   * within the carousel are done changing.
   */


  Carousel.prototype.reset = function reset() {
    // Update the slides.
    this._saveDomElements();

    // Remove old paddles + pagination.
    this._removePaddles();
    this._removePagination();

    this._setA11yAttributes();

    // Re-render paddles and pagination.
    this._renderPaddles();
    if (this.options.pagination) {
      this._renderPagination();
    }

    this._saveRenderedElements();

    // Update slide indices now that there's a new slide.
    this._setSlideIndices();

    // Go to the slide it was at before.
    var selected = this.getSelectedIndex();
    this.setSelectedIndex(0, true);

    // Try going back to the previous one.
    this.setSelectedIndex(selected, true);

    // Set neighbors slides for looped carousels.
    if (this._isSlidingLooped) {
      this._setNeighborSlides();
      this._snapToCurrentSlide();
    }
  };

  /**
   * Retreives the cached carousel wrapper element.
   * @return {Element}
   */


  Carousel.prototype.getWrapper = function getWrapper() {
    return this._slideContainerParentEl;
  };

  /**
   * Retreives the cached carousel element.
   * @return {Element}
   */


  Carousel.prototype.getCarouselElement = function getCarouselElement() {
    return this._carouselEl;
  };

  /**
   * Returns the array of slides in the carousel.
   * @return {!Array.<!Element>} The slides array.
   */


  Carousel.prototype.getSlides = function getSlides() {
    return this._slides;
  };

  /**
   * Get the slide element at the given index.
   * @param {number} index The logical index of the slide you want.
   * @return {Element} The slide element.
   */


  Carousel.prototype.getSlide = function getSlide(index) {
    return this.getSlides()[index];
  };

  /**
   * Get the index of the currently active slide.
   * @return {number} Index of the current slide.
   */


  Carousel.prototype.getSelectedIndex = function getSelectedIndex() {
    return this._selectedIndex;
  };

  /**
   * Translates the original index to the current DOM index.
   * @param {number} logicalIndex The original index of the slide to get.
   * @return {number} Index of the slide (zero based).
   * @private
   */


  Carousel.prototype._getDomIndex = function _getDomIndex(logicalIndex) {
    return this.getSlideIndices().indexOf(logicalIndex);
  };

  /**
   * Translates the DOM index to the original logical index.
   * @param {number} domIndex The original index of the slide to get.
   * @return {number} Index of the slide (zero based).
   * @private
   */


  Carousel.prototype._getLogicalIndex = function _getLogicalIndex(domIndex) {
    return this.getSlideIndices()[domIndex];
  };

  /**
   * Takes a logical index which could potentially be out of range and returns
   * the logical index within range.
   * @param {number} logicalIndex Logical index to make safe.
   * @return {number} Safe logical index.
   * @private
   */


  Carousel.prototype._getSafeIndex = function _getSafeIndex(logicalIndex) {
    if (this.isIndexOutOfRange(logicalIndex)) {
      if (this.options.isLooped) {
        return this._getRelativeIndex(logicalIndex, 0);
      }
      return this.clampIndexToSlides(logicalIndex);
    }
    return logicalIndex;
  };

  /**
   * Calculates the offset index for a circular list.
   * @param {number} index Starting index.
   * @param {number} displacement Offset from the starting index. Can be negative
   *     or positive. For example, -2 or 2.
   * @param {number} length Length of the list.
   * @return {number} The index of the relative displacement, wrapping around
   *     the end of the list to the start when the displacement is larger than
   *     what's left in the list.
   */


  Carousel.prototype._getRelativeIndex = function _getRelativeIndex(index, displacment) {
    return odoHelpers.wrapAroundList(index, displacment, this._slides.length);
  };

  /**
   * @return {boolean} Whether a given index is out of range of the carousel.
   */


  Carousel.prototype.isIndexOutOfRange = function isIndexOutOfRange(index) {
    return index <= -1 || index >= this._slides.length;
  };

  Carousel.prototype.clampIndexToSlides = function clampIndexToSlides(index) {
    return odoHelpers.clamp(index, 0, this._slides.length - 1);
  };

  /**
   * @return {boolean} Whether the carousel is currently on the first slide.
   */


  Carousel.prototype.isFirstSlide = function isFirstSlide() {
    return this.getSelectedIndex() === 0;
  };

  /**
   * @return {boolean} Whether the carousel is currently on the last slide.
   */


  Carousel.prototype.isLastSlide = function isLastSlide() {
    return this.getSelectedIndex() === this._slides.length - 1;
  };

  /**
   * Generates the array which will follow the DOM order of the slides in their
   * container and saves it.
   * @private
   */


  Carousel.prototype._setSlideIndices = function _setSlideIndices() {
    this._slideIndices = new Array(this._slides.length);

    for (var i = 0, len = this._slides.length; i < len; i++) {
      this._slideIndices[i] = i;
    }
  };

  /** @return {!Array.<!number>} The slide indices array. */


  Carousel.prototype.getSlideIndices = function getSlideIndices() {
    return this._slideIndices;
  };

  /**
   * Retrieves the slide children.
   * @param {Element=} optSlide Slide to look within.
   * @return {Array.<Element>} NodeList of slide children.
   * @private
   */


  Carousel.prototype._getSlideChildren = function _getSlideChildren(optSlide) {
    return this.getElementsByClass(Carousel.Classes.SLIDE_CHILD, optSlide);
  };

  /**
   * Modifieds the _slideIndices array to represent the DOM order of the slides
   * within their container.
   * @param {number} currentValue The value to be moved. This is the same as the
   *     logical index.
   * @param {number} toIndex The location to move it to in the array. It will be
   *     clamped between zero and one less than the length of the array. This is
   *     also referred to as the DOM index.
   * @private
   */


  Carousel.prototype._moveIndex = function _moveIndex(currentValue, toIndex) {
    var clampedIndex = this.clampIndexToSlides(toIndex);
    var fromIndex = this._getDomIndex(currentValue);
    var arr = this._slideIndices;

    // Array moveIndex.
    arr.splice(clampedIndex, 0, arr.splice(fromIndex, 1)[0]);
  };

  /**
   * Swaps positions of two logical indices in the slide indices array.
   * @param {number} logIndex1 First logical index which will be swappeed.
   * @param {number} logIndex2 Second logical index to be swapped.
   * @private
   */


  Carousel.prototype._swapIndexes = function _swapIndexes(logIndex1, logIndex2) {
    var domIndexOfLogicalIndex1 = this._getDomIndex(logIndex1);
    this._slideIndices[domIndexOfLogicalIndex1] = -1;
    this._slideIndices[this._getDomIndex(logIndex2)] = logIndex1;
    this._slideIndices[domIndexOfLogicalIndex1] = logIndex2;
  };

  /**
   * Gets the slide positions (offsets from the left|top) array.
   * @param {Array.<Element>} slideSet the slides array.
   * @return {Array.<number>} array of slide positions.
   * @private
   */


  Carousel.prototype._getPositions = function _getPositions(slideSet) {
    var _this5 = this;

    var bounds = this.getWrapper().getBoundingClientRect()[this._posAttr];
    return slideSet.map(function (el) {
      return el.getBoundingClientRect()[_this5._posAttr] - bounds;
    });
  };

  /**
   * Enable or disable dragging.
   * @param {boolean} enabled Whether it should be draggable.
   * @private
   */


  Carousel.prototype._setDraggableEnabled = function _setDraggableEnabled(enabled) {
    if (this.draggable) {
      this.draggable.isEnabled = enabled;
    } else {
      this.pointer.isEnabled = enabled;
    }
  };

  /**
   * Enable or disable dragging of the carousel.
   * @param {boolean} isDraggable Whether it should be draggable.
   */


  Carousel.prototype.setDraggable = function setDraggable(isDraggable) {
    this._isDraggable = isDraggable;
    this._setDraggableEnabled(isDraggable);
  };

  /**
   * Public method which returns the enabled state.
   * @return {boolean}
   */


  /**
   * Gets the adjusted position.
   * @param {Element} destinationSlide The slide the carousel is headed to.
   * @return {number} The position it is.
   * @private
   */
  Carousel.prototype._getNewPosition = function _getNewPosition(destinationSlide) {
    // Destination position.
    var destinationPosition = destinationSlide[this._offsetPosition];

    // Width or height of the carousel element.
    var carouselSize = odoHelpers.getSize(this.getCarouselElement())[this._dimensionAttr];

    if (this.options.isCentered) {
      var destinationSize = odoHelpers.getSize(destinationSlide)[this._dimensionAttr];
      var wrapperSize = odoHelpers.getSize(this.getWrapper())[this._dimensionAttr];
      this._startEdge = (wrapperSize - destinationSize) / 2;
      destinationPosition -= this._startEdge;
    }

    var position = destinationPosition / carouselSize;

    if (this._hasSlideChildren && this.isLastSlide()) {
      // Adjust the position again if there are slide children in the last slide.
      position = this._getPositionForSlideChildren(destinationSlide, destinationPosition, carouselSize);
    }

    return position;
  };

  /**
   * Adjust the destination position again if there are slide children.
   * @param {Element} destinationSlide Slide element.
   * @param {number} destinationPosition Where the slide would initially go.
   * @param {number} carouselSize Width or height of the carousel element.
   * @return {number} New destination position.
   * @private
   */


  Carousel.prototype._getPositionForSlideChildren = function _getPositionForSlideChildren(destinationSlide, destinationPosition, carouselSize) {
    // Size of the combined width/height + margins of the slide children
    // within the destination slide.
    var childrenSum = odoHelpers.getElementsSize(this._getSlideChildren(destinationSlide), this._dimensionAttr);

    // width|height of the carousel slide.
    var slideSize = odoHelpers.getSize(destinationSlide)[this._dimensionAttr];

    // The destination position minus the empty space in the next slide in px.
    var newPosition = destinationPosition - (slideSize - childrenSum);

    // Calculate the percentage from the pixel value.
    return newPosition / carouselSize;
  };

  /**
   * Returns the translated position based on carousel direction.
   * @param {string} pos The position (eg "25%").
   * @return {string} the css value for transform.
   * @private
   */


  Carousel.prototype._getCssPosition = function _getCssPosition(pos) {
    return 'translate' + this._translateAxis + '(' + pos + ')';
  };

  /** @private */


  Carousel.prototype._setSlidesToLogicalOrder = function _setSlidesToLogicalOrder() {
    var frag = document.createDocumentFragment();

    this._slides.forEach(frag.appendChild, frag);

    this._carouselEl.appendChild(frag);

    // Reset the slide indices array.
    this._setSlideIndices();
  };

  /**
   * If this is a jumped carousel, prepare the slides for the jump by swapping
   * elements out and setting the `isJumped` option.
   * @param {number} toDomIndex Index of the slide the carousel is jumping to.
   * @return {number} If this function changed the order the slides, it returns
   *     the new DOM index the carousel is going to. Otherwise it returns the
   *     DOM index parameter it was given.
   * @private
   */


  Carousel.prototype._setNeighborSlidesForJump = function _setNeighborSlidesForJump(toDomIndex) {
    var toLogicalIndex = this._getLogicalIndex(toDomIndex);
    var currentLogicalIndex = this._getLogicalIndex(this.domIndex);

    this._isJumped = true;

    // Where to move the slide to. Next to the current index.
    var destinationDomIndex = toLogicalIndex > currentLogicalIndex ? this.domIndex + 1 : this.domIndex - 1;

    // Swap indices.
    // Swap destination slide with current slide at the destination.
    this._swapSlides(toLogicalIndex, this._getLogicalIndex(destinationDomIndex));

    // Return the dom index the carousel is actually going to.
    return destinationDomIndex;
  };

  /**
   * Swap indices and DOM elements.
   * @param {number} index1 Logical index 1.
   * @param {number} index2 Logical index 2.
   * @private
   */


  Carousel.prototype._swapSlides = function _swapSlides(index1, index2) {
    this._swapIndexes(index1, index2);
    odoHelpers.swapElements(this.getSlide(index1), this.getSlide(index2));
  };

  /**
   * This function initializes the slideshow functionality for the
   * carousel. It sets an interval for the slideshow to continue animate
   * based on the option slideshowSpeed.
   */


  Carousel.prototype.startSlideshow = function startSlideshow() {
    // Create the timer if it doesn't already exist.
    if (!this._timer) {
      this._timer = new odoHelpers.Timer(this._slideshowTimerExpired.bind(this), this.options.slideshowSpeed, true);
    }

    this._timer.start();
  };

  /**
   * A simple method which pauses the _timer
   * once thats paused the slideshow will stop ticking.
   * Can be re-initialzed by running `startSlideshow()`
   */


  Carousel.prototype.pauseSlideshow = function pauseSlideshow() {
    if (this._isSlideshowPlaying()) {
      this._timer.stop();
    }
  };

  /**
   * Whether the slideshow timer exists and is currently ticking.
   * @return {boolean}
   * @private
   */


  Carousel.prototype._isSlideshowPlaying = function _isSlideshowPlaying() {
    return !!this._timer && this._timer.isTicking;
  };

  // getNthSibling returns null if it cannot find the nth sibling,
  // but if `null` is used in `insertBefore`, it will append the element
  // to the end.


  Carousel.prototype.getInnocentNeighbor = function getInnocentNeighbor(iterator, isNext) {
    var currentSlideEl = this.getSlide(this.getSelectedIndex());
    return isNext ? odoHelpers.getNthSibling(currentSlideEl, iterator + 1) : odoHelpers.getNthSibling(currentSlideEl, iterator, false) || this._carouselEl.firstElementChild;
  };

  // eslint-disable-next-line class-methods-use-this


  Carousel.prototype.getNeighborInsertionIndex = function getNeighborInsertionIndex(iterator, isNext, currentDomIndex) {
    return isNext ? currentDomIndex + iterator + 1 : currentDomIndex - iterator;
  };

  /**
   *
   * @param {number} iterator Neighbor index.
   * @param {number} relativePos Neighbor index relative to the current index.
   * @param {boolean} isNext Whether to move the slide next or previous.
   * @private
   */


  Carousel.prototype._setNeighborSlide = function _setNeighborSlide(iterator, relativePos, isNext) {
    var index = this.getSelectedIndex();
    var indices = this.getSlideIndices();

    // Previous calls to set neighbor slide may have changed the DOM, so
    // don't rely on stored variables.
    var currentDomIndex = this._getDomIndex(index);

    // Index of the future neighbor relative to the original DOM order.
    var logicalNeighborIndex = this._getRelativeIndex(index, relativePos);

    // Do the slides need to be rearranged? Check the current indices to see
    // if the new neighbors are already there.
    if (indices[currentDomIndex + relativePos] !== logicalNeighborIndex) {
      // The slide to insert the new neighbor before.
      var innocentNeighbor = this.getInnocentNeighbor(iterator, isNext);
      var insertionIndex = this.getNeighborInsertionIndex(iterator, isNext, currentDomIndex);
      var neighborEl = this.getSlide(logicalNeighborIndex);

      // Move the neighbor's index to be a neighbor to the current dom index.
      this._moveIndex(logicalNeighborIndex, insertionIndex);
      this._carouselEl.insertBefore(neighborEl, innocentNeighbor);
    }
  };

  /**
   * This function makes sure that looped carousels always have a neighbor to
   * go to. It repositions the viewport if it has to move slides around.
   * @private
   */


  Carousel.prototype._setNeighborSlides = function _setNeighborSlides() {
    var i = void 0;

    // Set the left neighbor(s).
    for (i = 0; i < this.options.neighborCount; i++) {
      this._setNeighborSlide(i, -(i + 1), false);
    }

    // Set the right neighbor(s).
    for (i = 0; i < this.options.neighborCount; i++) {
      this._setNeighborSlide(i, i + 1, true);
    }
  };

  /**
   * Reset the carousel back to the currently selected slide without animation.
   */


  Carousel.prototype._snapToCurrentSlide = function _snapToCurrentSlide() {
    this.goToSlide(this._getDomIndex(this.getSelectedIndex()), true);
  };

  /**
   * Determine if the distance between current and destination slides is more
   * than one slide. If it's not, there is no need to "jump".
   * @param {number} domIndex DOM index of the slide to go to.
   * @param {boolean} noAnimation Whether or not the slide will be animating.
   * @return {number} DOM index of the slide to go to because moving slides
   *     around to "jump" them will causes indices to change.
   */


  Carousel.prototype._maybeSetJumpedSlides = function _maybeSetJumpedSlides(domIndex, noAnimation) {
    // Determine if the distance between current and destination slides
    // is more than one slide. If it's not, there's no need to "jump".
    if (this.options.isJumped && !noAnimation && Math.abs(this.domIndex - domIndex) > 1) {
      return this._setNeighborSlidesForJump(domIndex);
    }
    return domIndex;
  };

  /**
   * Determine whether or not the carousel can navigate in its current condition.
   * @param {number} domIndex Dom index of the slide to go to.
   * @param {boolean} noAnimation Whether or not the slide will be animating there.
   * @return {boolean}
   */


  Carousel.prototype._canNavigate = function _canNavigate(domIndex, noAnimation) {
    var isSameSlideWithAnimation = domIndex === this.domIndex && !noAnimation;

    // Whether the carousel would be able to move.
    var isOffset = this.hasDragged || this._isOffset;

    // 1) Whether the carousel is enabled.
    // 2) The index is out of range and the carousel isn't set to loop. Silently
    // exit here instead of throwing errors everywhere.
    // 3) Trying to go to the slide it's already on with a transition and no
    // dragging has occured or the carousel is not offset.
    return !(!this._isEnabled || !this.options.isLooped && this.isIndexOutOfRange(domIndex) || isSameSlideWithAnimation && !isOffset);
  };

  Carousel.prototype._toNewSlide = function _toNewSlide() {
    // Set flag meaning the carousel is waiting for a transition end.
    this.isTransitioning = true;

    // Fire event saying the slide started to transition.
    this._emitEvent(new CarouselEvent(Carousel.EventType.SLIDE_START, this, this._getLogicalIndex(this.lastDomIndex), this._getLogicalIndex(this.domIndex)));
  };

  /**
   * Uses Css transforms to move the carousel to a new position.
   * @param {string} position The percentage value.
   * @param {boolean} noAnimation Whether to move with animation or not.
   * @private
   */


  Carousel.prototype._moveToPosition = function _moveToPosition(position, noAnimation) {
    // Set transform.
    this._carouselEl.style[OdoDevice.Dom.TRANSFORM] = this._getCssPosition(position);

    // Set transition speed to zero so that it happens instantly.
    if (noAnimation) {
      this._carouselEl.style[OdoDevice.Dom.TRANSITION_DURATION] = '0ms';

      // Listen for transitionend if it will animate.
    } else {
      // Set transition speed.
      this._carouselEl.style[OdoDevice.Dom.TRANSITION_DURATION] = this.options.animationSpeed + 'ms';

      // This is used as a backup to the transitionend event, which sometimes
      // doesn't fire on iOS 7 Safari when the carousel has only been dragged a
      // few pixels. It's set to go off ~2 frames after the transition end event
      // should have occurred.
      this._transitionId = odoHelpers.onTransitionEnd(this._carouselEl, this._transitionDone, this, OdoDevice.Dom.TRANSFORM, this.options.animationSpeed + Carousel.TRANSITION_END_WAIT);

      this._toNewSlide();
    }
  };

  /**
   * Calculates the offset of the carousel relative to the current slide.
   * @return {number}
   */


  Carousel.prototype._getCarouselOffset = function _getCarouselOffset() {
    var matrix = getComputedStyle(this._carouselEl)[OdoDevice.Dom.TRANSFORM];

    // Round to 1 decimal place because the `_startEdge` can be a decimal.
    var translate = Math.round(getTranslate(matrix)[this._translateAxis.toLowerCase()] * 10) / 10;

    var slideOffset = this.getSlide(this.getSelectedIndex())[this._offsetPosition];
    return slideOffset + translate;
  };

  /**
   * If the carousel is waiting for a transition to finish (going to a slide),
   * but the user tells it to navigate again, the previous listener for the
   * transition end event needs to be canceled. This allows the user to quickly
   * click through the carousel without waiting for each navigation to finish.
   *
   * For jumped and looped carousels, the carousel element needs to be
   * repositioned because setting neighbor slides will cause the elements to
   * shift within the main carousel element. The current offset relative to
   * the current slide is saved before moving any slide elements, then the slide
   * elements are moved, and finally the carousel is set to appear as if the
   * elements never moved.
   */


  Carousel.prototype._cancelMovement = function _cancelMovement() {
    if (!this.isTransitioning) {
      return;
    }

    this.isTransitioning = false;
    odoHelpers.cancelTransitionEnd(this._transitionId);

    // Fading carousels do not need to reposition themselves.
    if (this.options.isFade) {
      return;
    }

    // Save the offset relative to the current slide before slides are moved.
    var carouselSize = odoHelpers.getSize(this.getCarouselElement())[this._dimensionAttr];
    var offset = this._getCarouselOffset();

    if (this._isJumped) {
      this._setSlidesToLogicalOrder();
    }

    if (this._isSlidingLooped) {
      this._setNeighborSlides();
    }

    // Now that the current slide has potentially moved in the DOM, update the
    // carousel's offset.
    var currentSlideEl = this.getSlide(this.getSelectedIndex());
    var newSlideOffset = currentSlideEl[this._offsetPosition];
    var position = (newSlideOffset - offset) / carouselSize;

    // Setting the position here stops the browser from transitioning to the
    // previous position, allowing the user to "catch" the carousel mid-nav.
    this._moveToPosition(position * -100 + '%', true);
    this.draggable.update();
  };

  /**
   * Goes to a given slide.
   * @param {!number} domIndex The slide index relative to DOM order.
   * @param {boolean=} optNoAnimation Whether going to the slide should animate.
   * @protected
   */


  Carousel.prototype.fadeToSlide = function fadeToSlide(domIndex, optNoAnimation) {
    // Get next and previous slides.
    var nextSlide = this.getSlide(domIndex, true);
    var previousSlide = this.getSlide(this.domIndex, true);

    // Listen for transitionend if it will animate.
    if (!optNoAnimation) {
      // Going to a new slide, wait for callback.
      this._transitionId = odoHelpers.onTransitionEnd(nextSlide, this._transitionDone, this);
    }

    // Show next slide. Put the previous behind the next.
    nextSlide.classList.add(Carousel.Classes.VISIBLE);

    if (previousSlide !== nextSlide) {
      previousSlide.classList.add(Carousel.Classes.BEHIND);

      // Delay the previous slide fading out by the specified percentage.
      // The crossfade amount is between 0 and 1. A value of 1 means that both slides
      // will fade at the same time. A crossfade of zero means the previous slide
      // will wait until the next slide has completely faded in before it fades out.
      setTimeout(function () {
        previousSlide.classList.remove(Carousel.Classes.VISIBLE);
      }, this._crossfadeTimeout);
    }

    // Save the last slide index.
    this.lastDomIndex = this.domIndex;
    this.domIndex = domIndex;

    // Emit event for slide start.
    if (!optNoAnimation) {
      this._toNewSlide();
    }
  };

  /**
   * Goes to a given slide.
   * @param {!number} domIndex The slide index relative to DOM order.
   * @param {boolean=} optNoAnimation Whether going to the slide should animate.
   * @protected
   */


  Carousel.prototype.goToSlide = function goToSlide(domIndex, optNoAnimation) {
    // Get the destion slide element from the current DOM order.
    var destinationSlide = this.getSlide(this._getLogicalIndex(domIndex));

    // If the carousel skips inbetween slides, reposition them.
    // DOM index is reassinged here because if the slides are repositioned,
    // the DOM index of the carousel changes.
    var updatedDomIndex = this._maybeSetJumpedSlides(domIndex, optNoAnimation);

    // The position the container will go to.
    var adjustedPosition = this._getNewPosition(destinationSlide) * -100 + '%';

    // Save the last slide index.
    this.lastDomIndex = this.domIndex;
    this.domIndex = updatedDomIndex;

    // Set the css styles to move the carousel element. This also dispatches
    // the slide start event if the carousel element will move with animation.
    this._moveToPosition(adjustedPosition, optNoAnimation);
  };

  /**
   * Helper function for going to a given index. This method should be used
   * instead of the private one to abstract the DOM order stuff.
   * @param {number} index The logical, zero based index of the slide you wish
   *     the carousel to go to.
   * @param {boolean=} optNoAnimation Optional skip the animation in goToSlide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */


  Carousel.prototype.setSelectedIndex = function setSelectedIndex(index, optNoAnimation) {
    var domIndex = this._getDomIndex(index);
    var canNavigate = this._canNavigate(domIndex, optNoAnimation);

    // Will go the the give slide.
    if (canNavigate) {
      // If the event's default action was prevented, return false.
      if (this._emitEvent(new CarouselEvent(Carousel.EventType.WILL_NAVIGATE, this))) {
        return false;
      }

      this._cancelMovement();

      this._selectedIndex = this._getSafeIndex(index);

      // Convert new safe logical index to a DOM index.
      domIndex = this._getDomIndex(this._selectedIndex);

      // Set new classes on the slide elements. This is also where toggling
      // paddles and pagination should go.
      this._setSlidesState();
      this._setPaddleState();
      this._setPaginationState();
      if (this.options.isFade) {
        this.fadeToSlide(domIndex, optNoAnimation);
      } else {
        this.goToSlide(domIndex, optNoAnimation);
      }
    }

    // Otherwise, it will not go to the give slide due to unmet conditions.
    return canNavigate;
  };

  /**
   * Find the nearest slide, and move the carousel to that.
   * @param {boolean} isNext Whether it should go to the nearest slide, but
   *     only in the next direction. False means it should go previous and
   *     anything not true or false will go to the nearest slide regardless
   *     of direction.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */


  Carousel.prototype.goToNearestSlide = function goToNearestSlide(isNext) {
    // Gets positions relative to the wrapper element of each slide.
    var positions = this._getPositions(this.getSlides());

    // Current position (the left side of the carousel wrapper)
    // Gets the closest value in the array to the given value.
    // Index of the closest value.
    var logicalIndex = positions.indexOf(odoHelpers.closest(positions, this._startEdge));

    // When going to a next or previous slide, the closest index could
    // still be the one that's currently selected, but the carousel should
    // still move next/previous because it has enough velocity.
    if (logicalIndex === this.getSelectedIndex()) {
      if (isNext === true) {
        logicalIndex = this._getSafeIndex(logicalIndex + 1);
      } else if (isNext === false) {
        logicalIndex = this._getSafeIndex(logicalIndex - 1);
      }
    }

    return this.setSelectedIndex(logicalIndex);
  };

  /**
   * Go to the next slide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */


  Carousel.prototype.goToNextSlide = function goToNextSlide() {
    return this.setSelectedIndex(this.getSelectedIndex() + 1);
  };

  /**
   * Go to the previous slide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */


  Carousel.prototype.goToPreviousSlide = function goToPreviousSlide() {
    return this.setSelectedIndex(this.getSelectedIndex() - 1);
  };

  /**
   * Sets the past, previous, active, next, and future classes to the appropriate
   * slides.
   * @private
   */


  Carousel.prototype._setSlidesState = function _setSlidesState() {
    var selectedIndex = this.getSelectedIndex();
    var past = this._getSafeIndex(selectedIndex - 2);
    var previous = this._getSafeIndex(selectedIndex - 1);
    var next = this._getSafeIndex(selectedIndex + 1);
    var future = this._getSafeIndex(selectedIndex + 2);

    // This works because the _slides array does not mimic the DOM order.
    this.getSlides().forEach(function (slide, i) {
      var isActive = i === selectedIndex;

      toggleFocusability(slide, isActive);

      slide.setAttribute('aria-hidden', !isActive);

      // Active slide.
      slide.classList.toggle(Carousel.Classes.ACTIVE_SLIDE, isActive);

      // Previous previous slide.
      slide.classList.toggle(Carousel.Classes.PAST_SLIDE, i === past && selectedIndex !== past && previous !== past);

      // Previous slide.
      slide.classList.toggle(Carousel.Classes.PREVIOUS_SLIDE, i === previous && selectedIndex !== previous);

      // Next slide.
      slide.classList.toggle(Carousel.Classes.NEXT_SLIDE, i === next && selectedIndex !== next);

      // Next next slide.
      slide.classList.toggle(Carousel.Classes.FUTURE_SLIDE, i === future && selectedIndex !== future && next !== future);
    });
  };

  Carousel.prototype._setPaginationState = function _setPaginationState() {
    if (this.options.pagination) {
      var selectedIndex = this.getSelectedIndex();
      this._paginationDots.forEach(function (_ref) {
        var dot = _ref.dot,
            i = _ref.i,
            i2 = _ref.i2;

        var selected = selectedIndex === i || selectedIndex === i2;
        dot.classList.toggle(Carousel.Classes.PAGINATION_DOT_SELECTED, selected);
        dot.setAttribute('aria-selected', selected);
      });
    }
  };

  Carousel.prototype._setPaddleState = function _setPaddleState() {
    var notLooped = !this.options.isLooped;
    if (notLooped && this._paddlePrevious) {
      var first = this.isFirstSlide();
      this._paddlePrevious.classList.toggle(Carousel.Classes.PADDLE_DISABLED, first);
      this._paddlePrevious.setAttribute('aria-disabled', first);
    }

    if (notLooped && this._paddleNext) {
      var last = this.isLastSlide();
      this._paddleNext.classList.toggle(Carousel.Classes.PADDLE_DISABLED, last);
      this._paddleNext.setAttribute('aria-disabled', last);
    }
  };

  /**
   * Callback for when the slideshow timer expires.
   * @private
   */


  Carousel.prototype._slideshowTimerExpired = function _slideshowTimerExpired() {
    // Pause the timer if it's at the end.
    if (!this.options.isLooped && this.isLastSlide()) {
      this.pauseSlideshow();
    } else {
      this.goToNextSlide();
    }
  };

  Carousel.prototype._transitionDone = function _transitionDone() {
    var from = this._getLogicalIndex(this.lastDomIndex);
    var to = this._getLogicalIndex(this.domIndex);

    // Needs to come before setting neighbor slides.
    this.isTransitioning = false;

    if (this._isJumped) {
      this._setSlidesToLogicalOrder();
    }

    // Neighboring slides must be set after each transition for looped carousels.
    if (this._isSlidingLooped) {
      this._setNeighborSlides();
    }

    if (this._isJumped || this._isSlidingLooped) {
      this._snapToCurrentSlide();
    }

    if (this.options.isFade) {
      this.getSlide(from).classList.remove(Carousel.Classes.BEHIND);
    }

    // No longer jumped.
    this._isJumped = false;

    // Dispatch slide end event.
    this._emitEvent(new CarouselEvent(Carousel.EventType.SLIDE_END, this, from, to));
  };

  /**
   * Received the pointer end event.
   * @param {PointerEvent} pointerEvent Pointer event object.
   */


  Carousel.prototype._handlePointerEnd = function _handlePointerEnd(pointerEvent) {
    if (this.pointer.hasVelocity(pointerEvent.velocity)) {
      if (pointerEvent.direction === OdoPointer.Direction.RIGHT) {
        this.goToPreviousSlide();
      } else if (pointerEvent.direction === OdoPointer.Direction.LEFT) {
        this.goToNextSlide();
      }
    }
  };

  /**
   * The click listener is bound to the main element. Inside the handler, the target
   * of the click is tested and if it is a pagination dot or paddle, navigation
   * will be started.
   * @param {Event} evt Event object.
   * @private
   */


  Carousel.prototype._handleClick = function _handleClick(evt) {
    var target = evt.target;

    var willNavigate = false;

    // Determine what was clicked.
    var dot = target.closest('.' + Carousel.Classes.PAGINATION_DOT);
    var prev = target.closest('.' + Carousel.Classes.PADDLE_PREV);
    var next = target.closest('.' + Carousel.Classes.PADDLE_NEXT);

    // Navigation dot.
    if (dot) {
      willNavigate = true;
      this.setSelectedIndex(parseInt(dot.getAttribute('data-index'), 10));

      // Left paddle or child of left paddle.
    } else if (prev) {
      willNavigate = true;
      this.goToPreviousSlide();

      // Right paddle or child of right paddle.
    } else if (next) {
      willNavigate = true;
      this.goToNextSlide();

      // If the carousel slides have links in them, some browsers (Firefox), will
      // emit the click event even after a drag if the mouse is still on the
      // clickable element.
    } else if (this.isTransitioning) {
      evt.preventDefault();
    }

    if (willNavigate) {
      evt.preventDefault();

      // Pause slideshow if it's playing.
      this.pauseSlideshow();
    }
  };

  /**
   * Stop animations that were ongoing when you started to drag.
   * @private
   */


  Carousel.prototype._handleDragStart = function _handleDragStart() {
    this.pauseSlideshow();
    this._cancelMovement();

    // Remove transition while dragging.
    this._carouselEl.style[OdoDevice.Dom.TRANSITION_DURATION] = '0ms';
  };

  /**
   * Pointer move event. Set a friction value if on the first/last slide and
   * going towards the edge.
   * @param {PointerEvent} evt Pointer event emitted by draggable.
   * @private
   */


  Carousel.prototype._handleDragMove = function _handleDragMove(_ref2) {
    var delta = _ref2.delta;

    this.hasDragged = this.isVertical ? Math.abs(delta.y) > 0 : Math.abs(delta.x) > 0;
    if (!this.options.isLooped) {
      var friction = this._isMovingTowardsEdge(delta.x, delta.y) ? 0.4 : 1;
      this.draggable.friction = friction;
    }
  };

  /**
   * Depending on how fast you were dragging, either proceed to an adjacent
   * slide or reset position to the nearest one.
   * @param {PointerEvent} evt Pointer event emitted by draggable.
   * @private
   */


  Carousel.prototype._handleDragEnd = function _handleDragEnd(evt) {
    this.draggable.friction = 1;
    this.navigateAfterDrag(evt.velocity, evt.axisDirection, evt.didMoveOnAxis);
    this.hasDragged = false;
    this._isOffset = false;
  };

  Carousel.prototype._shouldGoToPrevious = function _shouldGoToPrevious(hasVelocity, direction) {
    return hasVelocity && (this.options.isLooped || !this.isFirstSlide()) && (direction === OdoPointer.Direction.RIGHT || direction === OdoPointer.Direction.DOWN);
  };

  Carousel.prototype._shouldGoToNext = function _shouldGoToNext(hasVelocity, direction) {
    return hasVelocity && (this.options.isLooped || !this.isLastSlide()) && (direction === OdoPointer.Direction.LEFT || direction === OdoPointer.Direction.UP);
  };

  Carousel.prototype.navigateAfterDrag = function navigateAfterDrag(velocity, direction, didMoveOnAxis) {
    var hasVelocity = this.hasDragged && this.draggable.pointer.hasVelocity(velocity);

    // If dragging has not occurred, the user simply clicked on the carousel.
    // If the user is quickly navigating through the carousel, then clicks on
    // it, the movement will be canceled, but it wouldn't go anywhere because it
    // appears to be going to the same slide. Determine if the carousel is still
    // between slides (offset). If it is, it needs to go to the nearest slide.
    if (!this.hasDragged) {
      this._isOffset = Math.abs(Math.round(this._getCarouselOffset())) > Math.round(this._startEdge);
    }

    // Previous.
    if (this._shouldGoToPrevious(hasVelocity, direction)) {
      this.goToNearestSlide(false);

      // Next.
    } else if (this._shouldGoToNext(hasVelocity, direction)) {
      this.goToNearestSlide(true);

      // Not enough velocity, go to the nearest slide.
      // The distance must at least be 1, otherwise gotoSlide creates an event
      // listener for moving the element by zero pixels and the transition end
      // event doesn't fire.
    } else if (didMoveOnAxis || this._isOffset) {
      this.goToNearestSlide();
    }
  };

  /**
   * Emits a event on this instance.
   * @param {CarouselEvent} event Event object with data.
   * @return {boolean} Whether preventDefault was called on the event.
   */


  Carousel.prototype._emitEvent = function _emitEvent(event) {
    this.emit(event.type, event);
    return event.defaultPrevented;
  };

  /**
   * Whether the carousel is being dragged towards an edge.
   * @param {number} deltaX Change in x during drag.
   * @param {number} deltaY Change in y during drag.
   * @return {boolean}
   * @private
   */


  Carousel.prototype._isMovingTowardsEdge = function _isMovingTowardsEdge(deltaX, deltaY) {
    var toStartEdge = this.isVertical ? deltaY > 0 : deltaX > 0;
    var toEndEdge = this.isVertical ? deltaY < 0 : deltaX < 0;

    return this.isFirstSlide() && toStartEdge || this.isLastSlide() && toEndEdge;
  };

  /**
   * Remove event listeners, DOM references, inline styles, class names, paddles,
   * and pagination added by Carousel.
   */


  Carousel.prototype.dispose = function dispose() {
    if (this._timer) {
      this._timer.dispose();
    }

    this._removeA11yAttributes();
    this._removePaddles();
    this._removePagination();

    // Reset container styles.
    this._carouselEl.style[OdoDevice.Dom.TRANSFORM] = '';
    this._carouselEl.style[OdoDevice.Dom.TRANSITION] = '';

    if (this.options.isFade) {
      this.pointer.off(OdoPointer.EventType.END, this._onPointerEnd);
      this.pointer.dispose();

      this.getSlides().forEach(function (slide) {
        slide.style[OdoDevice.Dom.TRANSITION] = '';
      });
    } else {
      this.draggable.off(OdoDraggable.EventType.START, this._onDragStart);
      this.draggable.off(OdoDraggable.EventType.MOVE, this._onDragMove);
      this.draggable.off(OdoDraggable.EventType.END, this._onDragEnd);

      this.draggable.dispose();
    }

    this.element.removeEventListener('click', this._onClick);

    this._slides.forEach(function (slide) {
      slide.classList.remove(Carousel.Classes.PAST_SLIDE, Carousel.Classes.PREVIOUS_SLIDE, Carousel.Classes.ACTIVE_SLIDE, Carousel.Classes.NEXT_SLIDE, Carousel.Classes.FUTURE_SLIDE, Carousel.Classes.VISIBLE, Carousel.Classes.BEHIND);
    });

    // When the carousel is bidirectional, it has cloned the first two slides
    // and added them to the carousel element. Remove the clones.
    if (this._isBidirectional) {
      this._carouselEl.removeChild(this._slides[2]);
      this._carouselEl.removeChild(this._slides[3]);
    }

    // Null out DOM refs.
    this.element = null;
    this._slideContainerParentEl = null;
    this._carouselEl = null;
    this._paddlePrevious = null;
    this._paddleNext = null;
    this._paginationDots = null;
    this.draggable = null;
    this.pointer = null;
    this._slides.length = 0;
  };

  /**
   * Because Object.assign only does a shallow merge, merge the template option
   * first and then overwrite the main Object.assign result.
   * @param {Object} options Options object.
   * @return {Object} Merged options object with defaults.
   */


  Carousel.getOptions = function getOptions(options) {
    var templates = Object.assign({}, Carousel.Defaults.template, options.template);
    var opts = Object.assign({}, Carousel.Defaults, options);
    opts.template = templates;
    return opts;
  };

  createClass(Carousel, [{
    key: 'isEnabled',
    get: function get$$1() {
      return this._isEnabled;
    }

    /**
     * Toggle the enabled/disabled state of the carousel. When it's disabled, it
     * will not be able to navigate slides.
     * @param {boolean} enabled Whether to enable or disable.
     */
    ,
    set: function set$$1(enabled) {
      this._isEnabled = enabled;
      this._setDraggableEnabled(enabled);
    }
  }]);
  return Carousel;
}(TinyEmitter);

Object.assign(Carousel, settings);

Carousel.template = template;

// Export for testing.
Carousel._getTranslate = getTranslate;

return Carousel;

})));
//# sourceMappingURL=odo-carousel.js.map
