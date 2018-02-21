/**
 * @fileoverview A UI Component for creating versatile carousels. They are
 * peformant, draggable, and can ininitely loop.
 *
 * @author Glen Cheney <glen@odopod.com>
 */

import TinyEmitter from 'tiny-emitter';
import OdoDevice from '@odopod/odo-device';
import OdoPointer from '@odopod/odo-pointer';
import OdoDraggable from '@odopod/odo-draggable';
import {
  cancelTransitionEnd,
  capitalize,
  clamp,
  closest,
  getElementsSize,
  getNthSibling,
  getSize,
  giveId,
  onTransitionEnd,
  swapElements,
  Timer,
  wrapAroundList,
} from '@odopod/odo-helpers';

import CarouselEvent from './carousel-event';
import settings from './settings';
import templateEngine from './template-engine';
import { getTranslate, toggleFocusability, uniqueId } from './utils';

class Carousel extends TinyEmitter {
  /**
   * @param {HTMLElement} element The outermost carousel element.
   * @param {Object} [options] An options object.
   * @constructor
   * @throws {TypeError} if element isn't an element.
   */
  constructor(element, options = {}) {
    super();

    if (!(element instanceof HTMLElement)) {
      throw new TypeError(`OdoCarousel requires an element. Got: "${element}"`);
    }

    this.element = element;

    /**
     * Deep copy from the defaults and override defaults with options passed in.
     * @public
     */
    this.options = Carousel.getOptions(options);

    /**
     * Whether the carousel is vertical or horizontal.
     * @type {boolean}
     * @protected
     */
    this.isVertical = this.options.isVertical;

    /**
     * Whether this is a looped carousel which is not a fading carousel.
     * @type {boolean}
     */
    this._isSlidingLooped = this.options.isLooped && !this.options.isFade;

    /**
     * The DOM index of the current slide element within the slides' parent.
     * @type {number}
     * @protected
     */
    this.domIndex = 0;

    /**
     * The previous domIndex value.
     * @type {number}
     * @protected
     */
    this.lastDomIndex = 0;

    /**
     * Current logical index.
     * @type {number}
     */
    this._selectedIndex = 0;

    /**
     * The slide container's parent.
     * @type {HTMLElement}
     * @private
     */
    this._slideContainerParentEl = null;

    /**
     * The container for the slides and the element which is moved around with
     * transforms or absolute positioning.
     * @type {HTMLElement}
     * @private
     */
    this._carouselEl = null;

    /**
     * An array of slides (elements) in the carousel.
     * @type {Array.<!HTMLElement>}
     * @private
     */
    this._slides = [];

    /**
     * Whether the carousel is currently skipping slides. For example, going from
     * slide 1 to 3, a jumping carousel repositions the slides so that 3 is next
     * to 1 and only has to animate one slide length to get to it. This flag
     * indicates a slide has been repositioned.
     * @type {boolean}
     * @private
     */
    this._isJumped = false;

    /**
     * Whether the carousel is able to be used. This can be changed with the
     * `setEnabled` method.
     * @type {boolean}
     * @private
     */
    this._isEnabled = true;

    /**
     * Top or left.
     * @type {string}
     * @private
     */
    this._posAttr = this.isVertical ? 'top' : 'left';

    /**
     * offsetTop or offsetLeft.
     * @type {string}
     * @private
     */
    this._offsetPosition = 'offset' + capitalize(this._posAttr);

    /**
     * Height or width.
     * @type {string}
     * @private
     */
    this._dimensionAttr = this.isVertical ? 'height' : 'width';

    /**
     * Value used in `translate{X|Y}()`.
     * @type {string}
     */
    this._translateAxis = this.isVertical ? 'Y' : 'X';

    /**
     * A flag indicating that the carousel is animating. It also will have
     * a transition end event lister bound to it if the browser can
     * transition transforms.
     * @type {boolean}
     * @protected
     */
    this.isTransitioning = false;

    /**
     * The id returned from onTransitionEnd which is used to cancel
     * the transitionend listener.
     * @type {number}
     */
    this._transitionId = null;

    /**
     * If a selector is specified, gotoSlide will look for this on the last
     * slide and not reveal unneccesary whitespace to the right of the last
     * matched element.
     * @type {boolean}
     * @private
     */
    this._hasSlideChildren = false;

    /**
     * Default to true for being able to drag the carousel between slides.
     * @type {boolean}
     * @private
     */
    this._isDraggable = true;

    /**
     * Flag indicating dragging has happened. It is set on dragmove and reset
     * after the draggableend event has been dispatched.
     * @type {boolean}
     */
    this.hasDragged = false;

    /**
     * Whether the carousel is at a resting position or between slides.
     * @type {boolean}
     */
    this._isOffset = false;

    /**
     * A Timer used to make the carousel an autoplaying slideshow.
     * @type {Timer}
     * @private
     */
    this._timer = null;

    /**
     * Time, in milliseconds, to wait before adding zero opacity to the slide,
     * which triggers the css transition. timeout = speed - (speed * %).
     * @type {number}
     * @private
     */
    this._crossfadeTimeout = this.options.animationSpeed -
        (this.options.animationSpeed * this.options.crossfadeAmount);

    /**
     * When carousel slides are centered, they won't be aligned with the starting
     * edge of the carousel wrapper. The starting edge (relative zero) is used
     * to determine which slide is closest to the current position.
     * @type {number}
     */
    this._startEdge = 0;

    /**
     * Draggable attached to the carousel element. Used for non-fade carousels.
     * @type {OdoDraggable}
     */
    this.draggable = null;

    /**
     * Pointer attached to the main element. Used for fading carousels.
     * @type {OdoPointer}
     */
    this.pointer = null;

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
    this._isBidirectional = false;

    // Deprecated method.
    this.resetSync = this.reset;

    // Go.
    this.decorate();
  }

