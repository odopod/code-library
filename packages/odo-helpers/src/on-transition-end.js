import OdoDevice from '@odopod/odo-device';
import events from './events';
import {
  clearTransition,
  getElement,
  getFakeEvent,
  isOwnEvent,
  isSameTransitionProperty,
  saveTransition,
} from './_animation-utils';

export default function onTransitionEnd(
  elem,
  fn,
  context = window,
  property = null,
  timeout = null,
) {
  const element = getElement(elem);

  const callback = fn.bind(context);
  let timerId;

  /**
   * @param {TransitionEvent|{target: Element, currentTarget: Element}} evt Event object.
   */

  function transitionEnded(evt) {
    // Some other element's transition event could have bubbled up to this.
    // or
    // If the optional property exists and it's not the property which was
    // transitioned, exit out of the function and continue waiting for the
    // right transition property.
    if (!isOwnEvent(evt) || !isSameTransitionProperty(evt, property)) {
      return;
    }

    // Remove from active transitions.
    clearTransition(transitionId); // eslint-disable-line no-use-before-define

    // If the browser has transitions, there will be a listener bound to the
    // `transitionend` event which needs to be removed.
    if (OdoDevice.HAS_TRANSITIONS) {
      evt.currentTarget.removeEventListener(events.TRANSITIONEND, transitionEnded);
    }

    // Done!
    callback(evt);
    clearTimeout(timerId);
  }

  if (OdoDevice.HAS_TRANSITIONS) {
    element.addEventListener(events.TRANSITIONEND, transitionEnded);

    // Sometimes the transition end event doesn't fire, usually when
    // properties don't change or when iOS decides to just snap instead of
    // transition. To get around this, a timer is set which will trigger the
    // fake event.
    if (timeout) {
      timerId = setTimeout(() => {
        transitionEnded(getFakeEvent(element));
      }, timeout);
    }
  } else {
    // Push to the end of the queue with a fake event which will pass the checks
    // inside the callback function.
    timerId = setTimeout(() => {
      transitionEnded(getFakeEvent(element));
    }, 0);
  }

  // Save this active transition end listener so it can be canceled.
  const transitionId = saveTransition(element, timerId, transitionEnded);

  // Return id used to cancel the transition end listener, similar to setTimeout
  // and requestAnimationFrame.
  return transitionId;
}
