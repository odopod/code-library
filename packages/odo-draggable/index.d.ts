// Type definitions for OdoDraggable
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

import OdoPointer from '@odopod/odo-pointer';
import { Coordinate, Rect } from '@odopod/odo-helpers';

export as namespace OdoDraggable;

export = OdoDraggable;

declare class OdoDraggable {
  constructor(element: HTMLElement, opts?: OdoDraggable.Options);

  /** The draggable element */
  element: HTMLElement;

  options: OdoDraggable.Options;

  /**
   * Limits of how far the draggable element can be dragged.
   * @type {Rect}
   */
  limits: Rect;

  /**
   * Pointer instance.
   */
  pointer: OdoPointer;

  /**
   * Control the friction of the pointer instance.
   */
  friction: number;

  /**
   * Whether dragger is enabled.
   */
  isEnabled: boolean;

  /**
   * Returns the current position of the draggable element.
   * @param {boolean} [asPercent] Optionally retrieve percentage values instead
   *     of pixel values.
   * @return {Coordinate} X and Y coordinates of the draggable element.
   */
  getPosition(asPercent?: boolean): Coordinate;

  /**
   * Set the position of the draggable element.
   * @param {number} x X position as a percentage. Eg. 50 for "50%".
   * @param {number} y Y position as a percentage. Eg. 50 for "50%".
   * @return {Coordinate} The position the draggable element was set to.
   */
  setPosition(x: number, y: number): Coordinate;

  /**
   * Sets (or reset) the Drag limits after a Dragger is created.
   * @param {Rect} limits Object containing left, top, width,
   *     height for new Dragger limits.
   */
  setLimits(limits: Rect): void;

  /**
   * Easy way to trigger setting dimensions. Useful for doing things after this
   * class has been initialized, but no dragging has occurred yet.
   */
  update(): void;

  /**
   * Remove event listeners and element references.
   */
  dispose(): void;
}

declare namespace OdoDraggable {
  export interface Options {
    axis?: OdoPointer.Axis,
    amplifier?: number,
    velocityStop?: number,
    throwFriction?: number,
    isThrowable?: boolean,
  }

  /**
   * HTML class names for elements of the draggable.
   */
  enum Classes {
    GRABBABLE = 'grabbable',
    GRABBING = 'grabbing',
  }

  enum EventType {
    START = 'ododraggable:start',
    MOVE = 'ododraggable:move',
    END = 'ododraggable:end',
    SETTLE = 'ododraggable:throwsettle',
  }

  /**
   * Default options for each instance.
   */
  const Defaults: OdoDraggable.Options;
}
