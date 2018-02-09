import TinyEmitter from 'tiny-emitter';
import { clamp, Rect, Stepper } from '@odopod/odo-helpers';
import OdoDraggable from '@odopod/odo-draggable';
import OdoWindowEvents from '@odopod/odo-window-events';
import OdoObjectFit from '@odopod/odo-object-fit';
import settings from './settings';

class DualViewer extends TinyEmitter {
  /**
   * Component which has a draggable element in the middle which reveals one or
   * the other sides as the user drags.
   *
   * @constructor
   */
  constructor(el, opts) {
    super();

    this.element = el;

    this.options = Object.assign({}, DualViewer.Defaults, opts);

    this._isVertical = this.options.isVertical;

    /** @private {Element} */
    this._scrubberEl = null;

    /** @private {Element} */
    this._overlayEl = null;

    /** @private {Element} */
    this._underlayEl = null;

    /** @private {Element} */
    this._overlayObjectEl = null;

    /**
     * Dragger component
     * @type {OdoDraggable}
     * @private
     */
    this._draggable = null;

    /**
     * Boundary for the scrubber.
     * @type {Rect}
     * @private
     */
    this._scrubberLimits = null;

    /**
     * The axis to drag depends on the carousel direction.
     * @type {OdoPointer.Axis}
     * @private
     */
    this._dragAxis = this._isVertical ? 'y' : 'x';

    /**
     * Height or width.
     * @type {string}
     * @private
     */
    this._dimensionAttr = this._isVertical ? 'height' : 'width';

    /**
     * Previous percentage revealed. Needed for window resizes to reset back to
     * correct position.
     * @type {number}
     * @private
     */
    this._previousPercent = this.options.startPosition;

    /**
     * Current position of the dual viewer.
     * @type {number}
     * @private
     */
    this._position = DualViewer.Position.CENTER;

    /** @private {boolean} */
    this._isResting = true;

    this.decorate();
  }

  /**
   * Scope the query to the main element.
   * @param {string} className Class name of the desired element.
   * @return {?Element} The element or null if not found.
   */
  getElementByClass(className) {
    return this.element.querySelector('.' + className);
  }

  /**
   * Scope the query to the main element.
   * @param {string} className Class name of the desired elements.
   * @return {NodeList} An array like object of elements.
   */
  getElementsByClass(className) {
    return this.element.querySelectorAll('.' + className);
  }

  decorate() {
    this._scrubberEl = this.getElementByClass(DualViewer.ClassName.SCRUBBER);
    this._overlayEl = this.getElementByClass(DualViewer.ClassName.OVERLAY);
    this._underlayEl = this.getElementByClass(DualViewer.ClassName.UNDERLAY);

    this._overlayObjectEl = this._overlayEl.firstElementChild;

    this._draggable = new OdoDraggable(this._scrubberEl, {
      axis: this._dragAxis,
    });

    // Add vertical class if it's vertical and the is-centered class.
    this.element.classList.toggle(DualViewer.ClassName.VERTICAL, this._isVertical);
    this.element.classList.add(DualViewer.ClassName.CENTERED);

    this._setupHandlers();

    this._saveContainerSize();
    this._saveScrubberLimits();

    OdoObjectFit.cover(this.getElementsByClass(DualViewer.ClassName.MEDIA));

    this._draggable.setLimits(this._scrubberLimits);

    this.setPosition(this.options.startPosition);
  }

  _setupHandlers() {
    this._resizeId = OdoWindowEvents.onResize(this.reset.bind(this));
    this._onMove = this._handleDragMove.bind(this);
    this._onEnd = this._handleDragEnd.bind(this);

    this._draggable.on(OdoDraggable.EventType.MOVE, this._onMove);
    this._draggable.on(OdoDraggable.EventType.END, this._onEnd);
  }

