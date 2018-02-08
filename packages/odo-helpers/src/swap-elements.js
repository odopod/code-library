/**
 * Swaps element1 with element2 in the DOM.
 * @param {Element} elm1 first element.
 * @param {Element} elm2 second element.
 */
export default function swapElements(elm1, elm2) {
  if (!elm1 || !elm2) {
    return;
  }

  const parent1 = elm1.parentNode;
  const next1 = elm1.nextSibling;
  const parent2 = elm2.parentNode;
  const next2 = elm2.nextSibling;

  parent1.insertBefore(elm2, next1);
  parent2.insertBefore(elm1, next2);
}
