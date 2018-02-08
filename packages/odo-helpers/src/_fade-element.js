import noop from './noop';
import Classes from './animation-classes';
import {
  getElement,
  getFakeEvent,
} from './_animation-utils';
import onTransitionEnd from './on-transition-end';

/**
 * Fade out an element and then set visibilty hidden on it.
 * @param {Element} elem Element to fade.
 * @param {boolean} [isOut] Whether to fade out or in.
 * @param {Function} [fn=noop] Callback function when faded out.
 * @param {Window|HTMLElement} [context=window] Context for the callback.
 * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
 *     element once it has faded out. Defaults to false.
 * @return {number} id used to cancel the transition end listener.
 */
export default function fadeElement(
  elem,
  isOut,
  fn = noop,
  context = window,
  invisible = false,
) {
  const element = getElement(elem);

  // Bind the context to the callback here so that the context and function
  // references can be garbage collected and the only things left are `callback`
  // and `invisible`.
  const callback = fn.bind(context);

  // Make sure the transition will actually happen.
  // isIn and has `in` and `fade` classes or
  // isIn but doesn't have `fade` or
  // isOut and has `fade`, but doesn't have `in` class.
  const hasIn = element.classList.contains(Classes.IN);
  const hasFade = element.classList.contains(Classes.FADE);
  if ((!isOut && hasIn && hasFade) ||
    (!isOut && !hasFade) ||
    (isOut && !hasIn && hasFade)) {
    const fakeEvent = getFakeEvent(element);

    // This is expected to be async.
    setTimeout(() => {
      callback(fakeEvent);
    }, 0);

    return 0;
  }

  /**
   * Internal callback when the element has finished its transition.
   * @param {{target: Element, currentTarget: Element}}
   *     evt Event object.
   */
  function faded(evt) {
    // Element has faded out, add invisible class.
    if (isOut && invisible) {
      evt.currentTarget.classList.add(Classes.INVISIBLE);
    }

    callback(evt);
  }

  // Fading in, remove invisible class.
  if (!isOut && invisible) {
    elem.classList.remove(Classes.INVISIBLE);
  }

  // Make sure it has the "fade" class. It won't do anything if it already does.
  elem.classList.add(Classes.FADE);

  // Remove (or add) the "in" class which triggers the transition.
  // If the element had neither of these classes, adding the "fade" class
  // will trigger the transition.
  elem.classList.toggle(Classes.IN, !isOut);

  return onTransitionEnd(elem, faded, null, 'opacity');
}
