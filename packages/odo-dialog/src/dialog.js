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

import TinyEmitter from 'tiny-emitter';
import { pull, onTransitionEnd } from '@odopod/odo-helpers';
import ScrollFix from './scroll-fix';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
].join(',');

class Dialog extends TinyEmitter {
  /**
   * Dialog that can contain static images, carousels, or videos
   * @param {Element} element Main element.
   * @param {object} [opts] Instance options.
   * @constructor
   */
  constructor(element, opts) {
    super();

    if (!(element instanceof Element)) {
      throw new TypeError(`OdoDialog requires an element. Got: "${element}"`);
    }

    /**
     * Base Element.
     * @type {Element}
     */
    this.element = element;

    /**
     * Options object.
     * @type {object}
     */
    this.options = Object.assign({}, Dialog.Defaults, opts);

    /**
     * Dialog Id.
     * @type {string}
     */
    this.id = element.getAttribute('id');

    /**
     * Dialog backdrop
     * @type {Element}
     * @protected
     */
    this.backdrop = document.createElement('div');
    this.backdrop.className = Dialog.Classes.BACKDROP;

    /**
     * Dialog content (role=document).
     * @type {Element}
     * @protected
     */
    this.content = this.getByClass(Dialog.Classes.CONTENT);

    /**
     * Elements which, when clicked, close the dialog.
     * @type {Element}
     * @private
     */
    this._closers = Array.from(this.element.querySelectorAll('[data-odo-dialog-close]'));

    /**
     * Window resize Id
     * @type {string}
     * @private
     */
    this._resizeId = null;

    /**
     * ScrollFix id
     * @type {?string}
     * @private
     */
    this._scrollFixId = null;

    /**
     * Whether the dialog is open.
     * @type {boolean}
     */
    this.isOpen = false;

    /**
     * Is the dialog currently animating.
     * @type {boolean}
     * @protected
     */
    this.isAnimating = false;

    /**
     * Whether the body has a scrollbar.
     * @type {?boolean}
     * @private
     */
    this._hasBodyScrollbar = null;

    /**
     * Padding on the body.
     * @type {number}
     * @private
     */
    this._originalBodyPadding = -1;

    /**
     * Whether this is a fullscreen dialog. Fullscreen dialogs should not have
     * paddingRight applied to them.
     * @type {?boolean}
     * @private
     */
    this._isFullscreen = null;

    this.z = Dialog.Z_BASE;

    Dialog.Instances.push(this);

    if (Dialog.Instances.length === 1) {
      document.body.addEventListener('click', Dialog._handleTriggerClick);
    }

    // If this browser does not support auto margins for flexbox, add a class
    // so that it can be centered differently.
    this.element.classList.toggle(Dialog.Classes.NO_AUTO_MARGIN, !Dialog.SUPPORTS_AUTO_MARGINS);

    this._bindContexts();
    this.onResize();
    this._addA11yAttributes();
    this._ensureBodyChild();
  }

  /**
   * Find descendent element by class.
   * @param {string} name Name of the class to find.
   * @return {?Element} The element or undefined.
   */
  getByClass(name) {
    return this.element.getElementsByClassName(name)[0];
  }

  /**
   * Bind `this` context to event handlers.
   */
  _bindContexts() {
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onClick = this.onClick.bind(this);
    this.close = this.close.bind(this);
    // Bind undefined as the first parameter so that the event object will be
    // the second parameter and the optional viewportHeight parameter will work.
    this.onWindowResize = this.onResize.bind(this, undefined);
  }

  /**
   * Add static accessibility attributes so that the implementor can leave them
   * off or in case they forget.
   */
  _addA11yAttributes() {
    this.element.tabIndex = -1;
    this.element.setAttribute('aria-hidden', true);
    this.element.setAttribute('role', 'dialog');
    this.content.setAttribute('role', 'document');
  }

  /**
   * If the dialog element is not a direct descendent of the <body>, make it so.
   */
  _ensureBodyChild() {
    if (this.element.parentNode !== document.body) {
      document.body.appendChild(this.element);
    }
  }

  /**
   * Determine the correct element to scroll fix and fix it.
   */
  _applyScrollFix() {
    // Allow the scrollable element to be something inside the dialog.
    if (this.options.scrollableElement) {
      const element = this.element.matches(this.options.scrollableElement) ?
        this.element :
        this.element.querySelector(this.options.scrollableElement);
      this._scrollFixId = ScrollFix.add(element);
    }
  }

