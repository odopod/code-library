/**
 * Retrieves the nth sibling of an element, or null if the would be nth sibling
 * does not exist. Heads up! This function excludes text nodes.
 * @param {Element} node Element to start looking from.
 * @param {number} n An integer representing the desired element relative to
 *     `node`. For example, `2` would look for `node.nextSibling.nextSibling`.
 * @param {boolean=} optIsForward Whether to look forwards or backwards. Default is true.
 * @return {?Element} The nth sibling or null.
 */
export default function getNthSibling(node, n, optIsForward) {
  const isForward = optIsForward !== false;
  let siblingCount = 0;
  let sibling = node;
  do {
    sibling = isForward ?
      sibling.nextElementSibling :
      sibling.previousElementSibling;
    siblingCount += 1;
  } while (sibling && siblingCount < n);
  return sibling;
}
