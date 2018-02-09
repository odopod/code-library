/**
 * Ask the browser for a property that will cause it to recalculate styles
 * and layout the element (and possibly surrounding/parent elements).
 * @param {HTMLElement} element Element to for a layout for.
 * @return {number} Width of the element. If you actually need the width of
 *     element, use the `style.getSize` method.
 */
export default function causeLayout(element) {
  return element.offsetWidth;
}
