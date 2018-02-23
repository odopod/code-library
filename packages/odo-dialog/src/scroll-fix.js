/**
 * @fileoverview Makes an overflowing element scrollable and handles preventing
 * default events and stopping event propagation when the scrollable element is
 * at the top or bottom of the scrollable area.
 *
 * @author Glen Cheney <glen@odopod.com>
 */

import { randomString } from '@odopod/odo-helpers';
import OdoDevice from '@odopod/odo-device';

/**
 * Makes the element scrollable with some smart listeners because iOS
 * behaves unsatisfactory.
 * @param {Element} element Element to use.
 * @param {string} id Unique id.
 * @constructor
 */
class ScrollFix {
  constructor(element, id) {
    this.element = element;
    this.id = id;
    this.startY = null;
    this.scrollY = null;
    this._createBoundEvents();
    this._registerEvents();
  }

  _createBoundEvents() {
    this._touchStartBound = this._onTouchStart.bind(this);
    this._touchMoveBound = this._onTouchMove.bind(this);
    this._preventDefaultBound = this._preventDefault.bind(this);
  }

  /**
   * Add event listeners.
   * @private
   */
  _registerEvents() {
    document.body.addEventListener('touchstart', this._touchStartBound);
    document.body.addEventListener('touchmove', this._touchMoveBound);
    document.addEventListener('touchmove', this._preventDefaultBound);
  }

  /**
   * Save positions when the touch starts.
   * @param {TouchEvent} evt Event object.
   * @private
   */
  _onTouchStart(evt) {
    this.startY = evt.changedTouches[0].pageY;
    this.scrollY = this.element.scrollTop;
  }

  /**
   * When the touch move and touch start events get to the scrollable element,
   * prevent them from bubbling further.
   * @param {TouchEvent} evt Event object.
   * @private
   */
  _onTouchMove(evt) {
    const deltaY = this.startY - evt.changedTouches[0].pageY;
    const scrollTop = this.scrollY + deltaY;

    // Prevent default stops all further touches...
    // the user must lift their finger and swipe again before drags in the
    // opposite direction register.
    // However, without this, the same thing occurs, but instead of no
    // scrolling, the page behind the dialog scrolls.
    if (scrollTop < 0 || scrollTop + this.element.offsetHeight >
        this.element.scrollHeight) {
      evt.preventDefault();
    } else {
      evt.stopPropagation();
    }
  }

  /**
   * Simply prevent the event's default action.
   * @param {TouchEvent} evt Event object.
   * @private
   */
  _preventDefault(evt) {
    evt.preventDefault();
  }

  /**
   * Dispose of this instance by removing handlers and DOM references.
   */
  dispose() {
    document.body.removeEventListener('touchstart', this._touchStartBound);
    document.body.removeEventListener('touchmove', this._touchMoveBound);
    document.removeEventListener('touchmove', this._preventDefaultBound);

    this.element = null;
    this.id = null;
  }
}

export default {
  /**
   * Dictionary of ScrollFix instances.
   * @type {Object.<string, ScrollFix>}
   * @private
   */
  _fixes: new Map(),

  /**
   * Enable an element to be scrollable.
   * @param {Element} element Element to make scrollable.
   * @return {string} Id which is used to remove it.
   */
  add(element) {
    if (OdoDevice.HAS_TOUCH_EVENTS) {
      const id = randomString();
      this._fixes.set(id, new ScrollFix(element, id));
      return id;
    }

    return '';
  },

  /**
   * Disable scrolling on an element and remove event listeners. Be aware
   * that this removes the scroll fix class. If your element doesn't have
   * the overflow-scrolling: touch property on it, iOS may flicker the whole
   * container when calling this method.
   * @param {string} id Id returned from enable.
   */
  remove(id) {
    if (this._fixes.has(id)) {
      this._fixes.get(id).dispose();
      this._fixes.delete(id);
    }
  },
};
