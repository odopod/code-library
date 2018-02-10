(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-device'), require('@odopod/odo-helpers'), require('tiny-emitter')) :
	typeof define === 'function' && define.amd ? define(['@odopod/odo-device', '@odopod/odo-helpers', 'tiny-emitter'], factory) :
	(global.OdoPointer = factory(global.OdoDevice,global.OdoHelpers,global.TinyEmitter));
}(this, (function (OdoDevice,odoHelpers,TinyEmitter) { 'use strict';

OdoDevice = OdoDevice && OdoDevice.hasOwnProperty('default') ? OdoDevice['default'] : OdoDevice;
TinyEmitter = TinyEmitter && TinyEmitter.hasOwnProperty('default') ? TinyEmitter['default'] : TinyEmitter;

var settings = {
  /** @enum {string} */
  EventType: {
    START: 'odopointer:start',
    MOVE: 'odopointer:move',
    END: 'odopointer:end'
  },

  /** @enum {string} */
  Direction: {
    RIGHT: 'right',
    LEFT: 'left',
    UP: 'up',
    DOWN: 'down',
    NONE: 'no_movement'
  },

  /** @enum {string|boolean} */
  TouchActionSupport: {
    x: OdoDevice.prefixed('touchAction', 'pan-y'),
    y: OdoDevice.prefixed('touchAction', 'pan-x'),
    xy: OdoDevice.prefixed('touchAction', 'none')
  },

  /** @enum {string} */
  TouchAction: {
    x: 'pan-y',
    y: 'pan-x',
    xy: 'none'
  },

  /** @enum {string} */
  Axis: {
    X: 'x',
    Y: 'y',
    BOTH: 'xy'
  },

  Defaults: {
    axis: 'xy',
    preventEventDefault: true
  },

  /**
   * The current velocity property will be clamped to this value (pixels/millisecond).
   * @const {number}
   */
  MAX_VELOCITY: 12,

  /**
   * When the pointer is down, an interval starts to track the current velocity.
   * @const {number}
   */
  VELOCITY_INTERVAL: 100,

  /**
   * Velocity required for a movement to be considered a swipe.
   * @const {number}
   */
  SWIPE_VELOCITY: 0.6,

  /**
   * The scroll/drag amount (pixels) required on the draggable axis before
   * stopping further page scrolling/movement.
   * @const {number}
   */
  LOCK_THRESHOLD: 6,

  /**
   * The scroll/drag amount (pixels) required on the opposite draggable axis
   * before dragging is deactivated for the rest of the interaction.
   * @const {number}
   */
  DRAG_THRESHOLD: 5
};

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

function isXAxis(axis) {
  return axis === settings.Axis.X;
}

function isYAxis(axis) {
  return axis === settings.Axis.Y;
}

function isBothAxis(axis) {
  return axis === settings.Axis.BOTH;
}

function hasDirection(direction) {
  return direction !== settings.Direction.NONE;
}

function finiteOrZero(velocity) {
  return Number.isFinite(velocity) ? velocity : 0;
}

/**
 * Calculate the velocity between two points.
 *
 * @param {number} deltaTime Change in time.
 * @param {number} deltaX Change in x.
 * @param {number} deltaY Change in y.
 * @return {Coordinate} Velocity of the drag.
 */

function getVelocity(deltaTime, deltaX, deltaY) {
  return new odoHelpers.Coordinate(finiteOrZero(deltaX / deltaTime), finiteOrZero(deltaY / deltaTime));
}

function getTheDirection(value1, value2, isGreater, isLess, isEqual) {
  if (value1 - value2 > 0) {
    return isGreater;
  } else if (value1 - value2 < 0) {
    return isLess;
  }

  return isEqual;
}

/**
 * angle to direction define.
 * @param {Coordinate} coord1 The starting coordinate.
 * @param {Coordinate} coord2 The ending coordinate.
 * @return {string} Direction constant.
 */
function getDirection(coord1, coord2) {
  if (Math.abs(coord1.x - coord2.x) >= Math.abs(coord1.y - coord2.y)) {
    return getTheDirection(coord1.x, coord2.x, settings.Direction.LEFT, settings.Direction.RIGHT, settings.Direction.NONE);
  }

  return getTheDirection(coord1.y, coord2.y, settings.Direction.UP, settings.Direction.DOWN, settings.Direction.NONE);
}

function isOnAxis(axis, direction) {
  var isXAndLeftOrRight = isXAxis(axis) && (direction === settings.Direction.LEFT || direction === settings.Direction.RIGHT);

  var isYAndUpOrDown = isYAxis(axis) && (direction === settings.Direction.UP || direction === settings.Direction.DOWN);

  var isBothAndNotNone = isBothAxis(axis) && hasDirection(direction);

  return isXAndLeftOrRight || isYAndUpOrDown || isBothAndNotNone;
}

function didMoveOnAxis(axis, direction, deltaX, deltaY) {
  // X axis and deltaX > 0
  return isXAxis(axis) && Math.abs(deltaX) > 0 ||

  // Y axis and deltaY > 0
  isYAxis(axis) && Math.abs(deltaY) > 0 ||

  // Both axis, as long as it actually moved.
  isBothAxis(axis) && hasDirection(direction);
}

function getAxisDirection(axis, start, end) {
  var _start = Object.assign({}, start);
  var _end = Object.assign({}, end);

  if (isXAxis(axis)) {
    _start.y = 0;
    _end.y = 0;
  } else if (isYAxis(axis)) {
    _start.x = 0;
    _end.x = 0;
  }

  return getDirection(_start, _end);
}

var PointerEvent = function () {
  /**
   * Object representing a drag event.
   * @param {Object} options Options object.
   * @param {string} options.type Event type.
   * @param {Element} options.target Element the event is happening on.
   * @param {Coordinate} options.delta Total movement of the pointer (with friction
   *     already applied to it).
   * @param {Coordinate} options.currentVelocity Calculated velocity since the last interval.
   * @constructor
   */
  function PointerEvent(options) {
    classCallCheck(this, PointerEvent);

    this.type = options.type;

    /**
     * @type {Element}
     */
    this.target = options.target;

    /**
     * @type {Element}
     */
    this.currentTarget = options.currentTarget;

    /**
     * Starting location of the pointer.
     * @type {Coordinate}
     */
    this.start = options.start;

    /**
     * Ending location of the pointer.
     * @type {Coordinate}
     */
    this.end = options.end;

    /**
     * Change in position since the start of the drag.
     * @type {Coordinate}
     */
    this.delta = options.delta;

    /**
     * Time elapsed from mouse/touch down to mouse/touch up.
     * @type {number}
     */
    this.deltaTime = options.deltaTime;

    /**
     * Velocity of the whole drag.
     * @type {Coordinate}
     */
    this.velocity = getVelocity(this.deltaTime, this.delta.x, this.delta.y);

    /**
     * The velocity in the last 100 milliseconds.
     * @type {Coordinate}
     */
    this.currentVelocity = options.currentVelocity;

    /**
     * Distance dragged.
     * @type {number}
     */
    this.distance = odoHelpers.Coordinate.distance(options.start, options.end);

    /**
     * Direction of drag.
     * @type {settings.Direction}
     */
    this.direction = getDirection(options.start, options.end);

    /**
     * Whether the drag direction is on the axis of the draggable element.
     * @type {boolean}
     */
    this.isDirectionOnAxis = isOnAxis(options.axis, this.direction);

    /**
     * Whether the draggable element moved along the dragging axis at all.
     * @type {boolean}
     */
    this.didMoveOnAxis = didMoveOnAxis(options.axis, this.direction, this.delta.x, this.delta.y);

    /**
     * Direction of drag which excludes directions not on its axis.
     * @type {settings.Direction}
     */
    this.axisDirection = getAxisDirection(options.axis, options.start, options.end);

    /** @type {{pixel: Coordinate, percent: Coordinate}} */
    this.position = options.position;

    /** @type {boolean} Whether `preventDefault` has been called. */
    this.defaultPrevented = false;
  }

  PointerEvent.prototype.preventDefault = function preventDefault() {
    this.defaultPrevented = true;
  };

  return PointerEvent;
}();

/**
 * @fileoverview An abstraction for pointer, mouse, and touch events.
 *
 * @author Glen Cheney
 */

var Pointer = function (_TinyEmitter) {
  inherits(Pointer, _TinyEmitter);

  /**
   * An abstraction layer for adding pointer events and calculating drag values.
   * @param {Element} element Element to watch.
   * @param {Object} options Options object.
   */
  function Pointer(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Pointer);

    var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

    if (!element || element.nodeType !== 1) {
      throw new TypeError('OdoPointer requires an element.');
    }

    var opts = Object.assign({}, Pointer.Defaults, options);

    /**
     * Whether to prevent the default event action on move.
     * @type {boolean}
     * @private
     */
    _this._shouldPreventDefault = opts.preventEventDefault;

    /**
     * The draggable element.
     * @type {Element}
     * @private
     */
    _this._el = element;

    /**
     * Starting location of the drag.
     * @type {Coordinate}
     */
    _this.pageStart = new odoHelpers.Coordinate();

    /**
     * Current position of mouse or touch relative to the document.
     * @type {Coordinate}
     */
    _this.page = new odoHelpers.Coordinate();

    /**
     * Current position of drag relative to target's parent.
     * @type {Coordinate}
     */
    _this.delta = new odoHelpers.Coordinate();

    /**
     * Used to track the current velocity. It is updated when the velocity is.
     * @type {Coordinate}
     * @private
     */
    _this._lastPosition = new odoHelpers.Coordinate();

    /**
     * Friction to apply to dragging. A value of zero would result in no dragging,
     * 0.5 would result in the draggable element moving half as far as the user
     * dragged, and 1 is a 1:1 ratio with user movement.
     * @type {number}
     */
    _this._friction = 1;

    /**
     * Draggable axis.
     * @type {string}
     * @private
     */
    _this.axis = opts.axis;

    /**
     * Flag indicating dragging has happened. It is set on dragmove and reset
     * after the draggableend event has been dispatched.
     * @type {boolean}
     */
    _this.hasDragged = false;

    /**
     * Whether the user is locked in place within the draggable element. This
     * is set to true when `preventDefault` is called on the move event.
     * @type {boolean}
     * @private
     */
    _this._isLocked = false;

    /**
     * Whether dragging is enabled internally. If the user attempts to scroll
     * in the opposite direction of the draggable element, this is set to true
     * and no more drag move events are counted until the user releases and
     * starts dragging again.
     * @type {boolean}
     * @private
     */
    _this._isDeactivated = false;

    /**
     * Whether dragging is currently enabled.
     * @type {boolean}
     * @private
     */
    _this._enabled = true;

    /**
     * Id from setInterval to update the velocity.
     * @type {number}
     * @private
     */
    _this._velocityTrackerId = null;

    /**
     * Time in milliseconds when the drag started.
     * @type {number}
     */
    _this.startTime = 0;

    /**
     * Length of the drag in milliseconds.
     * @type {number}
     */
    _this.deltaTime = 0;

    /**
     * Used to keep track of the current velocity, it's updated with every velocity update.
     * @type {number}
     * @private
     */
    _this._lastTime = 0;

    /**
     * The current velocity of the drag.
     * @type {Coordinate}
     */
    _this.velocity = new odoHelpers.Coordinate();

    /**
     * Whether the velocity has been tracked at least once during the drag.
     * @type {boolean}
     */
    _this._hasTrackedVelocity = false;

    /**
     * The element to which the move and up events will be bound to. If a pointer
     * is being used inside a modal which stops events from bubbling to the body,
     * this property should be changed to an element which *will* receive the events.
     * @type {Document|Element}
     */
    _this.dragEventTarget = document;

    var touchAction = Pointer.TouchActionSupport[_this.axis];

    /**
     * Whether the browser supports the `touch-action` property associated with
     * the axis.
     * @type {boolean}
     */
    _this._isTouchActionSupported = !!touchAction;

    // If the browser supports the touch action property, add it.
    if (_this._shouldPreventDefault && _this._isTouchActionSupported) {
      _this.element.style[touchAction] = Pointer.TouchAction[_this.axis];
    } else if (_this._shouldPreventDefault && OdoDevice.HAS_TOUCH_EVENTS) {
      window.addEventListener(odoHelpers.events.TOUCHMOVE, odoHelpers.noop);
    }

    _this.listen();
    return _this;
  }

  Pointer.prototype.listen = function listen() {
    this._onStart = this._handleDragStart.bind(this);

    if (OdoDevice.HAS_POINTER_EVENTS) {
      this._el.addEventListener(odoHelpers.events.POINTERDOWN, this._onStart);
    } else {
      this._el.addEventListener(odoHelpers.events.MOUSEDOWN, this._onStart);

      if (OdoDevice.HAS_TOUCH_EVENTS) {
        this._el.addEventListener(odoHelpers.events.TOUCHSTART, this._onStart);
      }
    }

    // Prevent images, links, etc from being dragged around.
    // http://www.html5rocks.com/en/tutorials/dnd/basics/
    this._el.addEventListener(odoHelpers.events.DRAGSTART, Pointer._preventDefault);
  };

  /**
   * Returns the draggable element.
   * @return {Element}
   */


  /**
   * @return {boolean} Whether the draggable axis is the x direction.
   */
  Pointer.prototype.isXAxis = function isXAxis() {
    return this.axis === Pointer.Axis.X;
  };

  /**
   * @return {boolean} Whether the draggable axis is the y direction.
   */


  Pointer.prototype.isYAxis = function isYAxis() {
    return this.axis === Pointer.Axis.Y;
  };

  /**
   * @return {boolean} Whether the draggable axis is for both axis.
   */


  Pointer.prototype.isBothAxis = function isBothAxis() {
    return this.axis === Pointer.Axis.BOTH;
  };

  /**
   * Retrieve the friction value.
   * @return {number}
   */


  /**
   * Apply a friction value to a coordinate, reducing its value.
   * This modifies the coordinate given to it.
   * @param {Coordinate} coordinate The coordinate to scale.
   * @return {Coordinate} Position multiplied by friction.
   */
  Pointer.prototype.applyFriction = function applyFriction(coordinate) {
    return coordinate.scale(this.friction);
  };

  /**
   * If draggable is enabled and it's a left click with the mouse,
   * dragging can start.
   * @param {Event} evt Event object.
   * @return {boolean}
   * @private
   */


  Pointer.prototype._canStartDrag = function _canStartDrag(evt) {
    return this.isEnabled && (Pointer.isTouchEvent(evt) || evt.button === 0);
  };

  /**
   * Whether drag move should happen or exit early.
   * @return {boolean}
   * @private
   */


  Pointer.prototype._canContinueDrag = function _canContinueDrag() {
    return this.isEnabled && !this._isDeactivated;
  };

  /**
   * Drag start handler.
   * @param  {Event} evt The drag event object.
   * @private
   */


  Pointer.prototype._handleDragStart = function _handleDragStart(evt) {
    // Clear any active tracking interval.
    clearInterval(this._velocityTrackerId);

    // Must be left click to drag.
    if (!this._canStartDrag(evt)) {
      return;
    }

    this._setDragStartValues(Pointer._getPageCoordinate(evt));

    // Give a hook to others
    var isPrevented = this._emitEvent(this._createEvent(Pointer.EventType.START, evt));

    if (!isPrevented) {
      this._addDragHandlers(evt.type);

      // Every interval, calculate the current velocity of the drag.
      this._velocityTrackerId = setInterval(this._trackVelocity.bind(this), Pointer.VELOCITY_INTERVAL);
    }
  };

  /**
   * Drag move, after applyDraggableElementPosition has happened
   * @param {Event} evt The dragger event.
   * @private
   */


  Pointer.prototype._handleDragMove = function _handleDragMove(evt) {
    if (!this._canContinueDrag()) {
      return;
    }

    this._setDragMoveValues(Pointer._getPageCoordinate(evt));

    var isPrevented = this._emitEvent(this._createEvent(Pointer.EventType.MOVE, evt));

    // Abort if the developer prevented default on the custom event or if the
    // browser supports touch-action (which will do the "locking" for us).
    if (!isPrevented && this._shouldPreventDefault && !this._isTouchActionSupported) {
      this._finishDragMove(evt);
    }
  };

  /**
   * Finish the drag move function.
   * @param {Event} evt Event object.
   * @private
   */


  Pointer.prototype._finishDragMove = function _finishDragMove(evt) {
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
  };

  /**
   * Dragging ended.
   * @private
   */


  Pointer.prototype._handleDragEnd = function _handleDragEnd(evt) {
    clearInterval(this._velocityTrackerId);
    this.deltaTime = Date.now() - this.startTime;

    // If this was a quick drag, the velocity might not have been tracked once.
    if (!this._hasTrackedVelocity) {
      this._trackVelocity();
    }

    // Prevent mouse events from occurring after touchend.
    this._removeDragHandlers();

    var endEvent = this._createEvent(Pointer.EventType.END, evt);
    endEvent.isCancelEvent = Pointer._isCancelEvent(evt);

    // Emit an event.
    var isPrevented = this._emitEvent(endEvent);

    if (isPrevented) {
      evt.preventDefault();
    }

    this.hasDragged = false;
    this._isDeactivated = false;
    this._isLocked = false;
  };

  /**
   * Set the starting values for dragging.
   * @param {Coordinate} pagePosition The page position coordinate.
   * @private
   */


  Pointer.prototype._setDragStartValues = function _setDragStartValues(pagePosition) {
    this.pageStart = pagePosition;
    this.page = pagePosition;
    this._lastPosition = pagePosition;
    this.delta = new odoHelpers.Coordinate();
    this.velocity = new odoHelpers.Coordinate();
    this._hasTrackedVelocity = false;

    this.startTime = Date.now();
    this._lastTime = Date.now();
    this.deltaTime = 0;
  };

  /**
   * Set the values for dragging during a drag move.
   * @param {Coordinate} pagePosition The page position coordinate.
   * @private
   */


  Pointer.prototype._setDragMoveValues = function _setDragMoveValues(pagePosition) {
    // Get the distance since the last move.
    var lastDelta = odoHelpers.Coordinate.difference(pagePosition, this.page);

    // Apply friction to the distance since last move.
    this.applyFriction(lastDelta);

    // Update the total delta value.
    this.delta.translate(lastDelta);

    this.page = pagePosition;
    this.deltaTime = Date.now() - this.startTime;
    this.hasDragged = true;
  };

  /**
   * Once the user has moved past the lock threshold, keep it locked.
   * @private
   */


  Pointer.prototype._maybeLock = function _maybeLock() {
    if (!this._isLocked) {
      // Prevent scrolling if the user has moved past the locking threshold.
      this._isLocked = this._shouldLock(this.delta);
    }
  };

  /**
   * Once the user has moved past the drag threshold, keep it deactivated.
   * @private
   */


  Pointer.prototype._maybeDeactivate = function _maybeDeactivate() {
    if (!this._isDeactivated) {
      // Disable dragging if the user is attempting to go the opposite direction
      // of the draggable element.
      this._isDeactivated = this._shouldDeactivate(this.delta);
    }
  };

  /**
   * @param {Coordinate} delta Amount the pointer has moved since it started.
   * @return {boolean} Whether Draggable should lock the user into draggable only.
   * @private
   */


  Pointer.prototype._shouldLock = function _shouldLock(delta) {
    var pastX = this.isXAxis() && Math.abs(delta.x) > Pointer.LOCK_THRESHOLD;
    var pastY = this.isYAxis() && Math.abs(delta.y) > Pointer.LOCK_THRESHOLD;
    return this.isBothAxis() || pastX || pastY;
  };

  /**
   * @param {Coordinate} delta Amount the pointer has moved since it started.
   * @return {boolean} Whether Draggable should stop affecting the draggable element.
   * @private
   */


  Pointer.prototype._shouldDeactivate = function _shouldDeactivate(delta) {
    var pastX = this.isXAxis() && Math.abs(delta.y) > Pointer.DRAG_THRESHOLD;
    var pastY = this.isYAxis() && Math.abs(delta.x) > Pointer.DRAG_THRESHOLD;
    return !this._isLocked && (this.isBothAxis() || pastX || pastY);
  };

  /**
   * Make a new event with data.
   * @param {Pointer.EventType} type Event type.
   * @param {Event} evt Native event object.
   * @return {!PointerEvent}
   * @private
   */


  Pointer.prototype._createEvent = function _createEvent(type, evt) {
    return new Pointer.Event({
      type: type,
      pointerId: this.id,
      currentTarget: this.element,
      target: evt.target,
      axis: this.axis,
      deltaTime: this.deltaTime,
      delta: this.delta,
      start: this.pageStart,
      end: this.page,
      currentVelocity: this.velocity
    });
  };

  /**
   * Binds events to the document for move, end, and cancel (if cancel events
   * exist for the device).
   * @param {string} startType The type of event which started the drag. It
   *     is important that the mouse events are not bound when a touch event
   *     is triggered otherwise the events could be doubled.
   * @private
   */


  Pointer.prototype._addDragHandlers = function _addDragHandlers(startType) {
    var target = this.dragEventTarget;
    this._onMove = this._handleDragMove.bind(this);
    this._onEnd = this._handleDragEnd.bind(this);

    switch (startType) {
      case odoHelpers.events.POINTERDOWN:
        target.addEventListener(odoHelpers.events.POINTERMOVE, this._onMove);
        target.addEventListener(odoHelpers.events.POINTERUP, this._onEnd);
        target.addEventListener(odoHelpers.events.POINTERCANCEL, this._onEnd);
        break;
      case odoHelpers.events.MOUSEDOWN:
        target.addEventListener(odoHelpers.events.MOUSEMOVE, this._onMove);
        target.addEventListener(odoHelpers.events.MOUSEUP, this._onEnd);
        break;
      case odoHelpers.events.TOUCHSTART:
        target.addEventListener(odoHelpers.events.TOUCHMOVE, this._onMove);
        target.addEventListener(odoHelpers.events.TOUCHEND, this._onEnd);
        target.addEventListener(odoHelpers.events.TOUCHCANCEL, this._onEnd);
        break;
      // no default
    }
  };

  /**
   * Removes the events bound during drag start. The draggable namespace can be
   * used to remove all of them because the drag start event is still bound
   * to the actual element.
   */


  Pointer.prototype._removeDragHandlers = function _removeDragHandlers() {
    var target = this.dragEventTarget;
    target.removeEventListener(odoHelpers.events.POINTERMOVE, this._onMove);
    target.removeEventListener(odoHelpers.events.POINTERUP, this._onEnd);
    target.removeEventListener(odoHelpers.events.POINTERCANCEL, this._onEnd);
    target.removeEventListener(odoHelpers.events.MOUSEMOVE, this._onMove);
    target.removeEventListener(odoHelpers.events.MOUSEUP, this._onEnd);
    target.removeEventListener(odoHelpers.events.TOUCHMOVE, this._onMove);
    target.removeEventListener(odoHelpers.events.TOUCHEND, this._onEnd);
    target.removeEventListener(odoHelpers.events.TOUCHCANCEL, this._onEnd);
  };

  /**
   * Every 100 milliseconds, calculate the current velocity with a moving average.
   * http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
   * @private
   */


  Pointer.prototype._trackVelocity = function _trackVelocity() {
    var now = Date.now();
    var elapsed = now - this._lastTime;
    var delta = odoHelpers.Coordinate.difference(this.page, this._lastPosition);
    this.applyFriction(delta);
    this._lastTime = now;
    this._lastPosition = this.page;

    // velocity = delta / time.
    // Clamp the velocity to avoid outliers.
    var maxVelocity = Pointer.MAX_VELOCITY;
    this.velocity.x = odoHelpers.clamp(delta.x / elapsed, -maxVelocity, maxVelocity);
    this.velocity.y = odoHelpers.clamp(delta.y / elapsed, -maxVelocity, maxVelocity);

    this._hasTrackedVelocity = true;
  };

  /**
   * Determine whether the draggable event has enough velocity to be
   * considered a swipe.
   * @param {Object} velocity Object with x and y properties for velocity.
   * @param {number} [threshold] Threshold to check against. Defaults to the swipe
   *     velocity constant. Must be zero or a positive number.
   * @return {boolean}
   */


  Pointer.prototype.hasVelocity = function hasVelocity(velocity) {
    var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Pointer.SWIPE_VELOCITY;

    if (this.isYAxis()) {
      return Math.abs(velocity.y) > threshold;
    }

    if (this.isXAxis()) {
      return Math.abs(velocity.x) > threshold;
    }

    // Otherwise check both axis for velocity.
    return Math.abs(velocity.x) > threshold || Math.abs(velocity.y) > threshold;
  };

  /**
   * Emits a event on this instance.
   * @param {PointerEvent} event Event object with data.
   * @return {boolean} Whether preventDefault was called on the event.
   */


  Pointer.prototype._emitEvent = function _emitEvent(event) {
    this.emit(event.type, event);
    return event.defaultPrevented;
  };

  /**
   * Remove event listeners and element references.
   */


  Pointer.prototype.dispose = function dispose() {
    clearInterval(this._velocityTrackerId);
    this._removeDragHandlers();

    // Remove pointer/mouse/touch events.
    this._el.removeEventListener(odoHelpers.events.POINTERDOWN, this._onStart);
    this._el.removeEventListener(odoHelpers.events.MOUSEDOWN, this._onStart);
    this._el.removeEventListener(odoHelpers.events.TOUCHSTART, this._onStart);

    if (this._isTouchActionSupported) {
      this._el.style[Pointer.TouchActionSupport[this.axis]] = '';
    } else if (this._shouldPreventDefault && OdoDevice.HAS_TOUCH_EVENTS) {
      window.removeEventListener(odoHelpers.events.TOUCHMOVE, odoHelpers.noop);
    }

    this._el = null;
    this.dragEventTarget = null;
  };

  /**
   * Whether the event is from a touch.
   * @param {Event} evt Event object.
   * @return {boolean}
   */


  Pointer.isTouchEvent = function isTouchEvent(evt) {
    return !!evt.changedTouches;
  };

  /**
   * Whether the event is from a pointer cancel or touch cancel.
   * @param {Event} evt Event object.
   * @return {boolean}
   * @private
   */


  Pointer._isCancelEvent = function _isCancelEvent(evt) {
    return evt.type === odoHelpers.events.POINTERCANCEL || evt.type === odoHelpers.events.TOUCHCANCEL;
  };

  /**
   * Retrieve the page x and page y based on an event. It normalizes
   * touch events, mouse events, and pointer events.
   * @param {Event} evt Event object.
   * @return {!Coordinate} The pageX and pageY of the press.
   * @private
   */


  Pointer._getPageCoordinate = function _getPageCoordinate(evt) {
    var pagePoints = void 0;

    // Use the first touch for the pageX and pageY.
    if (Pointer.isTouchEvent(evt)) {
      pagePoints = evt.changedTouches[0]; // eslint-disable-line prefer-destructuring
    } else {
      pagePoints = evt;
    }

    return new odoHelpers.Coordinate(pagePoints.pageX, pagePoints.pageY);
  };

  Pointer._preventDefault = function _preventDefault(evt) {
    evt.preventDefault();
  };

  createClass(Pointer, [{
    key: 'element',
    get: function get$$1() {
      return this._el;
    }

    /**
     * Get whether dragger is enabled.
     * @return {boolean} Whether dragger is enabled.
     */

  }, {
    key: 'isEnabled',
    get: function get$$1() {
      return this._enabled;
    }

    /**
     * Set whether dragger is enabled.
     * @param {boolean} enabled Whether dragger is enabled.
     */
    ,
    set: function set$$1(enabled) {
      this._enabled = enabled;
    }
  }, {
    key: 'friction',
    get: function get$$1() {
      return this._friction;
    }

    /**
     * Set the friction value.
     * @param {number} friction A number between [1, 0].
     */
    ,
    set: function set$$1(friction) {
      this._friction = friction;
    }
  }]);
  return Pointer;
}(TinyEmitter);

Object.assign(Pointer, settings);

/** @type {PointerEvent} */
Pointer.Event = PointerEvent;

return Pointer;

})));
//# sourceMappingURL=odo-pointer.js.map
