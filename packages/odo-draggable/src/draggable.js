import TinyEmitter from 'tiny-emitter';
import OdoDevice from '@odopod/odo-device';
import OdoPointer from '@odopod/odo-pointer';
import { Coordinate, utilities, math, style } from '@odopod/odo-helpers';
import settings from './settings';

/**
 * Throws an error if `condition` is falsy.
 * @param {boolean} condition The condition to test.
 * @param {string} message Error message.
 * @throws {Error} If condition is falsy.
 * @private
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Ensure the containing element has a width and height.
 * @param {Object} obj Object to test.
 */
function ensureObjectHasSize(obj) {
  assert(obj.width > 0, 'containing element\'s width is zero');
  assert(obj.height > 0, 'containing element\'s height is zero');
}

class Draggable extends TinyEmitter {
  constructor(element, options = {}) {
    super();

    /**
     * The draggable element.
     * @type {Element}
     * @private
     */
    this.element = element;

    /**
     * Override any defaults with the given options.
     * @type {Object}
     */
    this.options = Object.assign({}, Draggable.Defaults, options);

    /**
     * The element which contains the target.
     * @type {Element}
     * @private
     */
    this._parentEl = element.parentNode;

    /**
     * Current position of the handle/target.
     * @type {Coordinate}
     * @private
     */
    this._currentPosition = new Coordinate();

    /**
     * Starting location of the drag.
     * @type {Coordinate}
     * @private
     */
    this._relativeZero = new Coordinate();

    /**
     * Velocity at which the draggable was thrown. This value decays over time
     * after a throw.
     * @private
     * @type {Coordinate}
     */
    this._throwVelocity = new Coordinate();

    /**
     * The change in position from the start of the drag.
     * @private
     * @type {Coordinate}
     */
    this._delta = new Coordinate();

    /**
     * Animation frame id.
     * @private
     * @type {number}
     */
    this._requestId = 0;

    /**
     * The size of the containing element. This element is used to determine
     * the percentage position of the draggable element.
     * @type {Object}
     */
    this._container = { width: 0, height: 0 };

    /**
     * Limits of how far the draggable element can be dragged.
     * @type {math.Rect}
     */
    this.limits = new math.Rect(NaN, NaN, NaN, NaN);

    this.pointer = new OdoPointer(element, {
      axis: this.options.axis,
    });

    this.element.classList.add(Draggable.Classes.GRABBABLE);

    // Kick off.
    this._listen();
  }

  _listen() {
    this._onStart = this._handleDragStart.bind(this);
    this._onMove = this._handleDragMove.bind(this);
    this._onEnd = this._handleDragEnd.bind(this);

    this.pointer.on(OdoPointer.EventType.START, this._onStart);
    this.pointer.on(OdoPointer.EventType.MOVE, this._onMove);
    this.pointer.on(OdoPointer.EventType.END, this._onEnd);
  }

  /**
   * Saves the containment element's width and height and scrubber position.
   * @private
   */
  _saveDimensions() {
    this._container = style.getSize(this.element);
    ensureObjectHasSize(this._container);
    this._relativeZero = this._getRelativeZero();
  }

  /**
   * The position relative to the rest of the page. When it's first
   * initialized, it is zero zero, but after dragging, it is the position
   * relative to zero zero.
   * @return {!Coordinate}
   * @private
   */
  _getRelativeZero() {
    return Coordinate.difference(
      this._getDraggablePosition(),
      this._getOffsetCorrection(),
    );
  }

  _getDraggablePosition() {
    const elRect = this.element.getBoundingClientRect();
    return new Coordinate(elRect.left, elRect.top);
  }

  /**
   * Because the draggable element gets moved around and repositioned,
   * the bounding client rect method and the offset left and top properties
   * are unreliable once the element has been dragged once. This method uses
   * the bounding client rect of the parent element to get a "correction"
   * value.
   * @return {!Coordinate}
   * @private
   */
  _getOffsetCorrection() {
    // getBoundingClientRect does not include margins. They must be accounted for.
    const containmentRect = this._parentEl.getBoundingClientRect();
    const paddings = style.getPaddingBox(this._parentEl);
    const margins = style.getMarginBox(this.element);
    const offsetCorrectionX = margins.left + paddings.left + containmentRect.left;
    const offsetCorrectionY = margins.top + paddings.top + containmentRect.top;
    return new Coordinate(offsetCorrectionX, offsetCorrectionY);
  }

  /**
   * Sets the current position coordinate to a new coordinate.
   * @param {Coordinate} position Where the x and y values are a percentage.
   *     e.g. 50 for "50%".
   */
  _setCurrentPosition(position) {
    this.pointer.applyFriction(position);
    const x = this._limitX((position.x / 100) * this._parentEl.offsetWidth);
    const y = this._limitY((position.y / 100) * this._parentEl.offsetHeight);
    this._currentPosition = this._getAxisCoordinate(Math.round(x), Math.round(y));
  }

