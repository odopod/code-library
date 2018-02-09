/**
 * @fileoverview An abstraction for pointer, mouse, and touch events.
 *
 * @author Glen Cheney
 */

import TinyEmitter from 'tiny-emitter';
import OdoDevice from '@odopod/odo-device';
import {
  clamp,
  Coordinate,
  events,
  noop,
} from '@odopod/odo-helpers';
import settings from './settings';
import PointerEvent from './pointer-event';

class Pointer extends TinyEmitter {
  /**
   * An abstraction layer for adding pointer events and calculating drag values.
   * @param {Element} element Element to watch.
   * @param {Object} options Options object.
   */
  constructor(element, options = {}) {
    super();

    if (!element || element.nodeType !== 1) {
      throw new TypeError('OdoPointer requires an element.');
    }

    const opts = Object.assign({}, Pointer.Defaults, options);

    /**
     * Whether to prevent the default event action on move.
     * @type {boolean}
     * @private
     */
    this._shouldPreventDefault = opts.preventEventDefault;

    /**
     * The draggable element.
     * @type {Element}
     * @private
     */
    this._el = element;

    /**
     * Starting location of the drag.
     * @type {Coordinate}
     */
    this.pageStart = new Coordinate();

    /**
     * Current position of mouse or touch relative to the document.
     * @type {Coordinate}
     */
    this.page = new Coordinate();

    /**
     * Current position of drag relative to target's parent.
     * @type {Coordinate}
     */
    this.delta = new Coordinate();

    /**
     * Used to track the current velocity. It is updated when the velocity is.
     * @type {Coordinate}
     * @private
     */
    this._lastPosition = new Coordinate();

    /**
     * Friction to apply to dragging. A value of zero would result in no dragging,
     * 0.5 would result in the draggable element moving half as far as the user
     * dragged, and 1 is a 1:1 ratio with user movement.
     * @type {number}
     */
    this._friction = 1;

    /**
     * Draggable axis.
     * @type {string}
     * @private
     */
    this.axis = opts.axis;

    /**
     * Flag indicating dragging has happened. It is set on dragmove and reset
     * after the draggableend event has been dispatched.
     * @type {boolean}
     */
    this.hasDragged = false;

    /**
     * Whether the user is locked in place within the draggable element. This
     * is set to true when `preventDefault` is called on the move event.
     * @type {boolean}
     * @private
     */
    this._isLocked = false;

    /**
     * Whether dragging is enabled internally. If the user attempts to scroll
     * in the opposite direction of the draggable element, this is set to true
     * and no more drag move events are counted until the user releases and
     * starts dragging again.
     * @type {boolean}
     * @private
     */
    this._isDeactivated = false;

    /**
     * Whether dragging is currently enabled.
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * Id from setInterval to update the velocity.
     * @type {number}
     * @private
     */
    this._velocityTrackerId = null;

    /**
     * Time in milliseconds when the drag started.
     * @type {number}
     */
    this.startTime = 0;

    /**
     * Length of the drag in milliseconds.
     * @type {number}
     */
    this.deltaTime = 0;

    /**
     * Used to keep track of the current velocity, it's updated with every velocity update.
     * @type {number}
     * @private
     */
    this._lastTime = 0;

    /**
     * The current velocity of the drag.
     * @type {Coordinate}
     */
    this.velocity = new Coordinate();

    /**
     * Whether the velocity has been tracked at least once during the drag.
     * @type {boolean}
     */
    this._hasTrackedVelocity = false;

    /**
     * The element to which the move and up events will be bound to. If a pointer
     * is being used inside a modal which stops events from bubbling to the body,
     * this property should be changed to an element which *will* receive the events.
     * @type {Document|Element}
     */
    this.dragEventTarget = document;

    const touchAction = Pointer.TouchActionSupport[this.axis];

    /**
     * Whether the browser supports the `touch-action` property associated with
     * the axis.
     * @type {boolean}
     */
    this._isTouchActionSupported = !!touchAction;

    // If the browser supports the touch action property, add it.
    if (this._shouldPreventDefault && this._isTouchActionSupported) {
      this.element.style[touchAction] = Pointer.TouchAction[this.axis];
    } else if (this._shouldPreventDefault && OdoDevice.HAS_TOUCH_EVENTS) {
      window.addEventListener(events.TOUCHMOVE, noop);
    }

    this.listen();
  }

