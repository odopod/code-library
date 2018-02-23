// Type definitions for OdoScrollFeedback
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

import TinyEmitter from 'tiny-emitter';

export as namespace OdoScrollFeedback;

export = OdoScrollFeedback;

declare class OdoScrollFeedback extends TinyEmitter {
  constructor(element: HTMLElement, opts?: OdoScrollFeedback.Options);
  options: OdoScrollFeedback.Options;
  canScroll: boolean;
  wheelTimeout: number;
  scrollTimeout: number;
  wheelAmount: { x: number, y: number };
  startPosition: { x: number, y: number };

  /**
   * Enable the scroll feedback instance by adding event listeners.
   */
  enable(): void;

  /**
   * Disable the instance by removing event listeners.
   */
  disable(): void;

  /**
   * Emits a NAVIGATE event with a direction.
   * @param {OdoScrollFeedback.Direction} direction Direction to navigate.
   */
  navigate(direction: OdoScrollFeedback.Direction): void;

  /**
   * Scroll and touch events will not be counted as input.
   */
  pause(): void;

  /**
   * Counts scrolls and touch events as inputs.
   */
  resume(): void;

  /**
   * Remove DOM references and event handlers.
   */
  dispose(): void;
}

declare namespace OdoScrollFeedback {
  export interface Options {
    ignore?: string,
    movementThreshold?: number,
    scrollEndDelay?: number,
    scrollTimerDelay?: number,
  }

  enum Events {
    NAVIGATE = 'odoscrollfeedback:navigate',
    SCROLL_END = 'odoscrollfeedback:scrollend',
  }

  enum Direction {
    START = 1,
    PREVIOUS = 2,
    NEXT = 3,
    END = 4,
  }

  /**
   * Default options for each instance.
   */
  const Defaults: OdoScrollFeedback.Options;

  let MOUSE_WHEEL_SPEED: number;

  const PASSIVE_LISTENERS: boolean;
}