  /**
   * Clamp the x or y value.
   * @param {number} value X or Y value.
   * @param {number} rectPosition The limits starting edge. (left or top).
   * @param {number} rectSize The limits dimension. (width or height).
   * @return {number} The clamped number.
   */
  static _limitValue(value, rectPosition, rectSize) {
    const side = utilities.defaultsTo(rectPosition, null, !Number.isNaN(rectPosition));
    const dimension = utilities.defaultsTo(rectSize, 0, !Number.isNaN(rectSize));
    const max = utilities.defaultsTo(side + dimension, Infinity, side !== null);
    const min = utilities.defaultsTo(side, -Infinity, side !== null);
    return math.clamp(value, min, max);
  }

  /**
   * Returns the 'real' x after limits are applied (allows for some
   * limits to be undefined).
   * @param {number} x X-coordinate to limit.
   * @return {number} The 'real' X-coordinate after limits are applied.
   */
  _limitX(x) {
    return Draggable._limitValue(x, this.limits.left, this.limits.width);
  }

  /**
   * Returns the 'real' y after limits are applied (allows for some
   * limits to be undefined).
   * @param {number} y Y-coordinate to limit.
   * @return {number} The 'real' Y-coordinate after limits are applied.
   */
  _limitY(y) {
    return Draggable._limitValue(y, this.limits.top, this.limits.height);
  }

  /**
   * Returns the x and y positions the draggable element should be set to.
   * @param {Coordinate=} optPosition Position to set the draggable
   *     element. This will optionally override calculating the position
   *     from a drag.
   * @return {!Coordinate} The x and y coordinates.
   * @private
   */
  _getElementPosition(optPosition) {
    if (optPosition) {
      this._setCurrentPosition(optPosition);
    }

    const newX = (this._currentPosition.x / this._container.width) * 100;
    const newY = (this._currentPosition.y / this._container.height) * 100;

    return this._getAxisCoordinate(newX, newY);
  }

  /**
   * Ensures the y value of an x axis draggable is zero and visa versa.
   * @param {number} newX New position for the x value.
   * @param {number} newY New position for the y value.
   * @return {!Coordinate}
   * @private
   */
  _getAxisCoordinate(newX, newY) {
    // Drag horizontal only.
    if (this.pointer.isXAxis()) {
      return new Coordinate(newX, 0);
    }

    // Drag vertical only.
    if (this.pointer.isYAxis()) {
      return new Coordinate(0, newY);
    }

    // Drag both directions.
    return new Coordinate(newX, newY);
  }

  /**
   * Returns a new coordinate with limits applied to it.
   * @param {Coordinate} deltaFromStart The distance moved since the drag started.
   * @return {!Coordinate}
   * @private
   */
  _getNewLimitedPosition(deltaFromStart) {
    const sum = Coordinate.sum(this._relativeZero, deltaFromStart);
    return new Coordinate(this._limitX(sum.x), this._limitY(sum.y));
  }

  /**
   * Drag start handler.
   * @private
   */
  _handleDragStart(evt) {
    this._stopThrow();
    this._saveDimensions();
    this._currentPosition = this._relativeZero;
    this._emitEvent(this._createEvent(Draggable.EventType.START, evt));
    this.element.classList.add(Draggable.Classes.GRABBING);
  }

  /**
   * Drag move, after _applyPosition has happened
   * @param {PointerEvent} evt The dragger event.
   * @private
   */
  _handleDragMove(evt) {
    // Calculate the new position based on limits and the starting point.
    this._currentPosition = this._getNewLimitedPosition(this.pointer.delta);

    this._emitEvent(this._createEvent(Draggable.EventType.MOVE, evt));

    if (!this.pointer._isDeactivated) {
      this._applyPosition();
    }
  }

  /**
   * Dragging ended.
   * @private
   */
  _handleDragEnd(evt) {
    this._emitEvent(this._createEvent(Draggable.EventType.END, evt));
    this.element.classList.remove(Draggable.Classes.GRABBING);

    if (this.options.isThrowable && this.pointer.hasVelocity(evt.currentVelocity, 0)) {
      this._throw(evt.currentVelocity, evt.delta);
    }
  }

  /**
   * Start a throw based on the draggable's velocity.
   * @param {Coordinate} velocity Velocity.
   * @param {Coordinate} delta Total drag distance from start to end.
   * @private
   */
  _throw(velocity, delta) {
    this._delta = delta;
    this._throwVelocity = Coordinate.scale(velocity, this.options.amplifier);
    this._animateThrow();
  }

  /**
   * Scale down the velocity, update the position, and apply it. Then do it again
   * until it's below a threshold.
   * @private
   */
  _animateThrow() {
    if (this.pointer.hasVelocity(this._throwVelocity, this.options.velocityStop)) {
      this._currentPosition = this._getNewLimitedPosition(this._delta);
      this._applyPosition();

      this._delta.translate(this._throwVelocity);
      this._throwVelocity.scale(this.options.throwFriction);

      // Again!
      this._requestId = requestAnimationFrame(this._animateThrow.bind(this));
    } else {
      // Settle on the pixel grid.
      this._currentPosition.x = Math.round(this._currentPosition.x);
      this._currentPosition.y = Math.round(this._currentPosition.y);
      this._applyPosition();
      this._emitSettled();
    }
  }

