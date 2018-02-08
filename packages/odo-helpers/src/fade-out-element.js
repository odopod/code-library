import fadeElement from './_fade-element';

/**
 * Fade in an element and optionally add a class which sets visibility
 * to hidden.
 * @param {Element} elem Element to fade.
 * @param {Function} [fn=noop] Callback function when faded out.
 * @param {Window|HTMLElement} [context=window] Context for the callback.
 * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
 *     element once it has faded. Defaults to false.
 */
export default function fadeOutElement(elem, fn, context, invisible) {
  return fadeElement(elem, true, fn, context, invisible);
}
