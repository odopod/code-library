import OdoDevice from '@odopod/odo-device';

const device = {

  /**
   * Returns the prefixed or unprefixed pointer event name or null if not pointer events.
   * @param {string} event The event name. e.g. "pointerdown".
   * @return {?string} The event name or null.
   */
  getPointerEvent(event) {
    if (OdoDevice.HAS_POINTER_EVENTS) {
      return event;
    }

    return null;
  },

  /**
   * Returns a normalized transition end event name.
   *
   * Issue with Modernizr prefixing related to stock Android 4.1.2
   * That version of Android has both unprefixed and prefixed transitions
   * built in, but will only listen to the prefixed on in certain cases
   * https://github.com/Modernizr/Modernizr/issues/897
   *
   * @param {string} transitionend The current transition end event name.
   * @return {string} A patched transition end event name.
   */
  getTransitionEndEvent() {
    const div = document.createElement('div');
    div.style.transitionProperty = 'width';

    // Test the value which was just set. If it wasn't able to be set,
    // then it shouldn't use unprefixed transitions.
    /* istanbul ignore next */
    if (div.style.transitionProperty !== 'width' && 'webkitTransition' in div.style) {
      return 'webkitTransitionEnd';
    }

    return {
      // Saf < 7, Android Browser < 4.4
      WebkitTransition: 'webkitTransitionEnd',
      transition: 'transitionend',
    }[OdoDevice.Dom.TRANSITION];
  },

  /**
   * Returns a normalized animation end event name.
   * @return {string}
   */
  getAnimationEndEvent() {
    return {
      WebkitAnimation: 'webkitAnimationEnd',
      animation: 'animationend',
    }[OdoDevice.Dom.ANIMATION];
  },

  /**
   * Returns a string to be used with transforms.
   * @param {string=} x The x position value with units. Default is zero.
   * @param {string=} y The y position value with units. Default is zero.
   * @return {string} The css value for transform.
   */
  getTranslate(x = 0, y = 0) {
    return `translate(${x},${y})`;
  },
};

export default device;
