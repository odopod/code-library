import isDefined from './is-defined';

const transitions = {};
let transitionId = 0;

/**
 * Store a pending transition.
 * @param {HTMLElement} element Element which has the transitionend listener.
 * @param {number} timerId Timer id from setTimeout to cancel the transition.
 * @param {(evt: TransitionEvent) => void} listener Callback.
 * @return {number} Transition id.
 */
export function saveTransition(element, timerId, listener) {
  transitionId += 1;
  transitions[transitionId] = {
    element,
    timerId,
    listener,
  };
  return transitionId;
}

/**
 * Remove a transition id from the stored list.
 * @param {number} transitionId Transition id to remove.
 */
export function clearTransition(transitionId) {
  delete transitions[transitionId];
}

/**
 * Retrieve a transition object.
 * @param {number} transitionId Transition id to retrieve.
 * @return {{element: HTMLElement, timerId: number, listener: (evt: TransitionEvent) => void}}
 *   Transition object.
 */
export function getTransition(transitionId) {
  return transitions[transitionId];
}

/**
 * Retrieve all transition objects.
 * @return {object}
 */
export function getTransitions() {
  return transitions;
}

/**
 * Returns the element when the first parameter is a jQuery collection.
 * @param {HTMLElement|jQuery} elem An element or a jQuery collection.
 * @return {HTMLElement}
 * @throws {Error} If it's a jQuery collection of more than one element.
 */
export function getElement(elem) {
  if (elem.jquery) {
    if (elem.length > 1) {
      throw new TypeError('This method only supports transition end for one element, not a collection');
    }

    return elem[0];
  }

  return elem;
}

export function isOwnEvent(event) {
  return event.target === event.currentTarget;
}

export function isSameTransitionProperty(event, prop) {
  return event.fake || !isDefined(prop) || event.propertyName === prop;
}

export function getFakeEvent(elem) {
  return {
    target: elem,
    currentTarget: elem,
    fake: true,
  };
}
