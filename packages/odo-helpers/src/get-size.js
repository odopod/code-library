/**
 * Gets the height and with of an element when the display is not none.
 * @param {HTMLElement} element Element to get size of.
 * @return {!{width: number, height: number}} Object with width/height.
 */
export default function getSize(element) {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}