  /**
   * Sets the containing box for the scrubber to stay within.
   * @private
   */
  _saveScrubberLimits() {
    let limits;

    if (this._isVertical) {
      const top = this._containerHeight * this.options.verticalSafeZone;
      const height = this._containerHeight * (1 - (this.options.verticalSafeZone * 2));
      limits = new Rect(0, top, this._containerWidth, height);
    } else {
      const containingEl = this.getElementByClass(DualViewer.ClassName.SCRUBBER_CONTAINER);
      const mainRect = this.element.getBoundingClientRect();
      const containingRect = containingEl.getBoundingClientRect();

      limits = new Rect(
        Math.round(containingRect.left - mainRect.left),
        containingEl.offsetTop,
        containingEl.offsetWidth,
        this._containerHeight,
      );
    }

    this._scrubberLimits = limits;
  }

  /**
   * Returns the dual viewer's current position.
   * @return {number} Position number. Look at the DualViewer.
   *   Position enum for reference.
   */
  getPosition() {
    return this._position;
  }

  /**
   * Set the position of the scrubber and the amount revealed.
   * @param {number} position Percentage to be revealed. A number between zero and one.
   */
  setPosition(position) {
    // Draggable clamps this based on the axis.
    this._draggable.setPosition(position * 100, position * 100);
    this._reveal(position);
  }

  /**
   * Clamps a percentage value to the boundaries of the scrubber.
   * @param  {number} percent Number between zero and one.
   * @return {number} Clamped percentage between the left and right boundaries if
   *     the dual viewer is horizontal, or the top and bottom boundaries if the
   *     dual viewer is vertical.
   * @private
   */
  _getLimitedPercent(percent) {
    const rect = this._scrubberLimits;
    let min;
    let max;

    if (this._isVertical) {
      min = rect.top / this._containerHeight;
      max = (rect.top + rect.height) / this._containerHeight;
    } else {
      min = rect.left / this._containerWidth;
      max = (rect.left + rect.width) / this._containerWidth;
    }

    return clamp(percent, min, max);
  }

  /**
   * Caches the main element's dimensions.
   * @private
   */
  _saveContainerSize() {
    this._containerWidth = this.element.offsetWidth;
    this._containerHeight = this.element.offsetHeight;
  }

  /**
   * Toggle state classes.
   * @private
   */
  _removeStateClasses() {
    this.element.classList.remove(
      DualViewer.ClassName.START,
      DualViewer.ClassName.END,
      DualViewer.ClassName.CENTERED,
    );

    this._isResting = false;
  }

  /**
   * Reveals or covers up the second object.
   * @param {number} percent Number between zero and one.
   * @private
   */
  _reveal(percent) {
    this._overlayEl.style[this._dimensionAttr] = percent * 100 + '%';
    this._overlayObjectEl.style[this._dimensionAttr] = 100 / percent + '%';
  }

  /**
   * Resets the scrubber position, scrubber limits, draggable position, and amount
   * revealed based new width/height measurements and the previous position of the
   * scrubber.
   */
  reset() {
    this._saveContainerSize();
    this._saveScrubberLimits();

    OdoObjectFit.cover(this.getElementsByClass(DualViewer.ClassName.MEDIA));

    this._draggable.setLimits(this._scrubberLimits);

    const percent = this._previousPercent * 100;
    this._draggable.setPosition(percent, percent);

    this._reveal(this._getLimitedPercent(this._previousPercent));
  }

  /**
   * Dragged.
   * @param {Event} evt Custom event object.
   * @private
   */
  _handleDragMove(evt) {
    if (this._isResting) {
      this._removeStateClasses();
      this._position = DualViewer.Position.BETWEEN;
    }

    const percentRevealed = evt.position.percent[this._dragAxis] / 100;

    // Save value because if the window is resized, the scrubber will be way off.
    this._previousPercent = percentRevealed;

    this._reveal(percentRevealed);
  }

