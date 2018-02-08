/**
 * Set an id on an element if one doesn't exist.
 * @param {Element} element Element to give an id.
 * @param {function():string|string} fn Returns an id to set.
 */
export default function giveId(element, fn) {
  if (!element.id) {
    element.id = typeof fn === 'function' ? fn() : fn;
  }
}
