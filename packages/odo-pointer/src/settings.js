import OdoDevice from '@odopod/odo-device';

export default {
  /** @enum {string} */
  EventType: {
    START: 'odopointer:start',
    MOVE: 'odopointer:move',
    END: 'odopointer:end',
  },

  /** @enum {string} */
  Direction: {
    RIGHT: 'right',
    LEFT: 'left',
    UP: 'up',
    DOWN: 'down',
    NONE: 'no_movement',
  },

  /** @enum {string|boolean} */
  TouchActionSupport: {
    x: OdoDevice.prefixed('touchAction', 'pan-y'),
    y: OdoDevice.prefixed('touchAction', 'pan-x'),
    xy: OdoDevice.prefixed('touchAction', 'none'),
  },

  /** @enum {string} */
  TouchAction: {
    x: 'pan-y',
    y: 'pan-x',
    xy: 'none',
  },

  /** @enum {string} */
  Axis: {
    X: 'x',
    Y: 'y',
    BOTH: 'xy',
  },

  Defaults: {
    axis: 'xy',
    preventEventDefault: true,
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
  DRAG_THRESHOLD: 5,
};
