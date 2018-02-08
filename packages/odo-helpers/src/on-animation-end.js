import OdoDevice from '@odopod/odo-device';
import events from './events';
import {
  getElement,
  getFakeEvent,
  isOwnEvent,
} from './_animation-utils';

/**
 * Execute a callback when a css animation finishes.
 * @param {Element} elem The element which as an animation on it.
 * @param {Function} fn Callback function
 * @param {Object} [context=window] Optional context for the callback.
 */
export default function onAnimationEnd(elem, fn, context = window) {
  const element = getElement(elem);

  const callback = fn.bind(context);

  function animationEnded(evt) {
    // Ensure the `animationend` event was from the element specified.
    // Difficult to test without tracking callbacks.
    /* istanbul ignore next */
    if (!isOwnEvent(evt)) {
      return;
    }

    // Remove the listener if it was bound.
    if (OdoDevice.HAS_CSS_ANIMATIONS) {
      evt.currentTarget.removeEventListener(events.ANIMATIONEND, animationEnded);
    }

    callback(evt);
  }

  if (OdoDevice.HAS_CSS_ANIMATIONS) {
    element.addEventListener(events.ANIMATIONEND, animationEnded);
  } else {
    // Callback is expected to be async, so push it to the end of the queue.
    setTimeout(() => {
      animationEnded(getFakeEvent(element));
    }, 0);
  }
}