  /**
   * If the page already has a scrollbar, adding overflow: hidden will remove it,
   * shifting the content to the right. To avoid this, there needs to be padding
   * on the body that's the same width as the scrollbar, but only when the dialog
   * will not have a scrollbar to take the page scrollbar's place.
   * @return {number}
   */
  _getScrollbarOffset() {
    const hasDialogScrollbar = this.element.scrollHeight > document.documentElement.clientHeight;
    return this._hasBodyScrollbar && !hasDialogScrollbar ? Dialog.SCROLLBAR_WIDTH : 0;
  }

  /**
   * Click handler on the main element. When the dialog is dismissable and the
   * user clicked outside the content (i.e. the backdrop), close it.
   * @param {Event} evt Event object.
   * @protected
   */
  onClick(evt) {
    if (this.options.dismissable && evt.target === this.element) {
      this.close();
    }
  }

  /**
   * Keypress event handler
   * @param {Event} evt Event object
   * @protected
   */
  onKeyPress(evt) {
    // Only react to keys when this dialog is the top-most one.
    if (this.z === Dialog.getTopLayer()) {
      // If 'ESC' is pressed, close the dialog
      if (this.options.dismissable && evt.which === Dialog.Keys.ESC) {
        this.close();
      }

      // If the TAB key is being pressed, make sure the focus stays trapped within
      // the dialog element.
      if (evt.which === Dialog.Keys.TAB) {
        Dialog._trapTabKey(this.element, evt);
      }
    }
  }

  /**
   * The dialog has a height of 100vh, which, in mobile safari, is incorrect
   * when the toolbars are visible, not allowing the user to scroll the full
   * height of the content within it.
   * The viewportHeight parameter is optional so that it can be read in the open()
   * method with all the other DOM reads. This avoids read->write->read #perfmatters.
   * @param {number} [viewportHeight=window.innerHeight] Height of the viewport.
   * @protected
   */
  onResize(viewportHeight = window.innerHeight) {
    this.element.style.height = viewportHeight + 'px';
  }

  /**
   * Checks to see if a dialog is already open or animating If not, opens dialog.
   * @param {boolean} [sync=false] Whether to open with transitions or not.
   */
  open(sync = false) {
    if (this.isAnimating || this.isOpen) {
      return;
    }

    const viewportHeight = window.innerHeight;
    Dialog.focusedBeforeDialog = document.activeElement;
    this._hasBodyScrollbar = document.body.clientWidth < window.innerWidth;
    this._isFullscreen = this.element.classList.contains(Dialog.Classes.FULLSCREEN);

    // Add aria-hidden to other top-level things.
    const siblings = Dialog._getSiblings(this.element);
    const originals = siblings.map(element => element.getAttribute('aria-hidden'));
    siblings.forEach((element, i) => {
      if (originals[i]) {
        element.setAttribute('data-odo-dialog-original', originals[i]);
      }
      element.setAttribute('aria-hidden', true);
    });

    // If there is already an open dialog, increase the z-index of this dialog's
    // main element and backdrop above the open one.
    if (Dialog.getOpenDialogCount() > 0) {
      this.handleOtherOpenDialogs();
    }

    this.isOpen = true;
    this.onResize(viewportHeight);
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
    window.addEventListener('resize', this.onWindowResize);
    this.element.addEventListener('click', this.onClick);
    this._closers.forEach((element) => {
      element.addEventListener('click', this.close);
    });

    if (sync === true) {
      this._openNext();
      this._opened();
    } else {
      Dialog._nextFrame(() => {
        this._openNext();
        onTransitionEnd(this.element, this._opened, this, null, 1000);
      });
    }
  }

  /**
   * Start the transition for opening the dialog.
   */
  _openNext() {
    this.isAnimating = true;
    // Now that the dialog is no longer display:none, the scrollHeight can be measured.
    const scrollbarOffset = this._getScrollbarOffset();
    if (!this._isFullscreen && scrollbarOffset > 0) {
      this.element.style.paddingRight = scrollbarOffset + 'px';
    }

    this.element.classList.remove(Dialog.Classes.ENTER);
    this.element.classList.add(Dialog.Classes.ENTERING);
  }

  /**
   * Handle the end of the open transition. Emits OPENED event.
   */
  _opened() {
    this.element.classList.remove(Dialog.Classes.ENTERING);
    this.element.classList.add(Dialog.Classes.VISIBLE);
    this.isAnimating = false;
    this.emit(Dialog.EventType.OPENED);
  }