  /**
   * Interrupt a throw.
   * @private
   */
  _stopThrow() {
    this._delta = new Coordinate();
    this._throwVelocity = new Coordinate();
    cancelAnimationFrame(this._requestId);
  }

  /**
   * Dispatches the SETTLE event with data. This data is different from the start,
   * move, and end events which use data from the pointer.
   * @private
   */
  _emitSettled() {
    this._emitEvent(new OdoPointer.Event({
      type: Draggable.EventType.SETTLE,
      target: this.element,
      axis: this.pointer.axis,
      deltaTime: Date.now() - this.pointer.startTime,
      delta: Coordinate.difference(this._relativeZero, this._currentPosition),
      start: this._relativeZero,
      end: this._currentPosition,
      currentVelocity: this._throwVelocity,
      position: {
        pixel: this.getPosition(),
        percent: this.getPosition(true),
      },
    }));
  }

  /**
   * Make a new event with data.
   * @param {Draggable.EventType} type Event type.
   * @param {Event} evt Native event object.
   * @return {!OdoPointer.Event}
   * @private
   */
  _createEvent(type, evt) {
    return new OdoPointer.Event({
      type,
      target: evt.target,
      currentTarget: this.element,
      axis: this.pointer.axis,
      deltaTime: this.pointer.deltaTime,
      delta: Coordinate.difference(this._currentPosition, this._relativeZero),
      start: this._relativeZero,
      end: this._currentPosition,
      currentVelocity: this.pointer.velocity,
      position: {
        pixel: this.getPosition(),
        percent: this.getPosition(true),
      },
    });
  }

  /**
   * Sets the position of thd draggable element.
   * @param {Coordinate} [position] Position to set the draggable element. This
   *     will optionally override calculating the position from a drag.
   * @return {Coordinate} The position the draggable element was set to.
   */
  _applyPosition(position) {
    const pos = this._getElementPosition(position);
    this.element.style[OdoDevice.Dom.TRANSFORM] = `translate(${pos.x}%,${pos.y}%)`;
    return this._currentPosition;
  }

  /**
   * Returns the current position of the draggable element.
   * @param {boolean} optAsPercent Optionally retrieve percentage values instead
   *     of pixel values.
   * @return {Coordinate} X and Y coordinates of the draggable element.
   */
  getPosition(optAsPercent) {
    if (optAsPercent) {
      return new Coordinate(
        (this._currentPosition.x / this._parentEl.offsetWidth) * 100,
        (this._currentPosition.y / this._parentEl.offsetHeight) * 100,
      );
    }
    return this._currentPosition;
  }

  /**
   * Set the position of the draggable element.
   * @param {number} x X position as a percentage. Eg. 50 for "50%".
   * @param {number} y Y position as a percentage. Eg. 50 for "50%".
   * @return {Coordinate} The position the draggable element was set to.
   */
  setPosition(x, y) {
    // setPosition can be called before any dragging, this would cause
    // the containment width and containment height to be undefined.
    this.update();
    return this._applyPosition(new Coordinate(x, y));
  }

  /**
   * Sets (or reset) the Drag limits after a Dragger is created.
   * @param {math.Rect} limits Object containing left, top, width,
   *     height for new Dragger limits.
   */
  setLimits(limits) {
    this.limits = limits;
  }

  get friction() {
    return this.pointer.friction;
  }

  /**
   * Set the friction value.
   * @param {number} friction A number between [1, 0].
   */
  set friction(friction) {
    this.pointer.friction = friction;
  }

  /**
   * Get whether dragger is enabled.
   * @return {boolean} Whether dragger is enabled.
   */
  get isEnabled() {
    return this.pointer.isEnabled;
  }

  /**
   * Set whether dragger is enabled.
   * @param {boolean} enabled Whether dragger is enabled.
   */
  set isEnabled(enabled) {
    this.pointer.isEnabled = enabled;
  }

  /**
   * Easy way to trigger setting dimensions. Useful for doing things after this
   * class has been initialized, but no dragging has occurred yet.
   */
  update() {
    this._saveDimensions();
  }

  /**
   * Remove event listeners and element references.
   * @private
   */
  dispose() {
    this.pointer.off(OdoPointer.EventType.START, this._onStart);
    this.pointer.off(OdoPointer.EventType.MOVE, this._onMove);
    this.pointer.off(OdoPointer.EventType.END, this._onEnd);

    this.pointer.dispose();

    this.element.classList.remove(Draggable.Classes.GRABBABLE);

    this._parentEl = null;
    this.element = null;
  }

  /**
   * Emits a event on this instance.
   * @param {PointerEvent} event Event object with data.
   * @return {boolean} Whether preventDefault was called on the event.
   */
  _emitEvent(event) {
    this.emit(event.type, event);
    return event.defaultPrevented;
  }
}

Object.assign(Draggable, settings);

export default Draggable;
