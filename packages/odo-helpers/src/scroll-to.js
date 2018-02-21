import noop from './noop';
import Stepper from './animation-stepper';

/**
 * Scroll the page to a destination.
 * @param {number} [position] End scroll position.
 * @param {number} [duration] Duration in milliseconds.
 * @param {function:void} [callback] Optional callback.
 * @param {function(number):number} [easing] Easing function.
 */
export default function scrollTo(
  position = 0,
  duration = 400,
  callback = noop,
  easing = undefined,
) {
  const options = {
    start: window.pageYOffset,
    end: position,
    duration,
    step(scrollTop) {
      window.scrollTo(0, scrollTop);
    },
  };

  // Avoid setting `easing` to `undefined`.
  if (typeof easing === 'function') {
    options.easing = easing;
  }

  const anim = new Stepper(options);
  anim.onfinish = callback;
  return anim;
}
