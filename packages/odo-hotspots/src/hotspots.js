import TinyEmitter from 'tiny-emitter';
import debounce from 'debounce';
import Hotspot from './hotspot';
import settings from './settings';

class Hotspots extends TinyEmitter {
  /**
   * Component which has a draggable element in the middle which reveals one or
   * the other sides as the user drags.
   *
   * @constructor
   */
  constructor(el) {
    super();
    this.element = el;

    this.size = this._getContainerSize();
    this.hotspots = this._getHotspots();
    this._noopElement = this._getFirstBodyDescendant();
    this._noop = () => {};

    this._activeHotspot = null;

    this._bindEvents();

    this.hotspots.forEach((hotspot) => {
      hotspot.setA11yAttributes();
      hotspot.setPosition();
    });

    this.element.classList.add(Hotspots.ClassName.LOADED);
    this.dispatchEvent(Hotspots.EventType.INITIALIZED);
  }

  /**
   * Scope the query to the main element.
   * @param {string} className Class name of the desired elements.
   * @return {Array.<Element>} An array of elements.
   */
  getElementsByClass(className) {
    return Array.from(this.element.querySelectorAll('.' + className));
  }

  /**
   * In iOS, event delegation does not work for click events.
   * http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   * @return {?Element} The first child of the body which is a parent of the
   *     main element in this class.
   */
  _getFirstBodyDescendant() {
    let element = this.element;
    while (element) {
      const parent = element.parentElement;
      if (parent === document.body) {
        return element;
      }

      element = parent;
    }

    return null;
  }

  /**
   * Creates the hotspot instances.
   * @return {Array.<Hotspot>}
   */
  _getHotspots() {
    return this.getElementsByClass(Hotspots.ClassName.HOTSPOT)
      .map(element => new Hotspot(element, this));
  }

  /**
   * Finds the hotspot instance which uses the given wrapper element.
   * @param {Element} wrapper Element.
   * @return {?Hotspot}
   */
  _getHotspotByWrapper(wrapper) {
    for (let i = 0, len = this.hotspots.length; i < len; i++) {
      if (this.hotspots[i].wrapper === wrapper) {
        return this.hotspots[i];
      }
    }

    return null;
  }

  /**
   * Retrieves the dimensions of the main element.
   * @return {{width: number, height: number}}
   */
  _getContainerSize() {
    return {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
    };
  }

  /**
   * Triggers a custom event on the main element.
   * @param {string} eventName Name of event.
   * @param {Hotspot} [hotspot] Optional hotspot object.
   * @return {boolean} Whether preventDefault was called on the event.
   */
  dispatchEvent(eventName, hotspot) {
    const event = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    if (hotspot) {
      event.hotspot = hotspot;
    }

    this.emit(eventName, event);
    return event.defaultPrevented;
  }

  /**
   * Add event listeners.
   */
  _bindEvents() {
    this._clickHandler = this._handleHotspotClick.bind(this);
    this._resizeHandler = debounce(this._handleResize.bind(this), 200);
    this._loadHandler = this._handleLoad.bind(this);
    this._outerClickHandler = this._handleOuterClick.bind(this);

    window.addEventListener('resize', this._resizeHandler, false);
    window.addEventListener('load', this._loadHandler, false);

    this.hotspots.forEach((hotspot) => {
      hotspot.button.addEventListener('click', this._clickHandler, false);
    });
  }

  /**
   * Closes all open hotspots so that only one can be open at a time.
   */
  closeAllHotspots() {
    this.hotspots.forEach((hotspot) => {
      this.closeHotspot(hotspot);
    });
  }

  /**
   * Toggles the display of a hotspot.
   * @param {Hotspot} hotspot Hotspot to toggle.
   */
  toggleHotspot(hotspot) {
    if (hotspot.isOpen) {
      this.closeHotspot(hotspot);
    } else {
      this.openHotspot(hotspot);
    }
  }

