import { Coordinate, events } from '@odopod/odo-helpers';
import OdoPointer from '@odopod/odo-pointer';

let count = 0;
function uniqueId() {
  count += 1;
  return `OdoTap${count}`;
}

/**
 * Simply prevent the event's default action.
 * @param {Event} evt Event object.
 */
const preventDefaultEventAction = (evt) => {
  evt.preventDefault();
};

class Tap {
  /**
   * Interprets touchs on an element as taps.
   * @param {Element} element Element to watch.
   * @param {Function} fn Callback function when the element is tapped.
   * @param {boolean} preventEventDefault Whether or not to prevent the default
   *     event during drags.
   * @constructor
   */
  constructor(element, fn, preventEventDefault) {
    this.element = element;
    this.fn = fn;
    this.preventEventDefault = preventEventDefault;
    this.pointer = new OdoPointer(element, {
      preventEventDefault,
    });

    this._listen();
  }

  /**
   * Add listener for the starting event.
   * @private
   */
  _listen() {
    this._onDragStart = this._handlePointerStart.bind(this);
    this._onDragMove = this._handlePointerMove.bind(this);
    this._onDragEnd = this._handlePointerEnd.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);

    this.pointer.on(OdoPointer.EventType.START, this._onDragStart);
    this.pointer.on(OdoPointer.EventType.MOVE, this._onDragMove);
    this.pointer.on(OdoPointer.EventType.END, this._onDragEnd);
    this.element.addEventListener(events.KEYUP, this._onKeyUp);

    // Prevent clicks from triggering things.
    if (this.preventEventDefault) {
      this.element.addEventListener(events.CLICK, preventDefaultEventAction);
    }
  }

  /**
   * Whether the current drag event has gone past the maximum threshold.
   * @return {boolean}
   * @private
   */
  _isPastThreshold() {
    return Coordinate.distance(this.pointer.pageStart, this.pointer.page) > Tap.MAX_MOVEMENT;
  }

  /**
   * Mouse/pointer down or touch start.
   * @private
   */
  _handlePointerStart() {
    this.hasDragged = false;
  }

  /**
   * User's pointer moved.
   * @private
   */
  _handlePointerMove() {
    if (!this.hasDragged) {
      this.hasDragged = this._isPastThreshold();
    }
  }

  /**
   * Dragging ended.
   * @private
   */
  _handlePointerEnd(evt) {
    if (!evt.isCancelEvent && this.pointer.deltaTime < Tap.MAX_TIME &&
        !this.hasDragged) {
      // Assume default should be prevented. Return true from the callback to
      // allow the default event action.
      if (this.fn(evt) !== true) {
        evt.preventDefault();
      }
    }
  }

  /**
   * When the user presses the spacer bar or enter/return on their keyboard, it
   * should be considered a "tap" as well.
   * @param {KeyboardEvent} evt Event object.
   */
  _handleKeyUp(evt) {
    if (evt.which === 13 || evt.which === 32) {
      this.fn(evt);
      evt.preventDefault();
    }
  }

  /**
   * Destroy instance.
   */
  dispose() {
    this.element.removeEventListener(events.CLICK, preventDefaultEventAction);
    this.element.removeEventListener(events.KEYUP, this._onKeyUp);
    this.pointer.on(OdoPointer.EventType.START, this._onDragStart);
    this.pointer.on(OdoPointer.EventType.MOVE, this._onDragMove);
    this.pointer.on(OdoPointer.EventType.END, this._onDragEnd);
    this.pointer.dispose();
    this.element = null;
    this.fn = null;
  }

  /**
   * Listens for taps on an element.
   * @param {Element} element Element.
   * @param {Function} fn Callback.
   * @param {boolean=} preventDefault Optionally prevent the default event
   *     during drag start and move.
   * @return {string} The id to use to remove the listeners.
   */
  static addListener(element, fn, preventDefault = false) {
    const id = uniqueId();
    Tap._listeners.set(id, new Tap(element, fn, preventDefault));
    return id;
  }

  /**
   * Stop listening for taps on an element.
   * @param {string} id Id returned from addListener.
   */
  static remove(id) {
    if (Tap._listeners.get(id)) {
      Tap._listeners.get(id).dispose();
      Tap._listeners.delete(id);
    }
  }
}

/**
 * Maximum distance the user can tap and drag for the interaction to still
 * count as a tap.
 * @const {number}
 */
Tap.MAX_MOVEMENT = 10;

/**
 * Maximum time between tap down and tap up for the interaction to still
 * count as a tap.
 * @const {number}
 */
Tap.MAX_TIME = 250;

/**
 * Map of unique keys and tap instances.
 * @type {Map.<string, Tap>}
 * @private
 */
Tap._listeners = new Map();

export default Tap;
