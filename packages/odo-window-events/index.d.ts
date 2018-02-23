// Type definitions for OdoWindowEvents
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

export as namespace OdoWindowEvents;

export = OdoWindowEvents;

type ScrollCallback = (scrollTop: number, scrollLeft: number) => void;
type ResizeCallback = (viewportWidth: number, viewportHeight: number) => void;

declare namespace OdoWindowEvents {

  /**
   * Bind a callback to window scroll.
   * @param {ScrollCallback} fn Callback to execute on scroll.
   * @return {string} id of event, to be used with service's remove method.
   */
  function onScroll(fn: ScrollCallback): string;

  /**
   * Bind a callback to window scroll which executes quicker.
   * @param {ScrollCallback} fn Callback to execute on scroll.
   * @return {string} id of event, to be used with service's remove method.
   */
  function onFastScroll(fn: ScrollCallback): string;

  /**
   * Bind a callback to window resize.
   * @param {ResizeCallback} fn Callback to execute on resize.
   * @return {string} id of event, to be used with service's remove method.
   */
  function onResize(fn: ResizeCallback): string;

  /**
   * Bind a callback to window resize.
   * @param {ResizeCallback} fn Callback to execute on resize.
   * @return {string} id of event, to be used with service's remove method.
   */
  function onLeadingResize(fn: ResizeCallback): string;

  /**
   * Remove callback with a given id.
   * @param {string} id Callback ID to remove.
   */
  function remove(id: string): void;

  const Timing: {
    DEBOUNCE_TIME: number,
    THROTTLE_TIME_DEFAULT: number,
    THROTTLE_TIME_FAST: number,
  };
}