  /**
   * Hides dialog
   * @param {boolean} [sync=false] Whether to close with transitions or not.
   */
  close(sync = false) {
    if (this.isAnimating || !this.isOpen) {
      return;
    }

    // Remove aria-hidden to other top-level things.
    const siblings = Dialog._getSiblings(this.element);
    const originals = siblings.map(element => element.getAttribute('data-odo-dialog-original'));
    siblings.forEach((element, i) => {
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

    ScrollFix.remove(this._scrollFixId);

    // Support: IE11
    // Clicking on an SVG element inside an <a> will set the `focusedBeforeDialog`
    // to the SVG, but SVG doesn't have a `focus()` method in IE.
    if (Dialog.focusedBeforeDialog && typeof Dialog.focusedBeforeDialog.focus === 'function') {
      Dialog.focusedBeforeDialog.focus();
    }

    document.removeEventListener('keydown', this.onKeyPress);
    window.removeEventListener('resize', this.onWindowResize);
    this.element.removeEventListener('click', this.onClick);
    this._closers.forEach((element) => {
      element.removeEventListener('click', this.close);
    });

    if (sync === true) {
      this._closeNext();
      this._closed();
    } else {
      Dialog._nextFrame(() => {
        this._closeNext();
        onTransitionEnd(this.element, this._closed, this, null, 1000);
      });
    }
  }

  /**
   * Start the transition for closing the dialog.
   */
  _closeNext() {
    this.isAnimating = true;
    this.element.classList.remove(Dialog.Classes.LEAVE);
    this.element.classList.add(Dialog.Classes.LEAVING);
  }

  /**
   * Handle the end of the close transition. Emits the CLOSED event.
   */
  _closed() {
    this.isAnimating = false;
    this.element.style.paddingRight = '';
    this.element.setAttribute('aria-hidden', true);
    this.element.classList.remove(Dialog.Classes.OPEN);
    this.element.classList.remove(Dialog.Classes.LEAVING);
    if (Dialog.getOpenDialogCount() === 0) {
      document.body.style.paddingRight = '';
      document.body.classList.remove(Dialog.Classes.BODY_OPEN);
    }
    document.body.removeChild(this.backdrop);
    this.emit(Dialog.EventType.CLOSED);
  }

  /**
   * Modify dialog z-indices and more because there are about to be multiple
   * dialogs open at the same time.
   * @protected
   */
  handleOtherOpenDialogs() {
    this.z = Dialog.getTopLayer() + 20;
    this.element.style.zIndex = this.z;
    this.backdrop.style.zIndex = this.z - 5;

    // When this dialog is closed, revert the z-index back to its original value.
    this.once(Dialog.EventType.CLOSED, () => {
      this.z = Dialog.Z_BASE;
      this.element.style.zIndex = '';
      this.backdrop.style.zIndex = '';

      // Find new top dialog.
      const zTop = Dialog.getTopLayer();

      Dialog.Instances.forEach((instance) => {
        if (instance.isOpen && instance.z === zTop) {
          instance.didEnterForeground();
        }
      });
    });

    // Tell other dialogs they're going into the background.
    Dialog.Instances.forEach((instance) => {
      if (instance.isOpen && instance.id !== this.id) {
        instance.didEnterBackground();
      }
    });
  }

  /**
   * Dialog went into the background and has another dialog open above it.
   * @protected
   */
  didEnterBackground() {
    ScrollFix.remove(this._scrollFixId);
  }

  /**
   * Dialog came back into the foreground after being in the background.
   * @protected
   */
  didEnterForeground() {
    this._applyScrollFix();
  }

  /**
   * Close the dialog, remove event listeners and element references.
   */
  dispose() {
    if (this.isOpen) {
      this.close(true);
    }

    this.element = null;
    this.content = null;
    this.backdrop = null;
    this._closers.length = 0;

    pull(Dialog.Instances, this);

    // If this is the last dialog (being disposed), remove the body listener.
    if (Dialog.Instances.length === 0) {
      document.body.removeEventListener('click', Dialog._handleTriggerClick);
    }
  }

  /**
   * Call a function after two animation frames. Using just one is unreliable
   * when using animations to/from display:none elements or ones that are not
   * yet in the DOM.
   * @param {function} fn Function to call on the next frame.
   */
  static _nextFrame(fn) {
    window.requestAnimationFrame(window.requestAnimationFrame.bind(null, fn));
  }

  /**
   * Open the correct dialog when an element with `data-odo-dialog-open` attribute
   * is clicked.
   * @param {Event} evt Event object.
   */
  static _handleTriggerClick(evt) {
    const trigger = evt.target.closest('[data-odo-dialog-open]');

    if (trigger !== null) {
      evt.preventDefault();
      const id = trigger.getAttribute('data-odo-dialog-open');
      const instance = Dialog.getDialogById(id);
      instance.emit(Dialog.EventType.TRIGGER_CLICKED, trigger);
      instance.open();
    }
  }

  /**
   * Trap the focus inside the given element.
   * @param {Element} node
   * @param {Event} evt
   */
  static _trapTabKey(node, evt) {
    const focusableChildren = Dialog._getFocusableChildren(node);
    const focusedItemIndex = focusableChildren.indexOf(document.activeElement);

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
  }

  /**
   * Get the focusable children of the given element.
   * @param {Element} element
   * @return {Array.<Element>}
   */
  static _getFocusableChildren(element) {
    return Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS))
      .filter(Dialog._isVisibleElement);
  }