  /**
   * Attempts to show the hotspot. It will emit an event which, if preventDefault
   * is called on, can be canceled.
   * @param {Hotspot} hotspot Hotspot to open.
   */
  openHotspot(hotspot) {
    // If preventDefault is called on this event, do not open the hotspot.
    if (hotspot.isOpen || this.dispatchEvent(Hotspots.EventType.WILL_OPEN, hotspot)) {
      return;
    }

    this.closeAllHotspots();
    hotspot.show();
    this.setActiveHotspot(hotspot);

    // Listen for clicks outside the hotspot which will close it.
    // In a timeout so that a click on the hotspot button doesn't bubble
    // up to the body and register as a click outside the hotspot.
    setTimeout(() => {
      this._listenForOuterClicks();
    }, 0);
  }

  /**
   * Attempts to hide the hotspot. It will emit an event which, if preventDefault
   * is called on, can be canceled.
   * @param {Hotspot} hotspot Hotspot to close.
   */
  closeHotspot(hotspot) {
    // If preventDefault is called on this event, do not close the hotspot.
    if (!hotspot.isOpen || this.dispatchEvent(Hotspots.EventType.WILL_CLOSE, hotspot)) {
      return;
    }

    hotspot.hide();
    this.setActiveHotspot(null);
    this._removeOuterClick();
  }

  /**
   * Bind a click listener to the body which closes any active hotspots if the
   * user clicked outside of the current hotspot. This method also adds a no-op
   * event lister to the first child of the body that is a parent of this module.
   * This is due to a bug in iOS where click events do not bubble properly.
   * The no-op element's tap highlight color is also set to transparent because
   * it would show the default color on tap because it has a click handler.
   */
  _listenForOuterClicks() {
    this._noopElement.addEventListener('click', this._noop, false);
    this._noopElement.style.WebkitTapHighlightColor = 'transparent';
    document.body.addEventListener('click', this._outerClickHandler, false);
  }

  /**
   * Remove the delegated click listeners and tap highlight color.
   */
  _removeOuterClick() {
    this._noopElement.removeEventListener('click', this._noop, false);
    this._noopElement.style.WebkitTapHighlightColor = '';
    document.body.removeEventListener('click', this._outerClickHandler, false);
  }

  /**
   * Listener for clicks on the button inside the hotspot and toggles the hotspot's state.
   * @param {Event} evt Click event object.
   */
  _handleHotspotClick(evt) {
    evt.preventDefault();
    const hotspot = this._getHotspotByWrapper(evt.currentTarget.parentElement);
    this.toggleHotspot(hotspot);
  }

  /**
   * When a hotspot is open, this handler is active. If the user clicks outside
   * the hotspot, it will be closed.
   * @param {Event} evt Click event object.
   */
  _handleOuterClick(evt) {
    if (!this.getActiveHotspot().content.contains(evt.target)) {
      this.closeHotspot(this.getActiveHotspot());
    }
  }

  /**
   * When the window size changes, recalculate things.
   */
  _handleResize() {
    this.refresh();
  }

  /**
   * Refresh when the page has finished loading. There are likely images within
   * the hotspot content which may now have a width/height which affects the
   * size of the hotspot content.
   */
  _handleLoad() {
    window.removeEventListener('load', this._loadHandler, false);
    this.refresh();
  }

  /**
   * Returns the currently open hotspot or null if none are open.
   * @return {?Hotspot}
   */
  getActiveHotspot() {
    return this._activeHotspot;
  }

  /**
   * Update the active hotspot property.
   * @param {Hotspot} hotspot
   */
  setActiveHotspot(hotspot) {
    this._activeHotspot = hotspot;
  }

  /**
   * Recalculates offsets and sizes.
   */
  refresh() {
    this.size = this._getContainerSize();
    this.hotspots.forEach((hotspot) => {
      hotspot.refresh();
    });
  }

  /**
   * Remove event listeners and DOM references.
   */
  dispose() {
    this.closeAllHotspots();

    this.hotspots.forEach((hotspot) => {
      hotspot.button.removeEventListener('click', this._clickHandler, false);
      hotspot.dispose();
    });

    this.hotspots = null;

    window.removeEventListener('load', this._loadHandler, false);
    window.removeEventListener('resize', this._resizeHandler, false);

    this.element.classList.remove(Hotspots.ClassName.LOADED);

    this.element = null;
    this._activeHotspot = null;
    this._noopElement = null;
  }
}

Object.assign(Hotspots, settings);

export default Hotspots;
