import OdoDevice from '@odopod/odo-device';
import events from './events';
import { clearTransition, getTransition } from './_animation-utils';

/**
 * Remove the event listener for `transitionend`.
 * @param {number} id The number returned by `onTransitionEnd`.
 * @return {boolean} Whether the transition was canceled or not. If the transition
 *     already finished, this method will return false.
 */
export default function cancelTransitionEnd(id) {
  const obj = getTransition(id);

  if (obj) {
    clearTimeout(obj.timerId);

    if (OdoDevice.HAS_TRANSITIONS) {
      obj.element.removeEventListener(events.TRANSITIONEND, obj.listener);
    }

    clearTransition(id);
    return true;
  }
  return false;
}
