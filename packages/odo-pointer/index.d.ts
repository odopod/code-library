// Type definitions for OdoPointer
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

import { Coordinate } from '@odopod/odo-helpers';

export as namespace OdoPointer;

export = OdoPointer;

declare class OdoPointer {
  /**
   * An abstraction layer for adding pointer events and calculating drag values.
   * @param {HTMLElement} element Element to watch.
   * @param {object} options Options object.
   * @throws {TypeError} Throws when the element parameter isn't an element.
   */
  constructor(element: HTMLElement, options?: OdoPointer.Options);

  /** Main element for this class */
  element: HTMLElement;

  options: OdoPointer.Options;

  /*~
   *~ From tiny emitter
   *~ https://github.com/scottcorgan/tiny-emitter/blob/master/index.d.ts
   */
  on(event: string, callback: Function, ctx?: any): OdoPointer;
  once(event: string, callback: Function, ctx?: any): OdoPointer;
  emit(event: string, ...args: any[]): OdoPointer;
  off(event: string, callback?: Function): OdoPointer;

  /**
   * Starting location of the drag.
   * @type {Coordinate}
   */
  pageStart: Coordinate;

  /**
   * Current position of mouse or touch relative to the document.
   * @type {Coordinate}
   */
  page: Coordinate;

  /**
   * Current position of drag relative to target's parent.
   * @type {Coordinate}
   */
  delta: Coordinate;

  /**
   * Time in milliseconds when the drag started.
   * @type {number}
   */
  startTime: number;

  /**
   * Length of the drag in milliseconds.
   * @type {number}
   */
  deltaTime: number;

  /**
   * The current velocity of the drag.
   * @type {Coordinate}
   */
  velocity: Coordinate;

  /**
   * The element to which the move and up events will be bound to. If a pointer
   * is being used inside a modal which stops events from bubbling to the body,
   * this property should be changed to an element which *will* receive the events.
   * @type {Document|Element}
   */
  dragEventTarget: Document | Element;

  /**
   * Whether dragging is enabled. If false, touch|mouse|pointer events are ignored.
   */
  isEnabled: boolean;

  /**
   * Friction to apply to dragging. A value of zero would result in no dragging,
   * 0.5 would result in the draggable element moving half as far as the user
   * dragged, and 1 is a 1:1 ratio with user movement.
   */
  friction: number;

  listen(): void;

  /**
   * Whether the draggable axis is the x direction.
   */
  isXAxis(): boolean;

  /**
   * Whether the draggable axis is the y direction.
   */
  isYAxis(): boolean;

  /**
   * Whether the draggable axis is for both axis.
   */
  isBothAxis(): boolean;

  /**
   * Apply a friction value to a coordinate, reducing its value.
   * This modifies the coordinate given to it.
   * @param {Coordinate} coordinate The coordinate to scale.
   * @return {Coordinate} Position multiplied by friction.
   */
  applyFriction(coordinate: Coordinate): Coordinate;

  /**
   * Determine whether the draggable event has enough velocity to be
   * considered a swipe.
   * @param {Coordinate} velocity Object with x and y properties for velocity.
   * @param {number} [threshold] Threshold to check against. Defaults to the swipe
   *     velocity constant. Must be zero or a positive number.
   * @return {boolean}
   */
  hasVelocity(velocity: Coordinate, threshold?: number): boolean;

  /**
   * Remove event listeners and element references.
   */
  dispose(): void;
}

declare namespace OdoPointer {
  export interface Options {
    axis?: OdoPointer.Axis,
    preventEventDefault?: boolean,
  }

  export class Event {
    constructor(options: {
      type: string;
      target: Element;
      currentTarget: Element;
      start: Coordinate;
      end: Coordinate;
      delta: Coordinate;
      deltaTime: number;
      axis: OdoPointer.Axis;
      currentVelocity: Coordinate;
    });
    type: string;
    target: Element;
    currentTarget: Element;
    start: Coordinate;
    end: Coordinate;
    delta: Coordinate;
    deltaTime: number;
    axis: OdoPointer.Axis;
    velocity: Coordinate;
    currentVelocity: Coordinate;
    distance: number;
    direction: OdoPointer.Direction;
    isDirectionOnAxis: boolean;
    didMoveOnAxis: boolean;
    axisDirection: string;
    position: { pixel: Coordinate, percent: Coordinate };
    defaultPrevented: boolean;
    preventDefault(): void;
  }

  /**
   * Whether the event is from a touch.
   * @param {object} evt Event object.
   * @return {boolean}
   */
  function isTouchEvent(evt: object): boolean;

  /**
   * Possible drag directions.
   */
  enum Direction {
    RIGHT = 'right',
    LEFT = 'left',
    UP = 'up',
    DOWN = 'down',
    NONE = 'no_movement',
  }

  enum Axis {
    X = 'x',
    Y = 'y',
    BOTH = 'xy',
  }

  /**
   * Events emitted by pointer instances.
   */
  enum EventType {
    START = 'odopointer:start',
    MOVE = 'odopointer:move',
    END = 'odopointer:end',
  }

  enum TouchAction {
    x = 'pan-y',
    y = 'pan-x',
    xy = 'none',
  }

  /**
   * Default options for each instance.
   */
  const Defaults: OdoPointer.Options;

  /**
   * The current velocity property will be clamped to this value (pixels/millisecond).
   */
  let MAX_VELOCITY: number;

  /**
   * When the pointer is down, an interval starts to track the current velocity.
   */
  let VELOCITY_INTERVAL: number;

  /**
   * Velocity required for a movement to be considered a swipe.
   */
  let SWIPE_VELOCITY: number;

  /**
   * The scroll/drag amount (pixels) required on the draggable axis before
   * stopping further page scrolling/movement.
   */
  let LOCK_THRESHOLD: number;

  /**
   * The scroll/drag amount (pixels) required on the opposite draggable axis
   * before dragging is deactivated for the rest of the interaction.
   */
  let DRAG_THRESHOLD: number;
}
