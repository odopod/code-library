import { Coordinate } from '@odopod/odo-helpers';
import settings from './settings';

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
  return new Coordinate(
    finiteOrZero(deltaX / deltaTime),
    finiteOrZero(deltaY / deltaTime),
  );
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
    return getTheDirection(
      coord1.x, coord2.x, settings.Direction.LEFT,
      settings.Direction.RIGHT, settings.Direction.NONE,
    );
  }

  return getTheDirection(
    coord1.y, coord2.y, settings.Direction.UP,
    settings.Direction.DOWN, settings.Direction.NONE,
  );
}

function isOnAxis(axis, direction) {
  const isXAndLeftOrRight = isXAxis(axis) && (
    direction === settings.Direction.LEFT ||
    direction === settings.Direction.RIGHT);

  const isYAndUpOrDown = isYAxis(axis) && (
    direction === settings.Direction.UP ||
    direction === settings.Direction.DOWN);

  const isBothAndNotNone = isBothAxis(axis) && hasDirection(direction);

  return isXAndLeftOrRight || isYAndUpOrDown || isBothAndNotNone;
}

function didMoveOnAxis(axis, direction, deltaX, deltaY) {
  // X axis and deltaX > 0
  return (isXAxis(axis) && Math.abs(deltaX) > 0) ||

  // Y axis and deltaY > 0
  (isYAxis(axis) && Math.abs(deltaY) > 0) ||

  // Both axis, as long as it actually moved.
  (isBothAxis(axis) && hasDirection(direction));
}

function getAxisDirection(axis, start, end) {
  const _start = Object.assign({}, start);
  const _end = Object.assign({}, end);

  if (isXAxis(axis)) {
    _start.y = 0;
    _end.y = 0;
  } else if (isYAxis(axis)) {
    _start.x = 0;
    _end.x = 0;
  }

  return getDirection(_start, _end);
}

class PointerEvent {
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
  constructor(options) {
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
    this.distance = Coordinate.distance(options.start, options.end);

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
    this.didMoveOnAxis = didMoveOnAxis(
      options.axis, this.direction,
      this.delta.x, this.delta.y,
    );

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

  preventDefault() {
    this.defaultPrevented = true;
  }
}

export default PointerEvent;