  listen() {
    this._onStart = this._handleDragStart.bind(this);

    if (OdoDevice.HAS_POINTER_EVENTS) {
      this._el.addEventListener(events.POINTERDOWN, this._onStart);
    } else {
      this._el.addEventListener(events.MOUSEDOWN, this._onStart);

      if (OdoDevice.HAS_TOUCH_EVENTS) {
        this._el.addEventListener(events.TOUCHSTART, this._onStart);
      }
    }

    // Prevent images, links, etc from being dragged around.
    // http://www.html5rocks.com/en/tutorials/dnd/basics/
    this._el.addEventListener(events.DRAGSTART, Pointer._preventDefault);
  }

  /**
   * Returns the draggable element.
   * @return {Element}
   */
  get element() {
    return this._el;
  }

  /**
   * Get whether dragger is enabled.
   * @return {boolean} Whether dragger is enabled.
   */
  get isEnabled() {
    return this._enabled;
  }

  /**
   * Set whether dragger is enabled.
   * @param {boolean} enabled Whether dragger is enabled.
   */
  set isEnabled(enabled) {
    this._enabled = enabled;
  }

  /**
   * @return {boolean} Whether the draggable axis is the x direction.
   */
  isXAxis() {
    return this.axis === Pointer.Axis.X;
  }

  /**
   * @return {boolean} Whether the draggable axis is the y direction.
   */
  isYAxis() {
    return this.axis === Pointer.Axis.Y;
  }

  /**
   * @return {boolean} Whether the draggable axis is for both axis.
   */
  isBothAxis() {
    return this.axis === Pointer.Axis.BOTH;
  }

  /**
   * Retrieve the friction value.
   * @return {number}
   */
  get friction() {
    return this._friction;
  }

  /**
   * Set the friction value.
   * @param {number} friction A number between [1, 0].
   */
  set friction(friction) {
    this._friction = friction;
  }

  /**
   * Apply a friction value to a coordinate, reducing its value.
   * This modifies the coordinate given to it.
   * @param {Coordinate} coordinate The coordinate to scale.
   * @return {Coordinate} Position multiplied by friction.
   */
  applyFriction(coordinate) {
    return coordinate.scale(this.friction);
  }

  /**
   * If draggable is enabled and it's a left click with the mouse,
   * dragging can start.
   * @param {Event} evt Event object.
   * @return {boolean}
   * @private
   */
  _canStartDrag(evt) {
    return this.isEnabled && (Pointer.isTouchEvent(evt) || evt.button === 0);
  }

  /**
   * Whether drag move should happen or exit early.
   * @return {boolean}
   * @private
   */
  _canContinueDrag() {
    return this.isEnabled && !this._isDeactivated;
  }

  /**
   * Drag start handler.
   * @param  {Event} evt The drag event object.
   * @private
   */
  _handleDragStart(evt) {
    // Clear any active tracking interval.
    clearInterval(this._velocityTrackerId);

    // Must be left click to drag.
    if (!this._canStartDrag(evt)) {
      return;
    }

    this._setDragStartValues(Pointer._getPageCoordinate(evt));

    // Give a hook to others
    const isPrevented = this._emitEvent(this._createEvent(Pointer.EventType.START, evt));

    if (!isPrevented) {
      this._addDragHandlers(evt.type);

      // Every interval, calculate the current velocity of the drag.
      this._velocityTrackerId = setInterval(
        this._trackVelocity.bind(this),
        Pointer.VELOCITY_INTERVAL,
      );
    }
  }

  /**
   * Drag move, after applyDraggableElementPosition has happened
   * @param {Event} evt The dragger event.
   * @private
   */
  _handleDragMove(evt) {
    if (!this._canContinueDrag()) {
      return;
    }

    this._setDragMoveValues(Pointer._getPageCoordinate(evt));

    const isPrevented = this._emitEvent(this._createEvent(Pointer.EventType.MOVE, evt));

    // Abort if the developer prevented default on the custom event or if the
    // browser supports touch-action (which will do the "locking" for us).
    if (!isPrevented && this._shouldPreventDefault && !this._isTouchActionSupported) {
      this._finishDragMove(evt);
    }
  }