  /**
   * Finds an element within this class' main element based on a class name.
   * @param {string} className Class name to search for.
   * @param {HTMLElement} [context] Optionally provide the context (scope)
   *     for the query. Default is the main element of the class.
   * @return {HTMLElement[]} An array which may or may not contain the element
   *     which was searched for.
   */
  getElementsByClass(className, context = this.element) {
    return Array.from(context.getElementsByClassName(className));
  }

  /**
   * Retrieve an element by its class name.
   * @param {string} className Class name to search for.
   * @param {HTMLElement} [context] Optinal scope for search.
   * @return {HTMLElement|null} The element or null if it isn't found.
   */
  getElementByClass(className, context) {
    return this.getElementsByClass(className, context)[0] || null;
  }

  /**
   * Modify the DOM to be a carousel.
   */
  decorate() {
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
  }

  /**
   * Sliding (regular) carousels needs a few more styles and events.
   * @private
   */
  _decorateRegularCarousel() {
    // Add easing to container
    this._carouselEl.style[OdoDevice.Dom.TRANSITION_PROPERTY] = OdoDevice.Css.TRANSFORM;
    this._carouselEl.style[OdoDevice.Dom.TRANSITION_TIMING_FUNCTION] = this.options.easing;

    this._hasSlideChildren = this._getSlideChildren().length > 0;

    this.bindDragEvents();
  }

  /**
   * Sliding (regular) carousels needs a few more styles and events.
   * @private
   */
  _decorateFadeCarousel() {
    this._isDraggable = false;

    // Add transitions to each slide.
    this.getSlides().forEach((slide, i) => {
      slide.style[OdoDevice.Dom.TRANSITION] = 'opacity ' +
        this.options.animationSpeed + 'ms linear';

      // The first slide needs to have the visible class.
      if (i === 0) {
        slide.classList.add(Carousel.Classes.VISIBLE);
      }
    });

    this.bindSwipeEvents();
  }

  /**
   * Sets up the additional DOM modifications that will be needed for bidirectional
   * carousels. We will essentially be duplicating both carousel slides so that no
   * matter the current index, the active slide will alway have neighbors on either side.
   * Then later on, we hide the additional pagination.
   * @private
   */
  _decorateBidirectionalCarousel() {
    // Bidirectional carousels automatically will need to become a jumped carousels,
    // since we will be adding artificial slides that ruin natural navigation.
    this._isBidirectional = true;
    this._isJumped = true;

    // Turn 2 slides into 4.
    this._slides.forEach((slide) => {
      this.getCarouselElement().appendChild(slide.cloneNode(true));
    });

    // Update the global slides variable to include the new elements.
    this._slides = this.getElementsByClass(Carousel.Classes.SLIDE);
  }

  /**
   * Set static accessibility attributes.
   */
  _setA11yAttributes() {
    this.getWrapper().setAttribute('aria-live', 'polite');
    this.getCarouselElement().setAttribute('role', 'list');
    this.getSlides().forEach((slide) => {
      giveId(slide, uniqueId);
      slide.setAttribute('role', 'listitem');
    });
  }

  /**
   * Remove static accessibility attributes.
   */
  _removeA11yAttributes() {
    this.getWrapper().removeAttribute('aria-live');
    this.getCarouselElement().removeAttribute('role');
    this.getSlides().forEach((slide) => {
      slide.removeAttribute('role');
    });
  }

  /**
   * Store references to commonly used DOM elements.
   * @private
   */
  _saveDomElements() {
    // Element which wraps the element which contains all the slides.
    this._slideContainerParentEl = this.getElementByClass(Carousel.Classes.WRAPPER);

    // Element which contains all the slides.
    this._carouselEl = this.getElementByClass(Carousel.Classes.CAROUSEL_ELEMENT);

    // Because carousels can have carousels inside them, finding elements by
    // class retrieves too many elements.
    this._slides = this.getElementsByClass(Carousel.Classes.SLIDE);
  }

  /**
   * Store references to generated elements. The pagination dots cannot be save in
   * `_saveDomElements` because the number of slides is not yet known.
   * @private
   */
  _saveRenderedElements() {
    this._paddlePrevious = this.getElementByClass(Carousel.Classes.PADDLE_PREV);
    this._paddleNext = this.getElementByClass(Carousel.Classes.PADDLE_NEXT);
    this._paginationDots = this.getElementsByClass(Carousel.Classes.PAGINATION_DOT)
      .map(dot => ({
        dot,
        i: parseInt(dot.getAttribute('data-index'), 10),
        i2: parseInt(dot.getAttribute('data-secondary-index'), 10),
      }));
  }

  /**
   * Add navigation paddles (previous and next buttons) to the carousel.
   * @private
   */
  _renderPaddles() {
    this.element.insertAdjacentHTML('beforeend', this._getNavPaddleHtml());
  }

  /**
   * Remove navigation paddles from the carousel (if they exist).
   * @private
   */
  _removePaddles() {
    this._removeByClass(Carousel.Classes.PADDLES);
  }

