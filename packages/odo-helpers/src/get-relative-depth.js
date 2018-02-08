/**
 * Ripped from: goog.testing.editor.dom.getRelativeDepth_.
 *
 * Returns the depth of the given node relative to the given parent node, or -1
 * if the given node is not a descendant of the given parent node. E.g. if
 * node == parentNode returns 0, if node.parentNode == parentNode returns 1,
 * etc.
 * @param {Node} node Node whose depth to get.
 * @param {Node} parentNode Node relative to which the depth should be
 *     calculated.
 * @return {number} The depth of the given node relative to the given parent
 *     node, or -1 if the given node is not a descendant of the given parent
 *     node.
 */
export default function getRelativeDepth(node, parentNode) {
  let depth = 0;
  let child = node;
  while (child) {
    if (child === parentNode) {
      return depth;
    }

    child = child.parentNode;
    depth += 1;
  }

  return -1;
}