  /**
   * Finish the drag move function.
   * @param {Event} evt Event object.
   * @private
   */
  _finishDragMove(evt) {
    // Possibly lock the user to only dragging.
    this._maybeLock();

    // Possibly stop draggable from affecting the element.
    this._maybeDeactivate();

    // Locked into dragging.
    if (this._isLocked) {
      evt.preventDefault();
    }

    // Disregard drags and velocity.
    if (this._isDeactivated) {
      clearInterval(this._velocityTrackerId);
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }

  /**
   * Dragging ended.
   * @private
   */
  _handleDragEnd(evt) {
    clearInterval(this._velocityTrackerId);
    this.deltaTime = Date.now() - this.startTime;

    // If this was a quick drag, the velocity might not have been tracked once.
    if (!this._hasTrackedVelocity) {
      this._trackVelocity();
    }

    // Prevent mouse events from occurring after touchend.
    this._removeDragHandlers();

    const endEvent = this._createEvent(Pointer.EventType.END, evt);
    endEvent.isCancelEvent = Pointer._isCancelEvent(evt);

    // Emit an event.
    const isPrevented = this._emitEvent(endEvent);

    if (isPrevented) {
      evt.preventDefault();
    }

    this.hasDragged = false;
    this._isDeactivated = false;
    this._isLocked = false;
  }

  /**
   * Set the starting values for dragging.
   * @param {Coordinate} pagePosition The page position coordinate.
   * @private
   */
  _setDragStartValues(pagePosition) {
    this.pageStart = pagePosition;
    this.page = pagePosition;
    this._lastPosition = pagePosition;
    this.delta = new Coordinate();
    this.velocity = new Coordinate();
    this._hasTrackedVelocity = false;

    this.startTime = Date.now();
    this._lastTime = Date.now();
    this.deltaTime = 0;
  }

  /**
   * Set the values for dragging during a drag move.
   * @param {Coordinate} pagePosition The page position coordinate.
   * @private
   */
  _setDragMoveValues(pagePosition) {
    // Get the distance since the last move.
    const lastDelta = Coordinate.difference(pagePosition, this.page);

    // Apply friction to the distance since last move.
    this.applyFriction(lastDelta);

    // Update the total delta value.
    this.delta.translate(lastDelta);

    this.page = pagePosition;
    this.deltaTime = Date.now() - this.startTime;
    this.hasDragged = true;
  }

  /**
   * Once the user has moved past the lock threshold, keep it locked.
   * @private
   */
  _maybeLock() {
    if (!this._isLocked) {
      // Prevent scrolling if the user has moved past the locking threshold.
      this._isLocked = this._shouldLock(this.delta);
    }
  }

  /**
   * Once the user has moved past the drag threshold, keep it deactivated.
   * @private
   */
  _maybeDeactivate() {
    if (!this._isDeactivated) {
      // Disable dragging if the user is attempting to go the opposite direction
      // of the draggable element.
      this._isDeactivated = this._shouldDeactivate(this.delta);
    }
  }

  /**
   * @param {Coordinate} delta Amount the pointer has moved since it started.
   * @return {boolean} Whether Draggable should lock the user into draggable only.
   * @private
   */
  _shouldLock(delta) {
    const pastX = this.isXAxis() && Math.abs(delta.x) > Pointer.LOCK_THRESHOLD;
    const pastY = this.isYAxis() && Math.abs(delta.y) > Pointer.LOCK_THRESHOLD;
    return this.isBothAxis() || pastX || pastY;
  }

  /**
   * @param {Coordinate} delta Amount the pointer has moved since it started.
   * @return {boolean} Whether Draggable should stop affecting the draggable element.
   * @private
   */
  _shouldDeactivate(delta) {
    const pastX = this.isXAxis() && Math.abs(delta.y) > Pointer.DRAG_THRESHOLD;
    const pastY = this.isYAxis() && Math.abs(delta.x) > Pointer.DRAG_THRESHOLD;
    return !this._isLocked && (this.isBothAxis() || pastX || pastY);
  }

  /**
   * Make a new event with data.
   * @param {Pointer.EventType} type Event type.
   * @param {Event} evt Native event object.
   * @return {!PointerEvent}
   * @private
   */
  _createEvent(type, evt) {
    return new Pointer.Event({
      type,
      pointerId: this.id,
      currentTarget: this.element,
      target: evt.target,
      axis: this.axis,
      deltaTime: this.deltaTime,
      delta: this.delta,
      start: this.pageStart,
      end: this.page,
      currentVelocity: this.velocity,
    });
  }

  /**
   * Binds events to the document for move, end, and cancel (if cancel events
   * exist for the device).
   * @param {string} startType The type of event which started the drag. It
   *     is important that the mouse events are not bound when a touch event
   *     is triggered otherwise the events could be doubled.
   * @private
   */
  _addDragHandlers(startType) {
    const target = this.dragEventTarget;
    this._onMove = this._handleDragMove.bind(this);
    this._onEnd = this._handleDragEnd.bind(this);

    switch (startType) {
      case events.POINTERDOWN:
        target.addEventListener(events.POINTERMOVE, this._onMove);
        target.addEventListener(events.POINTERUP, this._onEnd);
        target.addEventListener(events.POINTERCANCEL, this._onEnd);
        break;
      case events.MOUSEDOWN:
        target.addEventListener(events.MOUSEMOVE, this._onMove);
        target.addEventListener(events.MOUSEUP, this._onEnd);
        break;
      case events.TOUCHSTART:
        target.addEventListener(events.TOUCHMOVE, this._onMove);
        target.addEventListener(events.TOUCHEND, this._onEnd);
        target.addEventListener(events.TOUCHCANCEL, this._onEnd);
        break;
      // no default
    }
  }

  /**
   * Removes the events bound during drag start. The draggable namespace can be
   * used to remove all of them because the drag start event is still bound
   * to the actual element.
   */
  _removeDragHandlers() {
    const target = this.dragEventTarget;
    target.removeEventListener(events.POINTERMOVE, this._onMove);
    target.removeEventListener(events.POINTERUP, this._onEnd);
    target.removeEventListener(events.POINTERCANCEL, this._onEnd);
    target.removeEventListener(events.MOUSEMOVE, this._onMove);
    target.removeEventListener(events.MOUSEUP, this._onEnd);
    target.removeEventListener(events.TOUCHMOVE, this._onMove);
    target.removeEventListener(events.TOUCHEND, this._onEnd);
    target.removeEventListener(events.TOUCHCANCEL, this._onEnd);
  }

  /**
   * Every 100 milliseconds, calculate the current velocity with a moving average.
   * http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
   * @private
   */
  _trackVelocity() {
    const now = Date.now();
    const elapsed = now - this._lastTime;
    const delta = Coordinate.difference(this.page, this._lastPosition);
    this.applyFriction(delta);
    this._lastTime = now;
    this._lastPosition = this.page;

    // velocity = delta / time.
    // Clamp the velocity to avoid outliers.
    const maxVelocity = Pointer.MAX_VELOCITY;
    this.velocity.x = clamp(delta.x / elapsed, -maxVelocity, maxVelocity);
    this.velocity.y = clamp(delta.y / elapsed, -maxVelocity, maxVelocity);

    this._hasTrackedVelocity = true;
  }

  /**
   * Determine whether the draggable event has enough velocity to be
   * considered a swipe.
   * @param {Object} velocity Object with x and y properties for velocity.
   * @param {number} [threshold] Threshold to check against. Defaults to the swipe
   *     velocity constant. Must be zero or a positive number.
   * @return {boolean}
   */
  hasVelocity(velocity, threshold = Pointer.SWIPE_VELOCITY) {
    if (this.isYAxis()) {
      return Math.abs(velocity.y) > threshold;
    }

    if (this.isXAxis()) {
      return Math.abs(velocity.x) > threshold;
    }

    // Otherwise check both axis for velocity.
    return Math.abs(velocity.x) > threshold || Math.abs(velocity.y) > threshold;
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

  /**
   * Remove event listeners and element references.
   */
  dispose() {
    clearInterval(this._velocityTrackerId);
    this._removeDragHandlers();

    // Remove pointer/mouse/touch events.
    this._el.removeEventListener(events.POINTERDOWN, this._onStart);
    this._el.removeEventListener(events.MOUSEDOWN, this._onStart);
    this._el.removeEventListener(events.TOUCHSTART, this._onStart);

    if (this._isTouchActionSupported) {
      this._el.style[Pointer.TouchActionSupport[this.axis]] = '';
    } else if (this._shouldPreventDefault && OdoDevice.HAS_TOUCH_EVENTS) {
      window.removeEventListener(events.TOUCHMOVE, noop);
    }

    this._el = null;
    this.dragEventTarget = null;
  }

  /**
   * Whether the event is from a touch.
   * @param {Event} evt Event object.
   * @return {boolean}
   */
  static isTouchEvent(evt) {
    return !!evt.changedTouches;
  }

  /**
   * Whether the event is from a pointer cancel or touch cancel.
   * @param {Event} evt Event object.
   * @return {boolean}
   * @private
   */
  static _isCancelEvent(evt) {
    return evt.type === events.POINTERCANCEL || evt.type === events.TOUCHCANCEL;
  }

  /**
   * Retrieve the page x and page y based on an event. It normalizes
   * touch events, mouse events, and pointer events.
   * @param {Event} evt Event object.
   * @return {!Coordinate} The pageX and pageY of the press.
   * @private
   */
  static _getPageCoordinate(evt) {
    let pagePoints;

    // Use the first touch for the pageX and pageY.
    if (Pointer.isTouchEvent(evt)) {
      pagePoints = evt.changedTouches[0]; // eslint-disable-line prefer-destructuring
    } else {
      pagePoints = evt;
    }

    return new Coordinate(pagePoints.pageX, pagePoints.pageY);
  }

  static _preventDefault(evt) {
    evt.preventDefault();
  }
}

Object.assign(Pointer, settings);

/** @type {PointerEvent} */
Pointer.Event = PointerEvent;

export default Pointer;