  /**
   * Dragging ended.
   *
   * Default zones shown below.
   * L = lower zone.
   * M = middle zone.
   * U = upper zone.
   *
   * +-------------------------------------+
   * |          |   |       |   |          |
   * |          |   |       |   |          |
   * |    L     |   |   M   |   |     U    |
   * |          |   |       |   |          |
   * |          |   |       |   |          |
   * +-------------------------------------+
   *         |          |         |
   *        0.25       0.5       0.75
   *
   * @param {Event} evt Custom event object.
   * @private
   */
  _handleDragEnd(evt) {
    if (!this.options.hasZones) {
      return;
    }

    // Percentage revealed.
    const revealed = evt.position.percent[this._dragAxis] / 100;
    this._position = this._getZone(revealed);

    let percent = null;
    switch (this._position) {
      case DualViewer.Position.START:
        percent = 0;
        break;
      case DualViewer.Position.CENTER:
        percent = 0.5;
        break;
      case DualViewer.Position.END:
        percent = 1;
        break;
      // no default
    }

    if (percent !== null) {
      this.animateTo(percent);
    }
  }

  _getZone(revealed) {
    if (revealed > 0 && revealed < this.options.zones[0]) {
      return DualViewer.Position.START;
    }

    if (revealed < 1 && revealed > this.options.zones[3]) {
      return DualViewer.Position.END;
    }

    if (revealed >= this.options.zones[1] && revealed <= this.options.zones[2]) {
      return DualViewer.Position.CENTER;
    }

    return DualViewer.Position.BETWEEN;
  }

  /**
   * Animate the dual viewer to a percentage.
   * @param {number} toPercent Percent to animate to. It will get clamped to the
   *     scrubber's limits. This is a number between zero and one.
   */
  animateTo(toPercent) {
    // Clamp to boundaries.
    const percent = this._getLimitedPercent(toPercent);

    // Don't animate if the handle isn't going anywhere.
    if (percent === this._previousPercent) {
      return;
    }

    this._position = this._getZone(percent);

    this._removeStateClasses();

    const stepper = new Stepper({
      start: this._previousPercent,
      end: percent,
      duration: this.options.animationDuration,
      step: this._animateStep,
      context: this,
    });

    stepper.onfinish = this._didComeToRest;
  }

  /**
   * The tick function. Sets the handle and revealer.
   * @param {number} position Applied percentage added to the starting point.
   * @private
   */
  _animateStep(position) {
    // Move handle.
    this._draggable.setPosition(position * 100, position * 100);

    // Move reveals.
    this._reveal(position);
  }

  /**
   * Dual Viewer animation came to rest. Toggle classes and states.
   * @private
   */
  _didComeToRest() {
    this._previousPercent = this._draggable.getPosition(true)[this._dragAxis] / 100;
    this._isResting = true;

    this.element.classList.toggle(
      DualViewer.ClassName.START,
      this._position === DualViewer.Position.START,
    );
    this.element.classList.toggle(
      DualViewer.ClassName.END,
      this._position === DualViewer.Position.END,
    );
    this.element.classList.toggle(
      DualViewer.ClassName.CENTERED,
      this._position === DualViewer.Position.CENTER,
    );

    // Emit event.
    this.emit(DualViewer.EventType.CAME_TO_REST, {
      position: this.getPosition(),
    });
  }

  /**
   * Reset the style attribute for the properties we might have manipulated.
   */
  dispose() {
    OdoWindowEvents.remove(this._resizeId);

    this._draggable.off(OdoDraggable.EventType.MOVE, this._onMove);
    this._draggable.off(OdoDraggable.EventType.END, this._onEnd);

    this._draggable.dispose();

    this.element.classList.remove(
      DualViewer.ClassName.CENTERED,
      DualViewer.ClassName.VERTICAL,
    );

    this.element = null;
    this._scrubberEl = null;
    this._overlayObjectEl = null;
    this._overlayEl = null;
    this._underlayEl = null;
  }
}

Object.assign(DualViewer, settings);

export default DualViewer;