  /**
   * Remove a child element by class, if it exists.
   * @param {string} className Class name of the element to find and remove.
   */
  _removeByClass(className) {
    const element = this.getElementByClass(className);
    if (element) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * Retrieves the html string for the nav paddles from the templates.
   * @return {string} A string of html.
   * @private
   */
  _getNavPaddleHtml() {
    if (typeof this.options.getNavPaddleHtml === 'function') {
      return this.options.getNavPaddleHtml.call(this, this);
    }

    return Carousel.template(this.options.template.paddles, {
      prev: Carousel.template(this.options.template.paddlePrev, {
        paddleInner: this.options.template.paddlePrevInner,
      }),
      next: Carousel.template(this.options.template.paddleNext, {
        paddleInner: this.options.template.paddleNextInner,
      }),
    });
  }

  /**
   * Add pagination (the dots) to the carousel.
   * @private
   */
  _renderPagination() {
    this.element.insertAdjacentHTML('beforeend', this._getPaginationHtml());
  }

  /**
   * Remove pagination from the carousel (if they exist).
   * @private
   */
  _removePagination() {
    this._removeByClass(Carousel.Classes.PAGINATION);
  }

  /**
   * Retrieves the html string for the pagination from the templates.
   * @return {string} A string of html.
   * @private
   */
  _getPaginationHtml() {
    if (typeof this.options.getPaginationHtml === 'function') {
      return this.options.getPaginationHtml.call(this, this);
    }

    const dots = this._buildPaginationHtml();

    return Carousel.template(this.options.template.pagination, {
      dots,
    });
  }

  /**
   * Builds and returns the HTML string of the pagination dots.
   * Bidirectional carousels utilize a separate template that includes
   * secondary indices.
   * @return {string}
   * @private
   */
  _buildPaginationHtml() {
    const template = this._isBidirectional ?
      this.options.template.paginationDotSecondary :
      this.options.template.paginationDot;

    return this.getSlides().reduce((dotsHtml, slide, i, arr) => {
      const data = {
        index: i,
        index1: i + 1,
        slideId: slide.id,
      };

      if (this._isBidirectional) {
        // If you are rendering pagination for a bidirectional carousel, you will need
        // secondary indices computed. This returns the secondary index based on the primary.
        // i.e. For 4 slides, 1 returns 3, 2 returns 4 and the inverse.
        data.secondaryIndex = i > 1 ? i % 2 : i + 2;
        data.hidden = i >= arr.length / 2;
      }

      return dotsHtml + Carousel.template(template, data);
    }, '');
  }

  /**
   * Listen for dragging events.
   * @protected
   */
  bindDragEvents() {
    this.draggable = new OdoDraggable(this._carouselEl, {
      axis: this.isVertical ? OdoPointer.Axis.Y : OdoPointer.Axis.X,
    });

    this._onDragStart = this._handleDragStart.bind(this);
    this._onDragMove = this._handleDragMove.bind(this);
    this._onDragEnd = this._handleDragEnd.bind(this);

    this.draggable.on(OdoDraggable.EventType.START, this._onDragStart);
    this.draggable.on(OdoDraggable.EventType.MOVE, this._onDragMove);
    this.draggable.on(OdoDraggable.EventType.END, this._onDragEnd);
  }

  /**
   * Listen for the pointer to come up from the screen, then execute a callback.
   * @protected
   */
  bindSwipeEvents() {
    this.pointer = new OdoPointer(this._carouselEl, {
      axis: OdoPointer.Axis.X,
      preventEventDefault: true,
    });

    this._onPointerEnd = this._handlePointerEnd.bind(this);
    this.pointer.on(OdoPointer.EventType.END, this._onPointerEnd);
  }

  /**
   * Add a slide to the end of the carousel.
   * @param {string} slideHtml Html string for the slide.
   */
  addSlide(slideHtml) {
    // Make sure looped carousels are in the right order without any neighbors.
    this._setSlidesToLogicalOrder();

    // Insert new slide at the end.
    this._carouselEl.insertAdjacentHTML('beforeend', slideHtml);

    this.reset();
  }

  /**
   * Synchronously reset the slides. Use this when you're sure the elements
   * within the carousel are done changing.
   */
  reset() {
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
    const selected = this.getSelectedIndex();
    this.setSelectedIndex(0, true);

    // Try going back to the previous one.
    this.setSelectedIndex(selected, true);

    // Set neighbors slides for looped carousels.
    if (this._isSlidingLooped) {
      this._setNeighborSlides();
      this._snapToCurrentSlide();
    }
  }

  /**
   * Retreives the cached carousel wrapper element.
   * @return {HTMLElement}
   */
  getWrapper() {
    return this._slideContainerParentEl;
  }

  /**
   * Retreives the cached carousel element.
   * @return {HTMLElement}
   */
  getCarouselElement() {
    return this._carouselEl;
  }

  /**
   * Returns the array of slides in the carousel.
   * @return {!Array.<!HTMLElement>} The slides array.
   */
  getSlides() {
    return this._slides;
  }

  /**
   * Get the slide element at the given index.
   * @param {number} index The logical index of the slide you want.
   * @return {HTMLElement} The slide element.
   */
  getSlide(index) {
    return this.getSlides()[index];
  }

  /**
   * Get the index of the currently active slide.
   * @return {number} Index of the current slide.
   */
  getSelectedIndex() {
    return this._selectedIndex;
  }

  /**
   * Translates the original index to the current DOM index.
   * @param {number} logicalIndex The original index of the slide to get.
   * @return {number} Index of the slide (zero based).
   * @private
   */
  _getDomIndex(logicalIndex) {
    return this.getSlideIndices().indexOf(logicalIndex);
  }

  /**
   * Translates the DOM index to the original logical index.
   * @param {number} domIndex The original index of the slide to get.
   * @return {number} Index of the slide (zero based).
   * @private
   */
  _getLogicalIndex(domIndex) {
    return this.getSlideIndices()[domIndex];
  }

  /**
   * Takes a logical index which could potentially be out of range and returns
   * the logical index within range.
   * @param {number} logicalIndex Logical index to make safe.
   * @return {number} Safe logical index.
   * @private
   */
  _getSafeIndex(logicalIndex) {
    if (this.isIndexOutOfRange(logicalIndex)) {
      if (this.options.isLooped) {
        return this._getRelativeIndex(logicalIndex, 0);
      }
      return this.clampIndexToSlides(logicalIndex);
    }
    return logicalIndex;
  }

  /**
   * Calculates the offset index for a circular list.
   * @param {number} index Starting index.
   * @param {number} displacement Offset from the starting index. Can be negative
   *     or positive. For example, -2 or 2.
   * @return {number} The index of the relative displacement, wrapping around
   *     the end of the list to the start when the displacement is larger than
   *     what's left in the list.
   */
  _getRelativeIndex(index, displacement) {
    return wrapAroundList(index, displacement, this._slides.length);
  }

  /**
   * @param {number} index Index to test.
   * @return {boolean} Whether a given index is out of range of the carousel.
   */
  isIndexOutOfRange(index) {
    return index <= -1 || index >= this._slides.length;
  }

  /**
   * Constrain an index within bounds.
   * @param {number} index Index to clamp.
   * @return {number}
   */
  clampIndexToSlides(index) {
    return clamp(index, 0, this._slides.length - 1);
  }

  /**
   * @return {boolean} Whether the carousel is currently on the first slide.
   */
  isFirstSlide() {
    return this.getSelectedIndex() === 0;
  }

  /**
   * @return {boolean} Whether the carousel is currently on the last slide.
   */
  isLastSlide() {
    return this.getSelectedIndex() === this._slides.length - 1;
  }

  /**
   * Generates the array which will follow the DOM order of the slides in their
   * container and saves it.
   * @private
   */
  _setSlideIndices() {
    this._slideIndices = new Array(this._slides.length);

    for (let i = 0, len = this._slides.length; i < len; i++) {
      this._slideIndices[i] = i;
    }
  }

  /** @return {!Array.<!number>} The slide indices array. */
  getSlideIndices() {
    return this._slideIndices;
  }

  /**
   * Retrieves the slide children.
   * @param {HTMLElement} [optSlide] Slide to look within.
   * @return {HTMLElement[]} NodeList of slide children.
   * @private
   */
  _getSlideChildren(optSlide) {
    return this.getElementsByClass(Carousel.Classes.SLIDE_CHILD, optSlide);
  }

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
  _moveIndex(currentValue, toIndex) {
    const clampedIndex = this.clampIndexToSlides(toIndex);
    const fromIndex = this._getDomIndex(currentValue);
    const arr = this._slideIndices;

    // Array moveIndex.
    arr.splice(clampedIndex, 0, arr.splice(fromIndex, 1)[0]);
  }

  /**
   * Swaps positions of two logical indices in the slide indices array.
   * @param {number} logIndex1 First logical index which will be swappeed.
   * @param {number} logIndex2 Second logical index to be swapped.
   * @private
   */
  _swapIndexes(logIndex1, logIndex2) {
    const domIndexOfLogicalIndex1 = this._getDomIndex(logIndex1);
    this._slideIndices[domIndexOfLogicalIndex1] = -1;
    this._slideIndices[this._getDomIndex(logIndex2)] = logIndex1;
    this._slideIndices[domIndexOfLogicalIndex1] = logIndex2;
  }

  /**
   * Gets the slide positions (offsets from the left|top) array.
   * @param {HTMLElement[]} slideSet the slides array.
   * @return {Array.<number>} array of slide positions.
   * @private
   */
  _getPositions(slideSet) {
    const bounds = this.getWrapper().getBoundingClientRect()[this._posAttr];
    return slideSet.map(el => el.getBoundingClientRect()[this._posAttr] - bounds);
  }

  /**
   * Enable or disable dragging.
   * @param {boolean} enabled Whether it should be draggable.
   * @private
   */
  _setDraggableEnabled(enabled) {
    if (this.draggable) {
      this.draggable.isEnabled = enabled;
    } else {
      this.pointer.isEnabled = enabled;
    }
  }

  /**
   * Enable or disable dragging of the carousel.
   * @param {boolean} isDraggable Whether it should be draggable.
   */
  setDraggable(isDraggable) {
    this._isDraggable = isDraggable;
    this._setDraggableEnabled(isDraggable);
  }

  /**
   * Public method which returns the enabled state.
   * @return {boolean}
   */
  get isEnabled() {
    return this._isEnabled;
  }

  /**
   * Toggle the enabled/disabled state of the carousel. When it's disabled, it
   * will not be able to navigate slides.
   * @param {boolean} enabled Whether to enable or disable.
   */
  set isEnabled(enabled) {
    this._isEnabled = enabled;
    this._setDraggableEnabled(enabled);
  }

  /**
   * Gets the adjusted position.
   * @param {HTMLElement} destinationSlide The slide the carousel is headed to.
   * @return {number} The position it is.
   * @private
   */
  _getNewPosition(destinationSlide) {
    // Destination position.
    let destinationPosition = destinationSlide[this._offsetPosition];

    // Width or height of the carousel element.
    const carouselSize = getSize(this.getCarouselElement())[this._dimensionAttr];

    if (this.options.isCentered) {
      const destinationSize = getSize(destinationSlide)[this._dimensionAttr];
      const wrapperSize = getSize(this.getWrapper())[this._dimensionAttr];
      this._startEdge = (wrapperSize - destinationSize) / 2;
      destinationPosition -= this._startEdge;
    }

    let position = destinationPosition / carouselSize;

    if (this._hasSlideChildren && this.isLastSlide()) {
      // Adjust the position again if there are slide children in the last slide.
      position = this._getPositionForSlideChildren(
        destinationSlide,
        destinationPosition, carouselSize,
      );
    }

    return position;
  }

  /**
   * Adjust the destination position again if there are slide children.
   * @param {HTMLElement} destinationSlide Slide element.
   * @param {number} destinationPosition Where the slide would initially go.
   * @param {number} carouselSize Width or height of the carousel element.
   * @return {number} New destination position.
   * @private
   */
  _getPositionForSlideChildren(destinationSlide, destinationPosition, carouselSize) {
    // Size of the combined width/height + margins of the slide children
    // within the destination slide.
    const childrenSum = getElementsSize(
      this._getSlideChildren(destinationSlide),
      this._dimensionAttr,
    );

    // width|height of the carousel slide.
    const slideSize = getSize(destinationSlide)[this._dimensionAttr];

    // The destination position minus the empty space in the next slide in px.
    const newPosition = destinationPosition - (slideSize - childrenSum);

    // Calculate the percentage from the pixel value.
    return newPosition / carouselSize;
  }

  /**
   * Returns the translated position based on carousel direction.
   * @param {string} pos The position (eg "25%").
   * @return {string} the css value for transform.
   * @private
   */
  _getCssPosition(pos) {
    return 'translate' + this._translateAxis + '(' + pos + ')';
  }

  /** @private */
  _setSlidesToLogicalOrder() {
    const frag = document.createDocumentFragment();

    this._slides.forEach(frag.appendChild, frag);

    this._carouselEl.appendChild(frag);

    // Reset the slide indices array.
    this._setSlideIndices();
  }

  /**
   * If this is a jumped carousel, prepare the slides for the jump by swapping
   * elements out and setting the `isJumped` option.
   * @param {number} toDomIndex Index of the slide the carousel is jumping to.
   * @return {number} If this function changed the order the slides, it returns
   *     the new DOM index the carousel is going to. Otherwise it returns the
   *     DOM index parameter it was given.
   * @private
   */
  _setNeighborSlidesForJump(toDomIndex) {
    const toLogicalIndex = this._getLogicalIndex(toDomIndex);
    const currentLogicalIndex = this._getLogicalIndex(this.domIndex);

    this._isJumped = true;

    // Where to move the slide to. Next to the current index.
    const destinationDomIndex = toLogicalIndex > currentLogicalIndex ?
      this.domIndex + 1 :
      this.domIndex - 1;

    // Swap indices.
    // Swap destination slide with current slide at the destination.
    this._swapSlides(toLogicalIndex, this._getLogicalIndex(destinationDomIndex));

    // Return the dom index the carousel is actually going to.
    return destinationDomIndex;
  }

  /**
   * Swap indices and DOM elements.
   * @param {number} index1 Logical index 1.
   * @param {number} index2 Logical index 2.
   * @private
   */
  _swapSlides(index1, index2) {
    this._swapIndexes(index1, index2);
    swapElements(this.getSlide(index1), this.getSlide(index2));
  }

  /**
   * This function initializes the slideshow functionality for the
   * carousel. It sets an interval for the slideshow to continue animate
   * based on the option slideshowSpeed.
   */
  startSlideshow() {
    // Create the timer if it doesn't already exist.
    if (!this._timer) {
      this._timer = new Timer(
        this._slideshowTimerExpired.bind(this),
        this.options.slideshowSpeed, true,
      );
    }

    this._timer.start();
  }

  /**
   * A simple method which pauses the _timer
   * once thats paused the slideshow will stop ticking.
   * Can be re-initialzed by running `startSlideshow()`
   */
  pauseSlideshow() {
    if (this._isSlideshowPlaying()) {
      this._timer.stop();
    }
  }

  /**
   * Whether the slideshow timer exists and is currently ticking.
   * @return {boolean}
   * @private
   */
  _isSlideshowPlaying() {
    return !!this._timer && this._timer.isTicking;
  }

  // getNthSibling returns null if it cannot find the nth sibling,
  // but if `null` is used in `insertBefore`, it will append the element
  // to the end.
  getInnocentNeighbor(iterator, isNext) {
    const currentSlideEl = this.getSlide(this.getSelectedIndex());
    return isNext ?
      getNthSibling(currentSlideEl, iterator + 1) :
      getNthSibling(currentSlideEl, iterator, false) ||
      this._carouselEl.firstElementChild;
  }

  // eslint-disable-next-line class-methods-use-this
  getNeighborInsertionIndex(iterator, isNext, currentDomIndex) {
    return isNext ?
      currentDomIndex + iterator + 1 :
      currentDomIndex - iterator;
  }

  /**
   *
   * @param {number} iterator Neighbor index.
   * @param {number} relativePos Neighbor index relative to the current index.
   * @param {boolean} isNext Whether to move the slide next or previous.
   * @private
   */
  _setNeighborSlide(iterator, relativePos, isNext) {
    const index = this.getSelectedIndex();
    const indices = this.getSlideIndices();

    // Previous calls to set neighbor slide may have changed the DOM, so
    // don't rely on stored variables.
    const currentDomIndex = this._getDomIndex(index);

    // Index of the future neighbor relative to the original DOM order.
    const logicalNeighborIndex = this._getRelativeIndex(index, relativePos);

    // Do the slides need to be rearranged? Check the current indices to see
    // if the new neighbors are already there.
    if (indices[currentDomIndex + relativePos] !== logicalNeighborIndex) {
      // The slide to insert the new neighbor before.
      const innocentNeighbor = this.getInnocentNeighbor(iterator, isNext);
      const insertionIndex = this.getNeighborInsertionIndex(iterator, isNext, currentDomIndex);
      const neighborEl = this.getSlide(logicalNeighborIndex);

      // Move the neighbor's index to be a neighbor to the current dom index.
      this._moveIndex(logicalNeighborIndex, insertionIndex);
      this._carouselEl.insertBefore(neighborEl, innocentNeighbor);
    }
  }

  /**
   * This function makes sure that looped carousels always have a neighbor to
   * go to. It repositions the viewport if it has to move slides around.
   * @private
   */
  _setNeighborSlides() {
    let i;

    // Set the left neighbor(s).
    for (i = 0; i < this.options.neighborCount; i++) {
      this._setNeighborSlide(i, -(i + 1), false);
    }

    // Set the right neighbor(s).
    for (i = 0; i < this.options.neighborCount; i++) {
      this._setNeighborSlide(i, i + 1, true);
    }
  }

  /**
   * Reset the carousel back to the currently selected slide without animation.
   */
  _snapToCurrentSlide() {
    this.goToSlide(this._getDomIndex(this.getSelectedIndex()), true);
  }

  /**
   * Determine if the distance between current and destination slides is more
   * than one slide. If it's not, there is no need to "jump".
   * @param {number} domIndex DOM index of the slide to go to.
   * @param {boolean} noAnimation Whether or not the slide will be animating.
   * @return {number} DOM index of the slide to go to because moving slides
   *     around to "jump" them will causes indices to change.
   */
  _maybeSetJumpedSlides(domIndex, noAnimation) {
    // Determine if the distance between current and destination slides
    // is more than one slide. If it's not, there's no need to "jump".
    if (this.options.isJumped && !noAnimation && Math.abs(this.domIndex - domIndex) > 1) {
      return this._setNeighborSlidesForJump(domIndex);
    }
    return domIndex;
  }

  /**
   * Determine whether or not the carousel can navigate in its current condition.
   * @param {number} domIndex Dom index of the slide to go to.
   * @param {boolean} noAnimation Whether or not the slide will be animating there.
   * @return {boolean}
   */
  _canNavigate(domIndex, noAnimation) {
    const isSameSlideWithAnimation = domIndex === this.domIndex && !noAnimation;

    // Whether the carousel would be able to move.
    const isOffset = this.hasDragged || this._isOffset;

    // 1) Whether the carousel is enabled.
    // 2) The index is out of range and the carousel isn't set to loop. Silently
    // exit here instead of throwing errors everywhere.
    // 3) Trying to go to the slide it's already on with a transition and no
    // dragging has occured or the carousel is not offset.
    return !(
      (!this._isEnabled) ||
      (!this.options.isLooped && this.isIndexOutOfRange(domIndex)) ||
      (isSameSlideWithAnimation && !isOffset));
  }

  _toNewSlide() {
    // Set flag meaning the carousel is waiting for a transition end.
    this.isTransitioning = true;

    // Fire event saying the slide started to transition.
    this._emitEvent(new CarouselEvent(
      Carousel.EventType.SLIDE_START,
      this,
      this._getLogicalIndex(this.lastDomIndex),
      this._getLogicalIndex(this.domIndex),
    ));
  }

  /**
   * Uses Css transforms to move the carousel to a new position.
   * @param {string} position The percentage value.
   * @param {boolean} noAnimation Whether to move with animation or not.
   * @private
   */
  _moveToPosition(position, noAnimation) {
    // Set transform.
    this._carouselEl.style[OdoDevice.Dom.TRANSFORM] = this._getCssPosition(position);

    // Set transition speed to zero so that it happens instantly.
    if (noAnimation) {
      this._carouselEl.style[OdoDevice.Dom.TRANSITION_DURATION] = '0ms';

      // Listen for transitionend if it will animate.
    } else {
      // Set transition speed.
      this._carouselEl.style[OdoDevice.Dom.TRANSITION_DURATION] =
        this.options.animationSpeed + 'ms';

      // This is used as a backup to the transitionend event, which sometimes
      // doesn't fire on iOS 7 Safari when the carousel has only been dragged a
      // few pixels. It's set to go off ~2 frames after the transition end event
      // should have occurred.
      this._transitionId = onTransitionEnd(
        this._carouselEl,
        this._transitionDone,
        this,
        OdoDevice.Dom.TRANSFORM,
        this.options.animationSpeed + Carousel.TRANSITION_END_WAIT,
      );

      this._toNewSlide();
    }
  }

  /**
   * Calculates the offset of the carousel relative to the current slide.
   * @return {number}
   */
  _getCarouselOffset() {
    const matrix = getComputedStyle(this._carouselEl)[OdoDevice.Dom.TRANSFORM];

    // Round to 1 decimal place because the `_startEdge` can be a decimal.
    const translate = Math.round(getTranslate(matrix)[this._translateAxis.toLowerCase()] * 10) / 10;

    const slideOffset = this.getSlide(this.getSelectedIndex())[this._offsetPosition];
    return slideOffset + translate;
  }

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
  _cancelMovement() {
    if (!this.isTransitioning) {
      return;
    }

    this.isTransitioning = false;
    cancelTransitionEnd(this._transitionId);

    // Fading carousels do not need to reposition themselves.
    if (this.options.isFade) {
      return;
    }

    // Save the offset relative to the current slide before slides are moved.
    const carouselSize = getSize(this.getCarouselElement())[this._dimensionAttr];
    const offset = this._getCarouselOffset();

    if (this._isJumped) {
      this._setSlidesToLogicalOrder();
    }

    if (this._isSlidingLooped) {
      this._setNeighborSlides();
    }

    // Now that the current slide has potentially moved in the DOM, update the
    // carousel's offset.
    const currentSlideEl = this.getSlide(this.getSelectedIndex());
    const newSlideOffset = currentSlideEl[this._offsetPosition];
    const position = (newSlideOffset - offset) / carouselSize;

    // Setting the position here stops the browser from transitioning to the
    // previous position, allowing the user to "catch" the carousel mid-nav.
    this._moveToPosition((position * -100) + '%', true);
    this.draggable.update();
  }

  /**
   * Goes to a given slide.
   * @param {!number} domIndex The slide index relative to DOM order.
   * @param {boolean} [noAnimation] Whether going to the slide should animate.
   * @protected
   */
  fadeToSlide(domIndex, noAnimation) {
    // Get next and previous slides.
    const nextSlide = this.getSlide(domIndex);
    const previousSlide = this.getSlide(this.domIndex);

    // Listen for transitionend if it will animate.
    if (!noAnimation) {
      // Going to a new slide, wait for callback.
      this._transitionId = onTransitionEnd(nextSlide, this._transitionDone, this);
    }

    // Show next slide. Put the previous behind the next.
    nextSlide.classList.add(Carousel.Classes.VISIBLE);

    if (previousSlide !== nextSlide) {
      previousSlide.classList.add(Carousel.Classes.BEHIND);

      // Delay the previous slide fading out by the specified percentage.
      // The crossfade amount is between 0 and 1. A value of 1 means that both slides
      // will fade at the same time. A crossfade of zero means the previous slide
      // will wait until the next slide has completely faded in before it fades out.
      setTimeout(() => {
        previousSlide.classList.remove(Carousel.Classes.VISIBLE);
      }, this._crossfadeTimeout);
    }

    // Save the last slide index.
    this.lastDomIndex = this.domIndex;
    this.domIndex = domIndex;

    // Emit event for slide start.
    if (!noAnimation) {
      this._toNewSlide();
    }
  }

  /**
   * Goes to a given slide.
   * @param {!number} domIndex The slide index relative to DOM order.
   * @param {boolean} [noAnimation] Whether going to the slide should animate.
   * @protected
   */
  goToSlide(domIndex, noAnimation) {
    // Get the destion slide element from the current DOM order.
    const destinationSlide = this.getSlide(this._getLogicalIndex(domIndex));

    // If the carousel skips inbetween slides, reposition them.
    // DOM index is reassinged here because if the slides are repositioned,
    // the DOM index of the carousel changes.
    const updatedDomIndex = this._maybeSetJumpedSlides(domIndex, noAnimation);

    // The position the container will go to.
    const adjustedPosition = (this._getNewPosition(destinationSlide) * -100) + '%';

    // Save the last slide index.
    this.lastDomIndex = this.domIndex;
    this.domIndex = updatedDomIndex;

    // Set the css styles to move the carousel element. This also dispatches
    // the slide start event if the carousel element will move with animation.
    this._moveToPosition(adjustedPosition, noAnimation);
  }

  /**
   * Helper function for going to a given index. This method should be used
   * instead of the private one to abstract the DOM order stuff.
   * @param {number} index The logical, zero based index of the slide you wish
   *     the carousel to go to.
   * @param {boolean} [noAnimation] Optional skip the animation in goToSlide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */
  setSelectedIndex(index, noAnimation) {
    let domIndex = this._getDomIndex(index);
    const canNavigate = this._canNavigate(domIndex, noAnimation);

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
        this.fadeToSlide(domIndex, noAnimation);
      } else {
        this.goToSlide(domIndex, noAnimation);
      }
    }

