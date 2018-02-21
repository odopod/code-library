// Type definitions for OdoScrollAnimation
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

export as namespace OdoScrollAnimation;

export = OdoScrollAnimation;

type ScrollCallback = (scrollTop: number) => void;

declare namespace OdoScrollAnimation {
  /**
   * Add a new scroll listener to an optional target. Defaults to when the
   * page is scrolled.
   * @param {Element|Window|ScrollCallback} target Optional element. Default = window.
   * @param {ScrollCallback} [fn] Callback method with the new scroll top
   *     value as the first parameter.
   * @return {string} Id to unbind with.
   */
  function add(target: Element|Window|ScrollCallback, fn?: ScrollCallback): string;

  /**
   * Remove a scroll listener by id.
   * @param {string} id The id returned from adding it.
   */
  function remove(id: string): void;
}