  /**
   * Whether an element is visible (and therefore can receive focus). Uses
   * `getClientRects` due to this issue:
   * https://github.com/jquery/jquery/issues/2227
   * http://jsfiddle.net/2tgw2yr3/
   * @param {Element} el Element.
   * @return {boolean}
   */
  static _isVisibleElement(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  /**
   * Retrieve the siblings of an element.
   * @param {Element} element Element to get siblings for.
   * @return {Array.<Element>}
   */
  static _getSiblings(element) {
    const children = Array.from(element.parentNode.children);
    const ignore = ['script', 'link', 'meta'];
    return children.filter(node =>
      node !== element && !ignore.includes(node.nodeName.toLowerCase()));
  }

  /**
   * Calculate the width of the scrollbar because when the body has overflow:hidden,
   * the scrollbar disappears.
   * https://davidwalsh.name/detect-scrollbar-width
   * @return {number}
   */
  static _getScrollbarWidth() {
    // Create measurement node.
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width:50px;height:50px;overflow:scroll;position:absolute;top:-9999px;';
    document.body.appendChild(scrollDiv);

    // Calculate the scrollbar width.
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    // Remove test element.
    document.body.removeChild(scrollDiv);

    return scrollbarWidth;
  }

  /**
   * Unfortunately, the auto margins do not work for flex children in IE11 and
   * below because the content element does have an explicit height set on it.
   * @return {boolean}
   */
  static _autoMarginTest() {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.style.cssText = 'display:flex;height:50px;width:50px;position:absolute;';
    child.style.cssText = 'margin:auto;';
    child.innerHTML = 'a';
    parent.appendChild(child);
    document.body.appendChild(parent);

    const ret = child.offsetTop > 0;
    document.body.removeChild(parent);

    return ret;
  }

  /**
   * Instantiates all instances of dialogs with the same settings
   * @param {Object} options Object of all dialog options. Is optional.
   * @return {Dialog[]}
   */
  static initializeAll(options) {
    Dialog.disposeAll();

    return Array.from(document.querySelectorAll('.' + Dialog.Classes.BASE)).map(dialog => new Dialog(dialog, options));
  }

  /**
   * Clear all references to dialogs so there are no duplicates.
   */
  static disposeAll() {
    const clone = Dialog.Instances.slice();
    clone.forEach((dialog) => {
      dialog.dispose();
    });
  }

  /**
   * Retrieve a dialog instance by its id.
   * @param {string} id Id of the dialog.
   * @return {?Dialog} The dialog or undefined if there is no dialog with the given id.
   */
  static getDialogById(id) {
    return Dialog.Instances.find(instance => instance.id === id);
  }

  /**
   * Count how many dialogs are currently open.
   * @return {number}
   */
  static getOpenDialogCount() {
    return Dialog.Instances.filter(instance => instance.isOpen).length;
  }

  /**
   * Find the z index of the top-most dialog instance.
   * @return {number}
   */
  static getTopLayer() {
    // eslint-disable-next-line prefer-spread
    return Math.max.apply(Math, Dialog.Instances.map(instance => instance.z));
  }
}

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
  CONTENT: 'odo-dialog__content',
};

/** @enum {string} */
Dialog.EventType = {
  OPENED: 'ododialog:open',
  CLOSED: 'ododialog:closed',
  TRIGGER_CLICKED: 'ododialog:triggerclicked',
};

/** @enum {number} */
Dialog.Keys = {
  ESC: 27,
  TAB: 9,
};

/** @type {!Object} */
Dialog.Defaults = {
  dismissable: true,
  scrollableElement: '.odo-dialog',
};

/** @type {Dialog[]} */
Dialog.Instances = [];

Dialog.Z_BASE = 1050;

Dialog.ScrollFix = ScrollFix;

/**
 * Element which had focus before the dialog opened.
 * @type {Element}
 */
Dialog.focusedBeforeDialog = null;

Dialog.SUPPORTS_AUTO_MARGINS = Dialog._autoMarginTest();
Dialog.SCROLLBAR_WIDTH = Dialog._getScrollbarWidth();

export default Dialog;
