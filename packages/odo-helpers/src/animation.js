import OdoDevice from '@odopod/odo-device';

import Stepper from './animation-stepper';
import utilities from './utilities';
import events from './events';

const animation = {
  Stepper,

  scrollTo(position = 0, duration = 400, callback = utilities.noop, easing = undefined) {
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

    const anim = new animation.Stepper(options);
    anim.onfinish = callback;
  },

  /**
   * Fade in an element and optionally add a class which sets visibility
   * to hidden.
   * @param {Element} elem Element to fade.
   * @param {Function} [fn=noop] Callback function when faded out.
   * @param {Object} [context=window] Context for the callback.
   * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
   *     element once it has faded. Defaults to false.
   */
  fadeOutElement(elem, fn, context, invisible) {
    return animation.fadeElement(elem, fn, context, invisible, true);
  },

  /**
   * Fade in an element and optionally remove a class which sets visibility
   * to hidden.
   * @param {Element} elem Element to fade.
   * @param {Function} [fn=noop] Callback function when faded out.
   * @param {Object} [context=window] Context for the callback.
   * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
   *     element once it has faded. Defaults to false.
   */
  fadeInElement(elem, fn, context, invisible) {
    return animation.fadeElement(elem, fn, context, invisible, false);
  },

  /**
   * Fade out an element and then set visibilty hidden on it.
   * @param {Element} elem Element to fade.
   * @param {Function} [fn=noop] Callback function when faded out.
   * @param {Object} [context=window] Context for the callback.
   * @param {boolean} [invisible=false] Whether to add visibility:hidden to the
   *     element once it has faded out. Defaults to false.
   * @param {boolean} [isOut=true] Whether to fade out or in. Defaults true.
   * @return {number} id used to cancel the transition end listener.
   */
  fadeElement(elem, fn = utilities.noop, context = window, invisible = false, isOut = true) {
    const element = animation._getElement(elem);

    // Bind the context to the callback here so that the context and function
    // references can be garbage collected and the only things left are `callback`
    // and `invisible`.
    const callback = fn.bind(context);

    // Make sure the transition will actually happen.
    // isIn and has `in` and `fade` classes or
    // isIn but doesn't have `fade` or
    // isOut and has `fade`, but doesn't have `in` class.
    const hasIn = element.classList.contains(animation.Classes.IN);
    const hasFade = element.classList.contains(animation.Classes.FADE);
    if ((!isOut && hasIn && hasFade) ||
        (!isOut && !hasFade) ||
        (isOut && !hasIn && hasFade)) {
      const fakeEvent = animation._getFakeEvent(element);

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
        evt.currentTarget.classList.add(animation.Classes.INVISIBLE);
      }

      callback(evt);
    }

    // Fading in, remove invisible class.
    if (!isOut && invisible) {
      elem.classList.remove(animation.Classes.INVISIBLE);
    }

    // Make sure it has the "fade" class. It won't do anything if it already does.
    elem.classList.add(animation.Classes.FADE);

    // Remove (or add) the "in" class which triggers the transition.
    // If the element had neither of these classes, adding the "fade" class
    // will trigger the transition.
    elem.classList.toggle(animation.Classes.IN, !isOut);

    return animation.onTransitionEnd(elem, faded, null, 'opacity');
  },

  /**
   * Returns the element when the first parameter is a jQuery collection.
   * @param {Element|jQuery} elem An element or a jQuery collection.
   * @return {Element}
   * @throws {Error} If it's a jQuery collection of more than one element.
   */
  _getElement(elem) {
    if (elem.jquery) {
      if (elem.length > 1) {
        throw new TypeError('This method only supports transition end for one ' +
           'element, not a collection');
      }

      return elem[0];
    }

    return elem;
  },

  _isOwnEvent(event) {
    return event.target === event.currentTarget;
  },

  _isSameTransitionProperty(event, prop) {
    return event.fake || !utilities.isDefined(prop) || event.propertyName === prop;
  },

  _getFakeEvent(elem) {
    return {
      target: elem,
      currentTarget: elem,
      fake: true,
    };
  },

  onTransitionEnd(elem, fn, context = window, property = null, timeout = null) {
    const element = animation._getElement(elem);

    const callback = fn.bind(context);
    animation._transitionId += 1;
    const transitionId = animation._transitionId;
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
      if (!animation._isOwnEvent(evt) || !animation._isSameTransitionProperty(evt, property)) {
        return;
      }

      // Remove from active transitions.
      delete animation._transitions[transitionId];

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
          transitionEnded(animation._getFakeEvent(element));
        }, timeout);
      }
    } else {
      // Push to the end of the queue with a fake event which will pass the checks
      // inside the callback function.
      timerId = setTimeout(() => {
        transitionEnded(animation._getFakeEvent(element));
      }, 0);
    }

    // Save this active transition end listener so it can be canceled.
    animation._transitions[transitionId] = {
      element,
      timerId,
      listener: transitionEnded,
    };

    // Return id used to cancel the transition end listener, similar to setTimeout
    // and requestAnimationFrame.
    return transitionId;
  },

  /**
   * Remove the event listener for `transitionend`.
   * @param {number} id The number returned by `onTransitionEnd`.
   * @return {boolean} Whether the transition was canceled or not. If the transition
   *     already finished, this method will return false.
   */
  cancelTransitionEnd(id) {
    const obj = this._transitions[id];

    if (obj) {
      clearTimeout(obj.timerId);

      if (OdoDevice.HAS_TRANSITIONS) {
        obj.element.removeEventListener(events.TRANSITIONEND, obj.listener);
      }

      delete this._transitions[id];
      return true;
    }
    return false;
  },

  /**
   * Execute a callback when a css animation finishes.
   * @param {Element} elem The element which as an animation on it.
   * @param {Function} fn Callback function
   * @param {Object} [context=window] Optional context for the callback.
   */
  onAnimationEnd(elem, fn, context = window) {
    const element = animation._getElement(elem);

    const callback = fn.bind(context);

    function animationEnded(evt) {
      // Ensure the `animationend` event was from the element specified.
      // Difficult to test without tracking callbacks.
      /* istanbul ignore next */
      if (!animation._isOwnEvent(evt)) {
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
        animationEnded(animation._getFakeEvent(element));
      }, 0);
    }
  },
};

animation.scrollToTop = animation.scrollTo;

animation.Classes = {
  FADE: 'fade',
  IN: 'in',
  INVISIBLE: 'invisible',
};

animation._transitions = {};
animation._transitionId = 0;

export default animation;
