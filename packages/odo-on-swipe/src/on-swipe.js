import OdoPointer from '@odopod/odo-pointer';

class OnSwipe {
  /**
   * Provides a callback for swipe events.
   * @param {Element} element Element to watch for swipes.
   * @param {function(PointerEvent)} fn Callback when swiped.
   * @param {OdoPointer.Axis} [axis] Optional axis. Defaults to 'x'.
   * @constructor
   */
  constructor(element, fn, axis = OdoPointer.Axis.X) {
    this.fn = fn;

    this.pointer = new OdoPointer(element, {
      axis,
    });

    this._onEnd = this._handlePointerEnd.bind(this);

    this.pointer.on(OdoPointer.EventType.END, this._onEnd);
  }

  /**
   * Received the pointer end event.
   * @param {PointerEvent} pointerEvent Pointer event object.
   */
  _handlePointerEnd(pointerEvent) {
    if (this.pointer.hasVelocity(pointerEvent.velocity)) {
      this.fn(pointerEvent);
    }
  }

  /** Cleanup this component. */
  dispose() {
    this.pointer.off(OdoPointer.EventType.END, this._onEnd);
    this.pointer.dispose();
    this._onEnd = null;
    this.fn = null;
  }
}

export default OnSwipe;
