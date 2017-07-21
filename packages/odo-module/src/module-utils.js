/**
 * Utilities for the Odo Module component.
 *
 * @author Nathan Buchar <nathan@odopod.com>
 */

/**
 * If the first parameter is not an array, return an array containing the
 * first parameter.
 *
 * @author Glen Cheney <glen@odopod.com>
 * @param {*} thing - Anything.
 * @returns {Array.<*>} Array of things.
 */
export function arrayify(thing) {
  if (Array.isArray(thing)) {
    return thing;
  }

  if (typeof thing.length === 'number') {
    return Array.from(thing);
  }

  return [thing];
}

/**
 * Determine if the given item is an HTMLElement. Adapted from
 * {@link http://stackoverflow.com/a/36894871/373422}
 *
 * @param {*} thing - Anything.
 * @returns {boolean}
 */
export function isHTMLElement(thing) {
  return thing instanceof Element;
}
