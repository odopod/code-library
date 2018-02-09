/**
 * Removes all children from a parent node.
 * @param {Element} element Parent node.
 */
export default function removeChildren(element) {
  element.textContent = '';
}
