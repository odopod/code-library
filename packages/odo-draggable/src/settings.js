import OdoPointer from '@odopod/odo-pointer';

export default {
  /** @enum {string} */
  EventType: {
    START: 'ododraggable:start',
    MOVE: 'ododraggable:move',
    END: 'ododraggable:end',
    SETTLE: 'ododraggable:throwsettle',
  },

  Classes: {
    GRABBABLE: 'grabbable',
    GRABBING: 'grabbing',
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
    isThrowable: false,
  },
};
