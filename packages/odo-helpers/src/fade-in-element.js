import fadeElement from './_fade-element';

/**
 * Fade in an element and optionally remove a class which sets visibility
 * to hidden.
 * @param {Element} elem Element to fade.
 * @param {Function} [fn=noop] Callback function when faded out.
 * @param {Window|HTMLElement} [context=window] Context for the callback.
 * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
 *     element once it has faded. Defaults to false.
 */
export default function fadeInElement(elem, fn, context, invisible) {
  return fadeElement(elem, false, fn, context, invisible);
}
