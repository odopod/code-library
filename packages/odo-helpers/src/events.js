import OdoDevice from '@odopod/odo-device';

/**
 * Returns the prefixed or unprefixed pointer event name or null if not pointer events.
 * @param {string} event The event name. e.g. "pointerdown".
 * @return {?string} The event name or null.
 */
function getPointerEvent(event) {
  /* istanbul ignore else */
  if (OdoDevice.HAS_POINTER_EVENTS) {
    return event;
  }

  /* istanbul ignore next */
  return null;
}

/**
 * Returns a normalized transition end event name.
 *
 * Issue with Modernizr prefixing related to stock Android 4.1.2
 * That version of Android has both unprefixed and prefixed transitions
 * built in, but will only listen to the prefixed on in certain cases
 * https://github.com/Modernizr/Modernizr/issues/897
 *
 * @return {string} A patched transition end event name.
 */
function getTransitionEndEvent() {
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
}

/**
 * Returns a normalized animation end event name.
 * @return {string}
 */
function getAnimationEndEvent() {
  return {
    WebkitAnimation: 'webkitAnimationEnd',
    animation: 'animationend',
  }[OdoDevice.Dom.ANIMATION];
}

const events = {
  // Mouse events
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',

  // IE, Safari, Chrome
  SELECTSTART: 'selectstart',

  // Key events
  KEYPRESS: 'keypress',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',

  // Focus
  BLUR: 'blur',
  FOCUS: 'focus',

  // IE only
  DEACTIVATE: 'deactivate',

  FOCUSIN: 'focusin',
  FOCUSOUT: 'focusout',

  // Forms
  CHANGE: 'change',
  SELECT: 'select',
  SUBMIT: 'submit',
  INPUT: 'input',

  // IE only
  PROPERTYCHANGE: 'propertychange',

  // Drag and drop
  DRAGSTART: 'dragstart',
  DRAG: 'drag',
  DRAGENTER: 'dragenter',
  DRAGOVER: 'dragover',
  DRAGLEAVE: 'dragleave',
  DROP: 'drop',
  DRAGEND: 'dragend',

  // WebKit touch events.
  TOUCHSTART: 'touchstart',
  TOUCHMOVE: 'touchmove',
  TOUCHEND: 'touchend',
  TOUCHCANCEL: 'touchcancel',

  // Misc
  BEFOREUNLOAD: 'beforeunload',
  CONTEXTMENU: 'contextmenu',
  ERROR: 'error',
  HELP: 'help',
  LOAD: 'load',
  LOSECAPTURE: 'losecapture',
  READYSTATECHANGE: 'readystatechange',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  UNLOAD: 'unload',

  // HTML 5 History events
  // See http://www.w3.org/TR/html5/history.html#event-definitions
  HASHCHANGE: 'hashchange',
  PAGEHIDE: 'pagehide',
  PAGESHOW: 'pageshow',
  POPSTATE: 'popstate',

  // Copy and Paste
  // Support is limited. Make sure it works on your favorite browser
  // before using.
  // http://www.quirksmode.org/dom/events/cutcopypaste.html
  COPY: 'copy',
  PASTE: 'paste',
  CUT: 'cut',
  BEFORECOPY: 'beforecopy',
  BEFORECUT: 'beforecut',
  BEFOREPASTE: 'beforepaste',

  // HTML5 online/offline events.
  // http://www.w3.org/TR/offline-webapps/#related
  ONLINE: 'online',
  OFFLINE: 'offline',

  // HTML 5 worker events
  MESSAGE: 'message',
  CONNECT: 'connect',

  // Css transition events.
  TRANSITIONEND: getTransitionEndEvent(),

  ANIMATIONEND: getAnimationEndEvent(),

  // Pointer events
  POINTERCANCEL: getPointerEvent('pointercancel'),
  POINTERDOWN: getPointerEvent('pointerdown'),
  POINTERMOVE: getPointerEvent('pointermove'),
  POINTEROVER: getPointerEvent('pointerover'),
  POINTEROUT: getPointerEvent('pointerout'),
  POINTERUP: getPointerEvent('pointerup'),
};

export default events;
