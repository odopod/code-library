(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('tiny-emitter'), require('@odopod/odo-helpers'), require('@odopod/odo-device')) :
	typeof define === 'function' && define.amd ? define(['tiny-emitter', '@odopod/odo-helpers', '@odopod/odo-device'], factory) :
	(global.OdoDialog = factory(global.TinyEmitter,global.OdoHelpers,global.OdoDevice));
}(this, (function (TinyEmitter,odoHelpers,OdoDevice) { 'use strict';

TinyEmitter = TinyEmitter && TinyEmitter.hasOwnProperty('default') ? TinyEmitter['default'] : TinyEmitter;
OdoDevice = OdoDevice && OdoDevice.hasOwnProperty('default') ? OdoDevice['default'] : OdoDevice;

var babelHelpers = {};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



babelHelpers;

/**
 * @fileoverview Makes an overflowing element scrollable and handles preventing
 * default events and stopping event propagation when the scrollable element is
 * at the top or bottom of the scrollable area.
 *
 * @author Glen Cheney
 */

var body = document.body;

/**
 * Makes the element scrollable with some smart listeners because iOS
 * behaves unsatisfactory.
 * @param {Element} element Element to use.
 * @param {string} id Unique id.
 * @constructor
 */

var ScrollFix = function () {
  function ScrollFix(element, id) {
    classCallCheck(this, ScrollFix);

    this.element = element;
    this.id = id;
    this.startY = null;
    this.scrollY = null;
    this._createBoundEvents();
    this._registerEvents();
  }

  ScrollFix.prototype._createBoundEvents = function _createBoundEvents() {
    this._touchStartBound = this._onTouchStart.bind(this);
    this._touchMoveBound = this._onTouchMove.bind(this);
    this._preventDefaultBound = this._preventDefault.bind(this);
  };

  /**
   * Add event listeners.
   * @private
   */


  ScrollFix.prototype._registerEvents = function _registerEvents() {
    body.addEventListener('touchstart', this._touchStartBound);
    body.addEventListener('touchmove', this._touchMoveBound);
    document.addEventListener('touchmove', this._preventDefaultBound);
  };

  /**
   * Save positions when the touch starts.
   * @param {TouchEvent} evt Event object.
   * @private
   */


  ScrollFix.prototype._onTouchStart = function _onTouchStart(evt) {
    this.startY = evt.changedTouches[0].pageY;
    this.scrollY = this.element.scrollTop;
  };

  /**
   * When the touch move and touch start events get to the scrollable element,
   * prevent them from bubbling further.
   * @param {TouchEvent} evt Event object.
   * @private
   */


  ScrollFix.prototype._onTouchMove = function _onTouchMove(evt) {
    var deltaY = this.startY - evt.changedTouches[0].pageY;
    var scrollTop = this.scrollY + deltaY;

    // Prevent default stops all further touches...
    // the user must lift their finger and swipe again before drags in the
    // opposite direction register.
    // However, without this, the same thing occurs, but instead of no
    // scrolling, the page behind the dialog scrolls.
    if (scrollTop < 0 || scrollTop + this.element.offsetHeight > this.element.scrollHeight) {
      evt.preventDefault();
    } else {
      evt.stopPropagation();
    }
  };

  /**
   * Simply prevent the event's default action.
   * @param {TouchEvent} evt Event object.
   * @private
   */


  ScrollFix.prototype._preventDefault = function _preventDefault(evt) {
    evt.preventDefault();
  };

  /**
   * Dispose of this instance by removing handlers and DOM references.
   */


  ScrollFix.prototype.dispose = function dispose() {
    body.removeEventListener('touchstart', this._touchStartBound);
    body.removeEventListener('touchmove', this._touchMoveBound);
    document.removeEventListener('touchmove', this._preventDefaultBound);

    this.element = null;
    this.id = null;
  };

  return ScrollFix;
}();

var ScrollFix$1 = {
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
  add: function add(element) {
    if (OdoDevice.HAS_TOUCH_EVENTS) {
      var id = odoHelpers.string.random();
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
  remove: function remove(id) {
    if (this._fixes.has(id)) {
      this._fixes.get(id).dispose();
      this._fixes.delete(id);
    }
  }
};

/**
 * @fileoverview UI Component for universal dialogs.
 * Notes
 * * The transition is on the main `element` so that `scale()` transforms do not
 * cause the calculation of `scrollHeight` to be artificially increased.
 * * The backdrop is a sibling to the dialog so that it does not cover the
 * scrollbar of the dialog and so that it doesn't jitter in iOS.
 *
 * @author Glen Cheney <glen@odopod.com>
 */

var FOCUSABLE_ELEMENTS = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'].join(',');

/**
 * Dialog that can contain static images, carousels, or videos
 * @param {Element} element Main element.
 *
 * @constructor
 */

var Dialog = function (_TinyEmitter) {
  inherits(Dialog, _TinyEmitter);

  function Dialog(element, opts) {
    classCallCheck(this, Dialog);

    var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

    if (!(element instanceof Element)) {
      throw new TypeError('OdoDialog requires an element. Got: "' + element + '"');
    }

    /**
     * Base Element.
     * @type {Element}
     */
    _this.element = element;

    _this.options = Object.assign({}, Dialog.Defaults, opts);

    /**
     * Dialog Id.
     * @type {string}
     */
    _this.id = element.getAttribute('id');

    /**
     * Dialog backdrop
     * @type {Element}
     * @protected
     */
    _this.backdrop = document.createElement('div');
    _this.backdrop.className = Dialog.Classes.BACKDROP;

    /**
     * Dialog content (role=document).
     * @type {Element}
     * @protected
     */
    _this.content = _this.getByClass(Dialog.Classes.CONTENT);

    /**
     * Elements which, when clicked, close the dialog.
     * @type {Element}
     * @private
     */
    _this._closers = Array.from(_this.element.querySelectorAll('[data-odo-dialog-close]'));

    /**
     * Window resize Id
     * @type {string}
     * @private
     */
    _this._resizeId = null;

    /**
     * ScrollFix id
     * @type {?string}
     * @private
     */
    _this._scrollFixId = null;

    /**
     * Whether the dialog is open.
     * @type {boolean}
     */
    _this.isOpen = false;

    /**
     * Is the dialog currently animating.
     * @type {boolean}
     * @protected
     */
    _this.isAnimating = false;

    /**
     * Whether the body has a scrollbar.
     * @type {?boolean}
     * @private
     */
    _this._hasBodyScrollbar = null;

    /**
     * Padding on the body.
     * @type {number}
     * @private
     */
    _this._originalBodyPadding = -1;

    /**
     * Whether this is a fullscreen dialog. Fullscreen dialogs should not have
     * paddingRight applied to them.
     * @type {?boolean}
     * @private
     */
    _this._isFullscreen = null;

    Dialog.Instances.push(_this);

    if (Dialog.Instances.length === 1) {
      document.body.addEventListener('click', Dialog._handleTriggerClick);
    }

    // If this browser does not support auto margins for flexbox, add a class
    // so that it can be centered differently.
    _this.element.classList.toggle(Dialog.Classes.NO_AUTO_MARGIN, !Dialog.SUPPORTS_AUTO_MARGINS);

    _this._bindContexts();
    _this._addA11yAttributes();
    _this._ensureBodyChild();
    return _this;
  }

  /**
   * Find descendent element by class.
   * @param {string} name Name of the class to find.
   * @return {?Element} The element or undefined.
   */


  Dialog.prototype.getByClass = function getByClass(name) {
    return this.element.getElementsByClassName(name)[0];
  };

  /**
   * Bind `this` context to event handlers.
   */


  Dialog.prototype._bindContexts = function _bindContexts() {
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onClick = this.onClick.bind(this);
    this.close = this.close.bind(this);
  };

  /**
   * Add static accessibility attributes so that the implementor can leave them
   * off or in case they forget.
   */


  Dialog.prototype._addA11yAttributes = function _addA11yAttributes() {
    this.element.tabIndex = -1;
    this.element.setAttribute('aria-hidden', true);
    this.element.setAttribute('role', 'dialog');
    this.content.setAttribute('role', 'document');
  };

  /**
   * If the dialog element is not a direct descendent of the <body>, make it so.
   */


  Dialog.prototype._ensureBodyChild = function _ensureBodyChild() {
    if (this.element.parentNode !== document.body) {
      document.body.appendChild(this.element);
    }
  };

  /**
   * Determine the correct element to scroll fix and fix it.
   */


  Dialog.prototype._applyScrollFix = function _applyScrollFix() {
    // Allow the scrollable element to be something inside the dialog.
    if (this.options.scrollableElement) {
      var element = this.element.matches(this.options.scrollableElement) ? this.element : this.element.querySelector(this.options.scrollableElement);
      this._scrollFixId = ScrollFix$1.add(element);
    }
  };

  /**
   * If the page already has a scrollbar, adding overflow: hidden will remove it,
   * shifting the content to the right. To avoid this, there needs to be padding
   * on the body that's the same width as the scrollbar, but only when the dialog
   * will not have a scrollbar to take the page scrollbar's place.
   * @return {number}
   */


  Dialog.prototype._getScrollbarOffset = function _getScrollbarOffset() {
    var hasDialogScrollbar = this.element.scrollHeight > document.documentElement.clientHeight;
    return this._hasBodyScrollbar && !hasDialogScrollbar ? Dialog.SCROLLBAR_WIDTH : 0;
  };

  /**
   * Click handler on the main element. When the dialog is dismissable and the
   * user clicked outside the content (i.e. the backdrop), close it.
   * @param {Event} evt Event object.
   * @protected
   */


  Dialog.prototype.onClick = function onClick(evt) {
    if (this.options.dismissable && evt.target === this.element) {
      this.close();
    }
  };

  /**
   * Keypress event handler
   * @param {Event} evt Event object
   * @protected
   */


  Dialog.prototype.onKeyPress = function onKeyPress(evt) {
    // If 'ESC' is pressed, close the dialog
    if (this.options.dismissable && evt.which === Dialog.Keys.ESC) {
      this.close();
    }

    // If the TAB key is being pressed, make sure the focus stays trapped within
    // the dialog element.
    if (evt.which === Dialog.Keys.TAB) {
      Dialog._trapTabKey(this.element, evt);
    }
  };

  /**
   * Checks to see if a dialog is already open or animating If not, opens dialog.
   * @param {boolean} [sync=false] Whether to open with transitions or not.
   */


  Dialog.prototype.open = function open() {
    var _this2 = this;

    var sync = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (this.isAnimating || this.isOpen) {
      return;
    }

    Dialog.focusedBeforeDialog = document.activeElement;
    this._hasBodyScrollbar = document.body.clientWidth < window.innerWidth;
    this._isFullscreen = this.element.classList.contains(Dialog.Classes.FULLSCREEN);

    // Add aria-hidden to other top-level things.
    var siblings = Dialog._getSiblings(this.element);
    var originals = siblings.map(function (element) {
      return element.getAttribute('aria-hidden');
    });
    siblings.forEach(function (element, i) {
      if (originals[i]) {
        element.setAttribute('data-odo-dialog-original', originals[i]);
      }
      element.setAttribute('aria-hidden', true);
    });

    this.isOpen = true;
    this.element.removeAttribute('aria-hidden');
    this.element.classList.add(Dialog.Classes.OPEN);
    this.element.classList.add(Dialog.Classes.ENTER);
    if (Dialog.SCROLLBAR_WIDTH) {
      document.body.style.paddingRight = Dialog.SCROLLBAR_WIDTH + 'px';
    }
    document.body.classList.add(Dialog.Classes.BODY_OPEN);
    document.body.insertBefore(this.backdrop, this.element.nextSibling);
    this.element.scrollTop = 0;

    this._applyScrollFix();

    this.element.focus();

    document.addEventListener('keydown', this.onKeyPress);
    this.element.addEventListener('click', this.onClick);
    this._closers.forEach(function (element) {
      element.addEventListener('click', _this2.close);
    });

    if (sync === true) {
      this._openNext();
      this._opened();
    } else {
      Dialog._nextFrame(function () {
        _this2._openNext();
        odoHelpers.animation.onTransitionEnd(_this2.element, _this2._opened, _this2, null, 1000);
      });
    }
  };

  /**
   * Start the transition for opening the dialog.
   */


  Dialog.prototype._openNext = function _openNext() {
    this.isAnimating = true;
    // Now that the dialog is no longer display:none, the scrollHeight can be measured.
    var scrollbarOffset = this._getScrollbarOffset();
    if (!this._isFullscreen && scrollbarOffset > 0) {
      this.element.style.paddingRight = scrollbarOffset + 'px';
    }

    this.element.classList.remove(Dialog.Classes.ENTER);
    this.element.classList.add(Dialog.Classes.ENTERING);
  };

  /**
   * Handle the end of the open transition. Emits OPENED event.
   */


  Dialog.prototype._opened = function _opened() {
    this.element.classList.remove(Dialog.Classes.ENTERING);
    this.element.classList.add(Dialog.Classes.VISIBLE);
    this.isAnimating = false;
    this.emit(Dialog.EventType.OPENED);
  };

  /**
   * Hides dialog
   * @param {boolean} [sync=false] Whether to close with transitions or not.
   */


  Dialog.prototype.close = function close() {
    var _this3 = this;

    var sync = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (this.isAnimating || !this.isOpen) {
      return;
    }

    // Remove aria-hidden to other top-level things.
    var siblings = Dialog._getSiblings(this.element);
    var originals = siblings.map(function (element) {
      return element.getAttribute('data-odo-dialog-original');
    });
    siblings.forEach(function (element, i) {
      if (originals[i]) {
        element.setAttribute('aria-hidden', originals[i]);
        element.removeAttribute('data-odo-dialog-original');
      } else {
        element.removeAttribute('aria-hidden');
      }
    });

    this.isOpen = false;
    this.element.classList.add(Dialog.Classes.LEAVE);
    this.element.classList.remove(Dialog.Classes.VISIBLE);

    ScrollFix$1.remove(this._scrollFixId);

    if (Dialog.focusedBeforeDialog) {
      Dialog.focusedBeforeDialog.focus();
    }

    document.removeEventListener('keydown', this.onKeyPress);
    this.element.removeEventListener('click', this.onClick);
    this._closers.forEach(function (element) {
      element.removeEventListener('click', _this3.close);
    });

    if (sync === true) {
      this._closeNext();
      this._closed();
    } else {
      Dialog._nextFrame(function () {
        _this3._closeNext();
        odoHelpers.animation.onTransitionEnd(_this3.element, _this3._closed, _this3, null, 1000);
      });
    }
  };

  /**
   * Start the transition for closing the dialog.
   */


  Dialog.prototype._closeNext = function _closeNext() {
    this.isAnimating = true;
    this.element.classList.remove(Dialog.Classes.LEAVE);
    this.element.classList.add(Dialog.Classes.LEAVING);
  };

  /**
   * Handle the end of the close transition. Emits the CLOSED event.
   */


  Dialog.prototype._closed = function _closed() {
    this.isAnimating = false;
    this.element.style.paddingRight = '';
    this.element.setAttribute('aria-hidden', true);
    this.element.classList.remove(Dialog.Classes.OPEN);
    this.element.classList.remove(Dialog.Classes.LEAVING);
    document.body.style.paddingRight = '';
    document.body.classList.remove(Dialog.Classes.BODY_OPEN);
    document.body.removeChild(this.backdrop);
    this.emit(Dialog.EventType.CLOSED);
  };

  /**
   * Disposes of global Dialog variables
   * @public
   */


  Dialog.prototype.dispose = function dispose() {
    if (this.isOpen) {
      this.close(true);
    }

    this.element = null;
    this.content = null;
    this.backdrop = null;
    this._closers.length = 0;

    odoHelpers.array.remove(Dialog.Instances, this);

    // If this is the last dialog (being disposed), remove the body listener.
    if (Dialog.Instances.length === 0) {
      document.body.removeEventListener('click', Dialog._handleTriggerClick);
    }
  };

  /**
   * Call a function after two animation frames. Using just one is unreliable
   * when using animations to/from display:none elements or ones that are not
   * yet in the DOM.
   * @param {function} fn Function to call on the next frame.
   */


  Dialog._nextFrame = function _nextFrame(fn) {
    window.requestAnimationFrame(window.requestAnimationFrame.bind(null, fn));
  };

  /**
   * Open the correct dialog when an element with `data-odo-dialog-open` attribute
   * is clicked.
   * @param {Event} evt Event object.
   */


  Dialog._handleTriggerClick = function _handleTriggerClick(evt) {
    var elem = evt.target.closest('[data-odo-dialog-open]');

    if (elem !== null) {
      evt.preventDefault();
      var id = elem.getAttribute('data-odo-dialog-open');
      Dialog.getDialogById(id).open();
    }
  };

  /**
   * Trap the focus inside the given element.
   * @param {Element} node
   * @param {Event} evt
   */


  Dialog._trapTabKey = function _trapTabKey(node, evt) {
    var focusableChildren = Dialog._getFocusableChildren(node);
    var focusedItemIndex = focusableChildren.indexOf(document.activeElement);

    // If the SHIFT key is being pressed while tabbing (moving backwards) and
    // the currently focused item is the first one, move the focus to the last
    // focusable item from the dialog element
    if (evt.shiftKey && focusedItemIndex === 0) {
      focusableChildren[focusableChildren.length - 1].focus();
      evt.preventDefault();
      // If the SHIFT key is not being pressed (moving forwards) and the currently
      // focused item is the last one, move the focus to the first focusable item
      // from the dialog element
    } else if (!evt.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
      focusableChildren[0].focus();
      evt.preventDefault();
    }
  };

  /**
   * Get the focusable children of the given element.
   * @param {Element} element
   * @return {Array.<Element>}
   */


  Dialog._getFocusableChildren = function _getFocusableChildren(element) {
    return Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS)).filter(Dialog._isVisibleElement);
  };

  /**
   * Whether an element is visible (and therefore can receive focus). Uses
   * `getClientRects` due to this issue:
   * https://github.com/jquery/jquery/issues/2227
   * http://jsfiddle.net/2tgw2yr3/
   * @param {Element} el Element.
   * @return {boolean}
   */


  Dialog._isVisibleElement = function _isVisibleElement(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  };

  /**
   * Retrieve the siblings of an element.
   * @param {Element} element Element to get siblings for.
   * @return {Array.<Element>}
   */


  Dialog._getSiblings = function _getSiblings(element) {
    var children = Array.from(element.parentNode.children);
    var ignore = ['script', 'link', 'meta'];
    return children.filter(function (node) {
      return node !== element && !ignore.includes(node.nodeName.toLowerCase());
    });
  };

  /**
   * Calculate the width of the scrollbar because when the body has overflow:hidden,
   * the scrollbar disappears.
   * https://davidwalsh.name/detect-scrollbar-width
   * @return {number}
   */


  Dialog._getScrollbarWidth = function _getScrollbarWidth() {
    // Create measurement node.
    var scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width:50px;height:50px;overflow:scroll;position:absolute;top:-9999px;';
    document.body.appendChild(scrollDiv);

    // Calculate the scrollbar width.
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    // Remove test element.
    document.body.removeChild(scrollDiv);

    return scrollbarWidth;
  };

  /**
   * Unfortunately, the auto margins do not work for flex children in IE11 and
   * below because the content element does have an explicit height set on it.
   * @return {boolean}
   */


  Dialog._autoMarginTest = function _autoMarginTest() {
    var parent = document.createElement('div');
    var child = document.createElement('div');
    parent.style.cssText = 'display:flex;height:50px;width:50px;position:absolute;';
    child.style.cssText = 'margin:auto;';
    child.innerHTML = 'a';
    parent.appendChild(child);
    document.body.appendChild(parent);

    var ret = child.offsetTop > 0;
    document.body.removeChild(parent);

    return ret;
  };

  /**
   * Instantiates all instances of dialogs with the same settings
   * @param {Object} options Object of all dialog options. Is optional.
   * @return {Array.<Dialog>}
   * @public
   */


  Dialog.initializeAll = function initializeAll(options) {
    Dialog.disposeAll();

    return Array.from(document.querySelectorAll('.' + Dialog.Classes.BASE)).map(function (dialog) {
      return new Dialog(dialog, options);
    });
  };

  /**
   * Clear all references to dialogs so there are no duplicates
   * @param {Object} options Object of all dialog options. Is optional.
   * @public
   */


  Dialog.disposeAll = function disposeAll() {
    var clone = Dialog.Instances.slice();
    clone.forEach(function (dialog) {
      dialog.dispose();
    });
  };

  /**
   * Retrieve a dialog instance by its id.
   * @param {string} id Id of the dialog.
   * @return {?Dialog} The dialog or undefined if there is no dialog with the given id.
   */


  Dialog.getDialogById = function getDialogById(id) {
    return Dialog.Instances.find(function (instance) {
      return instance.id === id;
    });
  };

  return Dialog;
}(TinyEmitter);

/** @enum {string} */


Dialog.Classes = {
  BODY_OPEN: 'odo-dialog-open',
  BASE: 'odo-dialog',
  OPEN: 'odo-dialog--open',
  ENTER: 'odo-dialog--enter',
  ENTERING: 'odo-dialog--enter-active',
  LEAVE: 'odo-dialog--leave',
  LEAVING: 'odo-dialog--leave-active',
  VISIBLE: 'odo-dialog--visible',
  FULLSCREEN: 'odo-dialog--full',
  NO_AUTO_MARGIN: 'odo-dialog--no-auto-margin',
  BACKDROP: 'odo-dialog-backdrop',
  CONTENT: 'odo-dialog__content'
};

/** @enum {string} */
Dialog.EventType = {
  OPENED: 'ododialog:open',
  CLOSED: 'ododialog:closed'
};

/** @enum {number} */
Dialog.Keys = {
  ESC: 27,
  TAB: 9
};

/** @type {!Object} */
Dialog.Defaults = {
  dismissable: true,
  scrollableElement: '.odo-dialog'
};

/** @enum {Array} */
Dialog.Instances = [];

Dialog.ScrollFix = ScrollFix$1;

/**
 * Element which had focus before the dialog opened.
 * @type {Element}
 */
Dialog.focusedBeforeDialog = null;

Dialog.SUPPORTS_AUTO_MARGINS = Dialog._autoMarginTest();
Dialog.SCROLLBAR_WIDTH = Dialog._getScrollbarWidth();

return Dialog;

})));
//# sourceMappingURL=odo-dialog.js.map