    // Otherwise, it will not go to the give slide due to unmet conditions.
    return canNavigate;
  }

  /**
   * Find the nearest slide, and move the carousel to that.
   * @param {boolean} [isNext] Whether it should go to the nearest slide, but
   *     only in the next direction. False means it should go previous and
   *     anything not true or false will go to the nearest slide regardless
   *     of direction.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */
  goToNearestSlide(isNext) {
    // Gets positions relative to the wrapper element of each slide.
    const positions = this._getPositions(this.getSlides());

    // Current position (the left side of the carousel wrapper)
    // Gets the closest value in the array to the given value.
    // Index of the closest value.
    let logicalIndex = positions.indexOf(closest(positions, this._startEdge));

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
  }

  /**
   * Go to the next slide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */
  goToNextSlide() {
    return this.setSelectedIndex(this.getSelectedIndex() + 1);
  }

  /**
   * Go to the previous slide.
   * @return {boolean} Whether the carousel will go to the specified slide.
   */
  goToPreviousSlide() {
    return this.setSelectedIndex(this.getSelectedIndex() - 1);
  }

  /**
   * Sets the past, previous, active, next, and future classes to the appropriate
   * slides.
   * @private
   */
  _setSlidesState() {
    const selectedIndex = this.getSelectedIndex();
    const past = this._getSafeIndex(selectedIndex - 2);
    const previous = this._getSafeIndex(selectedIndex - 1);
    const next = this._getSafeIndex(selectedIndex + 1);
    const future = this._getSafeIndex(selectedIndex + 2);

    // This works because the _slides array does not mimic the DOM order.
    this.getSlides().forEach((slide, i) => {
      const isActive = i === selectedIndex;

      toggleFocusability(slide, isActive);

      slide.setAttribute('aria-hidden', !isActive);

      // Active slide.
      slide.classList.toggle(Carousel.Classes.ACTIVE_SLIDE, isActive);

      // Previous previous slide.
      slide.classList.toggle(
        Carousel.Classes.PAST_SLIDE,
        i === past && selectedIndex !== past && previous !== past,
      );

      // Previous slide.
      slide.classList.toggle(
        Carousel.Classes.PREVIOUS_SLIDE,
        i === previous && selectedIndex !== previous,
      );

      // Next slide.
      slide.classList.toggle(
        Carousel.Classes.NEXT_SLIDE,
        i === next && selectedIndex !== next,
      );

      // Next next slide.
      slide.classList.toggle(
        Carousel.Classes.FUTURE_SLIDE,
        i === future && selectedIndex !== future && next !== future,
      );
    });
  }

  _setPaginationState() {
    if (this.options.pagination) {
      const selectedIndex = this.getSelectedIndex();
      this._paginationDots.forEach(({ dot, i, i2 }) => {
        const selected = selectedIndex === i || selectedIndex === i2;
        dot.classList.toggle(Carousel.Classes.PAGINATION_DOT_SELECTED, selected);
        dot.setAttribute('aria-selected', selected);
      });
    }
  }

  _setPaddleState() {
    const notLooped = !this.options.isLooped;
    if (notLooped && this._paddlePrevious) {
      const first = this.isFirstSlide();
      this._paddlePrevious.classList.toggle(Carousel.Classes.PADDLE_DISABLED, first);
      this._paddlePrevious.setAttribute('aria-disabled', first);
    }

    if (notLooped && this._paddleNext) {
      const last = this.isLastSlide();
      this._paddleNext.classList.toggle(Carousel.Classes.PADDLE_DISABLED, last);
      this._paddleNext.setAttribute('aria-disabled', last);
    }
  }

  /**
   * Callback for when the slideshow timer expires.
   * @private
   */
  _slideshowTimerExpired() {
    // Pause the timer if it's at the end.
    if (!this.options.isLooped && this.isLastSlide()) {
      this.pauseSlideshow();
    } else {
      this.goToNextSlide();
    }
  }

  _transitionDone() {
    const from = this._getLogicalIndex(this.lastDomIndex);
    const to = this._getLogicalIndex(this.domIndex);

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
  }

  /**
   * Received the pointer end event.
   * @param {PointerEvent} pointerEvent Pointer event object.
   */
  _handlePointerEnd(pointerEvent) {
    if (this.pointer.hasVelocity(pointerEvent.velocity)) {
      if (pointerEvent.direction === OdoPointer.Direction.RIGHT) {
        this.goToPreviousSlide();
      } else if (pointerEvent.direction === OdoPointer.Direction.LEFT) {
        this.goToNextSlide();
      }
    }
  }

  /**
   * The click listener is bound to the main element. Inside the handler, the target
   * of the click is tested and if it is a pagination dot or paddle, navigation
   * will be started.
   * @param {Event} evt Event object.
   * @private
   */
  _handleClick(evt) {
    const { target } = evt;
    let willNavigate = false;

    // Determine what was clicked.
    const dot = target.closest('.' + Carousel.Classes.PAGINATION_DOT);
    const prev = target.closest('.' + Carousel.Classes.PADDLE_PREV);
    const next = target.closest('.' + Carousel.Classes.PADDLE_NEXT);

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
  }

  /**
   * Stop animations that were ongoing when you started to drag.
   * @private
   */
  _handleDragStart() {
    this.pauseSlideshow();
    this._cancelMovement();

    // Remove transition while dragging.
    this._carouselEl.style[OdoDevice.Dom.TRANSITION_DURATION] = '0ms';
  }

  /**
   * Pointer move event. Set a friction value if on the first/last slide and
   * going towards the edge.
   * @param {PointerEvent} evt Pointer event emitted by draggable.
   * @private
   */
  _handleDragMove({ delta }) {
    this.hasDragged = this.isVertical ?
      Math.abs(delta.y) > 0 :
      Math.abs(delta.x) > 0;
    if (!this.options.isLooped) {
      const friction = this._isMovingTowardsEdge(delta.x, delta.y) ? 0.4 : 1;
      this.draggable.friction = friction;
    }
  }

  /**
   * Depending on how fast you were dragging, either proceed to an adjacent
   * slide or reset position to the nearest one.
   * @param {PointerEvent} evt Pointer event emitted by draggable.
   * @private
   */
  _handleDragEnd(evt) {
    this.draggable.friction = 1;
    this.navigateAfterDrag(evt.velocity, evt.axisDirection, evt.didMoveOnAxis);
    this.hasDragged = false;
    this._isOffset = false;
  }

  _shouldGoToPrevious(hasVelocity, direction) {
    return hasVelocity && (this.options.isLooped || !this.isFirstSlide()) && (
      direction === OdoPointer.Direction.RIGHT ||
      direction === OdoPointer.Direction.DOWN);
  }

  _shouldGoToNext(hasVelocity, direction) {
    return hasVelocity && (this.options.isLooped || !this.isLastSlide()) && (
      direction === OdoPointer.Direction.LEFT ||
      direction === OdoPointer.Direction.UP);
  }

  /**
   * Decide what to do after the user drags the carousel.
   * @param {Coordinate} velocity Velocity for x and y directions.
   * @param {OdoPointer.Direction} direction Drag direction.
   * @param {boolean} didMoveOnAxis Whether the drag direction was on the defined axis.
   * @protected
   */
  navigateAfterDrag(velocity, direction, didMoveOnAxis) {
    const hasVelocity = this.hasDragged && this.draggable.pointer.hasVelocity(velocity);

    // If dragging has not occurred, the user simply clicked on the carousel.
    // If the user is quickly navigating through the carousel, then clicks on
    // it, the movement will be canceled, but it wouldn't go anywhere because it
    // appears to be going to the same slide. Determine if the carousel is still
    // between slides (offset). If it is, it needs to go to the nearest slide.
    if (!this.hasDragged) {
      this._isOffset =
        Math.abs(Math.round(this._getCarouselOffset())) > Math.round(this._startEdge);
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
  }

  /**
   * Emits a event on this instance.
   * @param {CarouselEvent} event Event object with data.
   * @return {boolean} Whether preventDefault was called on the event.
   */
  _emitEvent(event) {
    this.emit(event.type, event);
    return event.defaultPrevented;
  }

  /**
   * Whether the carousel is being dragged towards an edge.
   * @param {number} deltaX Change in x during drag.
   * @param {number} deltaY Change in y during drag.
   * @return {boolean}
   * @private
   */
  _isMovingTowardsEdge(deltaX, deltaY) {
    const toStartEdge = this.isVertical ?
      deltaY > 0 :
      deltaX > 0;
    const toEndEdge = this.isVertical ?
      deltaY < 0 :
      deltaX < 0;

    return (this.isFirstSlide() && toStartEdge) || (this.isLastSlide() && toEndEdge);
  }

  /**
   * Remove event listeners, DOM references, inline styles, class names, paddles,
   * and pagination added by Carousel.
   */
  dispose() {
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

      this.getSlides().forEach((slide) => {
        slide.style[OdoDevice.Dom.TRANSITION] = '';
      });
    } else {
      this.draggable.off(OdoDraggable.EventType.START, this._onDragStart);
      this.draggable.off(OdoDraggable.EventType.MOVE, this._onDragMove);
      this.draggable.off(OdoDraggable.EventType.END, this._onDragEnd);

      this.draggable.dispose();
    }

    this.element.removeEventListener('click', this._onClick);

    this._slides.forEach((slide) => {
      slide.classList.remove(
        Carousel.Classes.PAST_SLIDE,
        Carousel.Classes.PREVIOUS_SLIDE,
        Carousel.Classes.ACTIVE_SLIDE,
        Carousel.Classes.NEXT_SLIDE,
        Carousel.Classes.FUTURE_SLIDE,
        Carousel.Classes.VISIBLE,
        Carousel.Classes.BEHIND,
      );
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
  }

  /**
   * Because Object.assign only does a shallow merge, merge the template option
   * first and then overwrite the main Object.assign result.
   * @param {Object} options Options object.
   * @return {Object} Merged options object with defaults.
   */
  static getOptions(options) {
    const templates = Object.assign({}, Carousel.Defaults.template, options.template);
    const opts = Object.assign({}, Carousel.Defaults, options);
    opts.template = templates;
    return opts;
  }
}

Object.assign(Carousel, settings);

Carousel.template = templateEngine;
Carousel.CarouselEvent = CarouselEvent;

// Export for testing.
Carousel._getTranslate = getTranslate;

export default Carousel;
