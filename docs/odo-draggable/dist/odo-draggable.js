(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-pointer'), require('tiny-emitter'), require('@odopod/odo-device'), require('@odopod/odo-helpers')) :
	typeof define === 'function' && define.amd ? define(['@odopod/odo-pointer', 'tiny-emitter', '@odopod/odo-device', '@odopod/odo-helpers'], factory) :
	(global.OdoDraggable = factory(global.OdoPointer,global.TinyEmitter,global.OdoDevice,global.OdoHelpers));
}(this, (function (OdoPointer,TinyEmitter,OdoDevice,odoHelpers) { 'use strict';

OdoPointer = OdoPointer && OdoPointer.hasOwnProperty('default') ? OdoPointer['default'] : OdoPointer;
TinyEmitter = TinyEmitter && TinyEmitter.hasOwnProperty('default') ? TinyEmitter['default'] : TinyEmitter;
OdoDevice = OdoDevice && OdoDevice.hasOwnProperty('default') ? OdoDevice['default'] : OdoDevice;

var settings = {
  /** @enum {string} */
  EventType: {
    START: 'ododraggable:start',
    MOVE: 'ododraggable:move',
    END: 'ododraggable:end',
    SETTLE: 'ododraggable:throwsettle'
  },

  Classes: {
    GRABBABLE: 'grabbable',
    GRABBING: 'grabbing'
  },

  Defaults: {
    // Draggable axis.
    axis: OdoPointer.Axis.X,

    // Amplifies throw velocity by this value. Higher values make the throwable
    // travel farther and faster.
    amplifier: 24,

    // Once the velocity has gone below this threshold, throwing stops.
    velocityStop: 0.08,

    // On each throw frame, the velocity is multiplied by this friction value.
    // It must be less than 1. Higher values let the throwable slide farther and longer.
    throwFriction: 0.94,

    // Whether the draggable will keep its movement momentum after the user releases.
    isThrowable: false
  }
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

var Draggable = function (_TinyEmitter) {
  inherits(Draggable, _TinyEmitter);

  function Draggable(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Draggable);

    /**
     * The draggable element.
     * @type {HTMLElement}
     * @private
     */
    var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

    _this.element = element;

    /**
     * Override any defaults with the given options.
     * @type {Object}
     */
    _this.options = Object.assign({}, Draggable.Defaults, options);

    /**
     * The element which contains the target.
     * @type {HTMLElement}
     * @private
     */
    _this._parentEl = element.parentNode;

    /**
     * Current position of the handle/target.
     * @type {Coordinate}
     * @private
     */
    _this._currentPosition = new odoHelpers.Coordinate();

    /**
     * Starting location of the drag.
     * @type {Coordinate}
     * @private
     */
    _this._relativeZero = new odoHelpers.Coordinate();

    /**
     * Velocity at which the draggable was thrown. This value decays over time
     * after a throw.
     * @private
     * @type {Coordinate}
     */
    _this._throwVelocity = new odoHelpers.Coordinate();

    /**
     * The change in position from the start of the drag.
     * @private
     * @type {Coordinate}
     */
    _this._delta = new odoHelpers.Coordinate();

    /**
     * Animation frame id.
     * @private
     * @type {number}
     */
    _this._requestId = 0;

    /**
     * The size of the containing element. This element is used to determine
     * the percentage position of the draggable element.
     * @type {Object}
     */
    _this._container = { width: 0, height: 0 };

    /**
     * Limits of how far the draggable element can be dragged.
     * @type {Rect}
     */
    _this.limits = new odoHelpers.Rect(NaN, NaN, NaN, NaN);

    _this.pointer = new OdoPointer(element, {
      axis: _this.options.axis
    });

    _this.element.classList.add(Draggable.Classes.GRABBABLE);

    // Kick off.
    _this._listen();
    return _this;
  }

  Draggable.prototype._listen = function _listen() {
    this._onStart = this._handleDragStart.bind(this);
    this._onMove = this._handleDragMove.bind(this);
    this._onEnd = this._handleDragEnd.bind(this);

    this.pointer.on(OdoPointer.EventType.START, this._onStart);
    this.pointer.on(OdoPointer.EventType.MOVE, this._onMove);
    this.pointer.on(OdoPointer.EventType.END, this._onEnd);
  };

  /**
   * Saves the containment element's width and height and scrubber position.
   * @private
   */


  Draggable.prototype._saveDimensions = function _saveDimensions() {
    this._container = odoHelpers.getSize(this.element);
    ensureObjectHasSize(this._container);
    this._relativeZero = this._getRelativeZero();
  };

  /**
   * The position relative to the rest of the page. When it's first
   * initialized, it is zero zero, but after dragging, it is the position
   * relative to zero zero.
   * @return {!Coordinate}
   * @private
   */


  Draggable.prototype._getRelativeZero = function _getRelativeZero() {
    return odoHelpers.Coordinate.difference(this._getDraggablePosition(), this._getOffsetCorrection());
  };

  Draggable.prototype._getDraggablePosition = function _getDraggablePosition() {
    var elRect = this.element.getBoundingClientRect();
    return new odoHelpers.Coordinate(elRect.left, elRect.top);
  };

  /**
   * Because the draggable element gets moved around and repositioned,
   * the bounding client rect method and the offset left and top properties
   * are unreliable once the element has been dragged once. This method uses
   * the bounding client rect of the parent element to get a "correction"
   * value.
   * @return {!Coordinate}
   * @private
   */


  Draggable.prototype._getOffsetCorrection = function _getOffsetCorrection() {
    // getBoundingClientRect does not include margins. They must be accounted for.
    var containmentRect = this._parentEl.getBoundingClientRect();
    var paddings = odoHelpers.getPaddingBox(this._parentEl);
    var margins = odoHelpers.getMarginBox(this.element);
    var offsetCorrectionX = margins.left + paddings.left + containmentRect.left;
    var offsetCorrectionY = margins.top + paddings.top + containmentRect.top;
    return new odoHelpers.Coordinate(offsetCorrectionX, offsetCorrectionY);
  };

  /**
   * Sets the current position coordinate to a new coordinate.
   * @param {Coordinate} position Where the x and y values are a percentage.
   *     e.g. 50 for "50%".
   */


  Draggable.prototype._setCurrentPosition = function _setCurrentPosition(position) {
    this.pointer.applyFriction(position);
    var x = this._limitX(position.x / 100 * this._parentEl.offsetWidth);
    var y = this._limitY(position.y / 100 * this._parentEl.offsetHeight);
    this._currentPosition = this._getAxisCoordinate(Math.round(x), Math.round(y));
  };

  /**
   * Clamp the x or y value.
   * @param {number} value X or Y value.
   * @param {number} rectPosition The limits starting edge. (left or top).
   * @param {number} rectSize The limits dimension. (width or height).
   * @return {number} The clamped number.
   */


  Draggable._limitValue = function _limitValue(value, rectPosition, rectSize) {
    var side = odoHelpers.defaultsTo(rectPosition, null, !Number.isNaN(rectPosition));
    var dimension = odoHelpers.defaultsTo(rectSize, 0, !Number.isNaN(rectSize));
    var max = odoHelpers.defaultsTo(side + dimension, Infinity, side !== null);
    var min = odoHelpers.defaultsTo(side, -Infinity, side !== null);
    return odoHelpers.clamp(value, min, max);
  };

  /**
   * Returns the 'real' x after limits are applied (allows for some
   * limits to be undefined).
   * @param {number} x X-coordinate to limit.
   * @return {number} The 'real' X-coordinate after limits are applied.
   */


  Draggable.prototype._limitX = function _limitX(x) {
    return Draggable._limitValue(x, this.limits.left, this.limits.width);
  };

  /**
   * Returns the 'real' y after limits are applied (allows for some
   * limits to be undefined).
   * @param {number} y Y-coordinate to limit.
   * @return {number} The 'real' Y-coordinate after limits are applied.
   */


  Draggable.prototype._limitY = function _limitY(y) {
    return Draggable._limitValue(y, this.limits.top, this.limits.height);
  };

  /**
   * Returns the x and y positions the draggable element should be set to.
   * @param {Coordinate=} optPosition Position to set the draggable
   *     element. This will optionally override calculating the position
   *     from a drag.
   * @return {!Coordinate} The x and y coordinates.
   * @private
   */


  Draggable.prototype._getElementPosition = function _getElementPosition(optPosition) {
    if (optPosition) {
      this._setCurrentPosition(optPosition);
    }

    var newX = this._currentPosition.x / this._container.width * 100;
    var newY = this._currentPosition.y / this._container.height * 100;

    return this._getAxisCoordinate(newX, newY);
  };

  /**
   * Ensures the y value of an x axis draggable is zero and visa versa.
   * @param {number} newX New position for the x value.
   * @param {number} newY New position for the y value.
   * @return {!Coordinate}
   * @private
   */


  Draggable.prototype._getAxisCoordinate = function _getAxisCoordinate(newX, newY) {
    // Drag horizontal only.
    if (this.pointer.isXAxis()) {
      return new odoHelpers.Coordinate(newX, 0);
    }

    // Drag vertical only.
    if (this.pointer.isYAxis()) {
      return new odoHelpers.Coordinate(0, newY);
    }

    // Drag both directions.
    return new odoHelpers.Coordinate(newX, newY);
  };

  /**
   * Returns a new coordinate with limits applied to it.
   * @param {Coordinate} deltaFromStart The distance moved since the drag started.
   * @return {!Coordinate}
   * @private
   */


  Draggable.prototype._getNewLimitedPosition = function _getNewLimitedPosition(deltaFromStart) {
    var sum = odoHelpers.Coordinate.sum(this._relativeZero, deltaFromStart);
    return new odoHelpers.Coordinate(this._limitX(sum.x), this._limitY(sum.y));
  };

  /**
   * Drag start handler.
   * @private
   */


  Draggable.prototype._handleDragStart = function _handleDragStart(evt) {
    this._stopThrow();
    this._saveDimensions();
    this._currentPosition = this._relativeZero;
    this._emitEvent(this._createEvent(Draggable.EventType.START, evt));
    this.element.classList.add(Draggable.Classes.GRABBING);
  };

  /**
   * Drag move, after _applyPosition has happened
   * @param {PointerEvent} evt The dragger event.
   * @private
   */


  Draggable.prototype._handleDragMove = function _handleDragMove(evt) {
    // Calculate the new position based on limits and the starting point.
    this._currentPosition = this._getNewLimitedPosition(this.pointer.delta);

    this._emitEvent(this._createEvent(Draggable.EventType.MOVE, evt));

    if (!this.pointer._isDeactivated) {
      this._applyPosition();
    }
  };

  /**
   * Dragging ended.
   * @private
   */


  Draggable.prototype._handleDragEnd = function _handleDragEnd(evt) {
    this._emitEvent(this._createEvent(Draggable.EventType.END, evt));
    this.element.classList.remove(Draggable.Classes.GRABBING);

    if (this.options.isThrowable && this.pointer.hasVelocity(evt.currentVelocity, 0)) {
      this._throw(evt.currentVelocity, evt.delta);
    }
  };

  /**
   * Start a throw based on the draggable's velocity.
   * @param {Coordinate} velocity Velocity.
   * @param {Coordinate} delta Total drag distance from start to end.
   * @private
   */


  Draggable.prototype._throw = function _throw(velocity, delta) {
    this._delta = delta;
    this._throwVelocity = odoHelpers.Coordinate.scale(velocity, this.options.amplifier);
    this._animateThrow();
  };

  /**
   * Scale down the velocity, update the position, and apply it. Then do it again
   * until it's below a threshold.
   * @private
   */


  Draggable.prototype._animateThrow = function _animateThrow() {
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
  };

  /**
   * Interrupt a throw.
   * @private
   */


  Draggable.prototype._stopThrow = function _stopThrow() {
    this._delta = new odoHelpers.Coordinate();
    this._throwVelocity = new odoHelpers.Coordinate();
    cancelAnimationFrame(this._requestId);
  };

  /**
   * Dispatches the SETTLE event with data. This data is different from the start,
   * move, and end events which use data from the pointer.
   * @private
   */


  Draggable.prototype._emitSettled = function _emitSettled() {
    this._emitEvent(new OdoPointer.Event({
      type: Draggable.EventType.SETTLE,
      target: this.element,
      axis: this.pointer.axis,
      deltaTime: Date.now() - this.pointer.startTime,
      delta: odoHelpers.Coordinate.difference(this._relativeZero, this._currentPosition),
      start: this._relativeZero,
      end: this._currentPosition,
      currentVelocity: this._throwVelocity,
      position: {
        pixel: this.getPosition(),
        percent: this.getPosition(true)
      }
    }));
  };

  /**
   * Make a new event with data.
   * @param {Draggable.EventType} type Event type.
   * @param {Event} evt Native event object.
   * @return {!OdoPointer.Event}
   * @private
   */


  Draggable.prototype._createEvent = function _createEvent(type, evt) {
    return new OdoPointer.Event({
      type: type,
      target: evt.target,
      currentTarget: this.element,
      axis: this.pointer.axis,
      deltaTime: this.pointer.deltaTime,
      delta: odoHelpers.Coordinate.difference(this._currentPosition, this._relativeZero),
      start: this._relativeZero,
      end: this._currentPosition,
      currentVelocity: this.pointer.velocity,
      position: {
        pixel: this.getPosition(),
        percent: this.getPosition(true)
      }
    });
  };

  /**
   * Sets the position of thd draggable element.
   * @param {Coordinate} [position] Position to set the draggable element. This
   *     will optionally override calculating the position from a drag.
   * @return {Coordinate} The position the draggable element was set to.
   */


  Draggable.prototype._applyPosition = function _applyPosition(position) {
    var pos = this._getElementPosition(position);
    this.element.style[OdoDevice.Dom.TRANSFORM] = 'translate(' + pos.x + '%,' + pos.y + '%)';
    return this._currentPosition;
  };

  /**
   * Returns the current position of the draggable element.
   * @param {boolean} [asPercent] Optionally retrieve percentage values instead
   *     of pixel values.
   * @return {Coordinate} X and Y coordinates of the draggable element.
   */


  Draggable.prototype.getPosition = function getPosition(asPercent) {
    if (asPercent) {
      return new odoHelpers.Coordinate(this._currentPosition.x / this._parentEl.offsetWidth * 100, this._currentPosition.y / this._parentEl.offsetHeight * 100);
    }
    return this._currentPosition;
  };

  /**
   * Set the position of the draggable element.
   * @param {number} x X position as a percentage. Eg. 50 for "50%".
   * @param {number} y Y position as a percentage. Eg. 50 for "50%".
   * @return {Coordinate} The position the draggable element was set to.
   */


  Draggable.prototype.setPosition = function setPosition(x, y) {
    // setPosition can be called before any dragging, this would cause
    // the containment width and containment height to be undefined.
    this.update();
    return this._applyPosition(new odoHelpers.Coordinate(x, y));
  };

  /**
   * Sets (or reset) the Drag limits after a Dragger is created.
   * @param {Rect} limits Object containing left, top, width,
   *     height for new Dragger limits.
   */


  Draggable.prototype.setLimits = function setLimits(limits) {
    this.limits = limits;
  };

  /**
   * Easy way to trigger setting dimensions. Useful for doing things after this
   * class has been initialized, but no dragging has occurred yet.
   */
  Draggable.prototype.update = function update() {
    this._saveDimensions();
  };

  /**
   * Remove event listeners and element references.
   * @private
   */


  Draggable.prototype.dispose = function dispose() {
    this.pointer.off(OdoPointer.EventType.START, this._onStart);
    this.pointer.off(OdoPointer.EventType.MOVE, this._onMove);
    this.pointer.off(OdoPointer.EventType.END, this._onEnd);

    this.pointer.dispose();

    this.element.classList.remove(Draggable.Classes.GRABBABLE);

    this._parentEl = null;
    this.element = null;
  };

  /**
   * Emits a event on this instance.
   * @param {PointerEvent} event Event object with data.
   * @return {boolean} Whether preventDefault was called on the event.
   */


  Draggable.prototype._emitEvent = function _emitEvent(event) {
    this.emit(event.type, event);
    return event.defaultPrevented;
  };

  createClass(Draggable, [{
    key: 'friction',
    get: function get$$1() {
      return this.pointer.friction;
    }

    /**
     * Set the friction value.
     * @param {number} friction A number between [1, 0].
     */
    ,
    set: function set$$1(friction) {
      this.pointer.friction = friction;
    }

    /**
     * Get whether dragger is enabled.
     * @return {boolean} Whether dragger is enabled.
     */

  }, {
    key: 'isEnabled',
    get: function get$$1() {
      return this.pointer.isEnabled;
    }

    /**
     * Set whether dragger is enabled.
     * @param {boolean} enabled Whether dragger is enabled.
     */
    ,
    set: function set$$1(enabled) {
      this.pointer.isEnabled = enabled;
      this.element.classList.toggle(settings.Classes.GRABBABLE, enabled);
    }
  }]);
  return Draggable;
}(TinyEmitter);

Object.assign(Draggable, settings);

return Draggable;

})));
//# sourceMappingURL=odo-draggable.js.map
