(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('tiny-emitter'), require('@odopod/odo-helpers'), require('@odopod/odo-window-events')) :
	typeof define === 'function' && define.amd ? define(['tiny-emitter', '@odopod/odo-helpers', '@odopod/odo-window-events'], factory) :
	(global.OdoTabs = factory(global.TinyEmitter,global.OdoHelpers,global.OdoWindowEvents));
}(this, (function (TinyEmitter,odoHelpers,OdoWindowEvents) { 'use strict';

TinyEmitter = TinyEmitter && TinyEmitter.hasOwnProperty('default') ? TinyEmitter['default'] : TinyEmitter;
OdoWindowEvents = OdoWindowEvents && OdoWindowEvents.hasOwnProperty('default') ? OdoWindowEvents['default'] : OdoWindowEvents;

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

var TabsEvent = function () {
  /**
   * Object representing a tab event.
   * @param {string} type Event type.
   * @param {number} index Index of tab.
   * @constructor
   */
  function TabsEvent(type, index) {
    classCallCheck(this, TabsEvent);

    this.type = type;

    /** @type {number} */
    this.index = index;

    /** @type {boolean} Whether `preventDefault` has been called. */
    this.defaultPrevented = false;
  }

  TabsEvent.prototype.preventDefault = function preventDefault() {
    this.defaultPrevented = true;
  };

  return TabsEvent;
}();

/**
 * @fileoverview Easy tabs. Inspired by bootstrap and jQuery UI.
 *
 * {@link http://jqueryui.com/tabs/}
 * {@link https://github.com/jquery/jquery-ui/blob/master/ui/tabs.js}
 * {@link http://www.marcozehe.de/2013/02/02/advanced-aria-tip-1-tabs-in-web-apps/}
 * {@link http://git.aaronlumsden.com/tabulous.js/}
 *
 * @author Glen Cheney <glen@odopod.com>
 */

var id = 0;
function uniqueId() {
  id += 1;
  return 'odo-tabs' + id;
}

var Tabs = function (_TinyEmitter) {
  inherits(Tabs, _TinyEmitter);

  /**
   * A tabs component.
   * @param {Element} element The tabs list element.
   * @constructor
   */
  function Tabs(element) {
    classCallCheck(this, Tabs);

    /** @type {Element} */
    var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

    _this.element = element;

    /** @private {number} */
    _this._selectedIndex = -1;

    /**
     * List items, children of the tabs list.
     * @type {Array.<Element>}
     */
    _this.tabs = Array.from(_this.element.children);

    /**
     * Anchor elements inside the tab.
     * @type {Array.<HTMLAnchorElement>}
     */
    _this.anchors = _this.tabs.map(function (tab) {
      return tab.querySelector('a');
    });

    /**
     * Tab pane elements.
     * @type {Array.<Element>}
     */
    _this.panes = _this.anchors.map(function (anchor) {
      return document.getElementById(anchor.getAttribute('href').substring(1));
    });

    /**
     * Wrapper for the panes.
     * @type {Element}
     */
    _this.panesContainer = _this.panes[0].parentNode;

    /**
     * Get an array of [possible] hashes.
     * @type {Array.<?string>}
     */
    _this.hashes = _this.anchors.map(function (anchor) {
      return anchor.getAttribute('data-hash');
    });

    _this.init();
    return _this;
  }

  Tabs.prototype.init = function init() {
    var startIndex = this.getStartingIndex();

    // Bind events.
    this._setupHandlers();

    // Add aria roles.
    this._processTabs();

    // Show the first or the one in the #hash.
    this.setSelectedIndex(startIndex, true);
  };

  /**
   * Determine the starting tab index. It will first look at the URL's #hash, then
   * for a pane which has the IS_SELECTED class, defaulting to the first tab if
   * neither of those exist.
   * @return {number}
   */


  Tabs.prototype.getStartingIndex = function getStartingIndex() {
    var hashIndex = this._getWindowHashIndex();

    if (hashIndex > -1) {
      return hashIndex;
    }

    var startIndex = this.panes.findIndex(function (pane) {
      return pane.matches('.' + Tabs.ClassName.IS_SELECTED);
    });

    if (startIndex > -1) {
      return startIndex;
    }

    return 0;
  };

  /**
   * Set tabIndex attribute, add any aria roles and classes.
   * @protected
   */


  Tabs.prototype._processTabs = function _processTabs() {
    var _this2 = this;

    this.element.classList.add(Tabs.ClassName.TABS);
    this.element.setAttribute('role', 'tablist');

    // Tab wrappers.
    this.tabs.forEach(function (tab) {
      tab.setAttribute('role', 'presentation');
    });

    // Tab (anchor) elements.
    this.anchors.forEach(function (anchor, i) {
      anchor.setAttribute('role', 'tab');
      anchor.setAttribute('tabIndex', -1);
      anchor.setAttribute('aria-selected', false);

      odoHelpers.dom.giveId(anchor, uniqueId);

      var pane = _this2.panes[i];
      anchor.setAttribute('aria-controls', pane.id);
      pane.setAttribute('aria-labelledby', anchor.id);
    });

    // Panes.
    this.panes.forEach(function (pane) {
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-hidden', true);
    });
  };

  /**
   * Bind event listeners.
   * @protected
   */


  Tabs.prototype._setupHandlers = function _setupHandlers() {
    this._onClick = this._handleClick.bind(this);
    this._onKeydown = this._handleKeydown.bind(this);
    this._onHashChange = this._handleHashChange.bind(this);

    this.element.addEventListener('click', this._onClick);
    this.element.addEventListener('keydown', this._onKeydown);
    window.addEventListener('hashchange', this._onHashChange);
    this._resizeId = OdoWindowEvents.onResize(this.update.bind(this));
  };

  /**
   * Delegated click listener. Look for a tab close to the target and select it
   * if it exists.
   * @param {MouseEvent} evt Event object.
   * @private
   */


  Tabs.prototype._handleClick = function _handleClick(evt) {
    evt.preventDefault();

    var tab = evt.target.closest('.' + Tabs.ClassName.TAB);
    if (tab) {
      this.setSelectedIndex(this.tabs.indexOf(tab));
    }
  };

  /**
   * Key pressed on the tab list. Change focus or select the tab.
   * @param {KeyboardEvent} evt Event object.
   * @private
   */


  Tabs.prototype._handleKeydown = function _handleKeydown(evt) {
    var focusedIndex = this._getFocusedTabIndex();

    switch (evt.which) {
      // Right | Down
      case 39:
      case 40:
        focusedIndex += 1;
        break;

      // Left | Up
      case 37:
      case 38:
        focusedIndex -= 1;
        break;

      // Spacebar | Enter
      case 32:
      case 13:
        evt.preventDefault();
        this.setSelectedIndex(focusedIndex);
        return;
      default:
        return;
    }

    evt.preventDefault();
    this._focusTab(odoHelpers.math.clamp(focusedIndex, 0, this.tabs.length - 1));
  };

  /**
   * URL hash changed, see if the hash matches one of the hashes stored and if it
   * does, navigate to that pane.
   * @private
   */


  Tabs.prototype._handleHashChange = function _handleHashChange() {
    var hashIndex = this._getWindowHashIndex();
    if (hashIndex > -1) {
      this.setSelectedIndex(hashIndex);
    }
  };

  /**
   * Reset the height of the pane parent.
   * @private
   */


  Tabs.prototype.update = function update() {
    var currentPane = this.panes[this.getSelectedIndex()];
    var newHeight = currentPane.offsetHeight;
    this.panesContainer.style.height = newHeight + 'px';
  };

  /**
   * Retrieve the hash without the `#` from the url.
   * @return {string}
   * @private
   */


  Tabs.prototype._getWindowHashIndex = function _getWindowHashIndex() {
    return this.hashes.indexOf(window.location.hash.substring(1));
  };

  /**
   * Find the index of the currently focused tab.
   * @return {number}
   * @private
   */


  Tabs.prototype._getFocusedTabIndex = function _getFocusedTabIndex() {
    var focusedTab = document.activeElement.closest('.' + Tabs.ClassName.TAB);
    return this.tabs.indexOf(focusedTab);
  };

  /**
   * Focus on a tab.
   * @param {number} index Tab index to focus on.
   * @private
   */


  Tabs.prototype._focusTab = function _focusTab(index) {
    this.anchors[index].focus();
  };

  /**
   * Returns the currently selected index.
   * @return {number}
   */


  Tabs.prototype.getSelectedIndex = function getSelectedIndex() {
    return this._selectedIndex;
  };

  /**
   * Set the selected index to a new value. Will exit early if the index is out of
   * range, or the index is the same as the current one.
   * @param {number} index Index to go to.
   * @param {boolean} [skipHash] Whether to skip setting the hash.
   */


  Tabs.prototype.setSelectedIndex = function setSelectedIndex(index, skipHash) {
    if (index === this._selectedIndex || index < 0 || index >= this.tabs.length) {
      return;
    }

    // Trigger the will show event and give listeners a chance to cancel showing
    // the tab/pane.
    var willShowEvent = new TabsEvent(Tabs.EventType.WILL_SHOW, index);
    this.emit(willShowEvent.type, willShowEvent);

    if (willShowEvent.defaultPrevented) {
      return;
    }

    this._selectTab(index);
    this._selectPane(index);

    this._selectedIndex = index;

    if (!skipHash && this.hashes[index]) {
      odoHelpers.browser.setHash(this.hashes[index]);
    }

    var didShowEvent = new TabsEvent(Tabs.EventType.DID_SHOW, index);
    this.emit(didShowEvent.type, didShowEvent);
  };

  /**
   * Update the selected tab.
   * @param {number} index Index of the new tab.
   * @private
   */


  Tabs.prototype._selectTab = function _selectTab(index) {
    var newTab = this.tabs[index];
    var oldTab = this.tabs[this.getSelectedIndex()];
    var newAnchor = this.anchors[index];
    var oldAnchor = this.anchors[this.getSelectedIndex()];

    if (oldTab) {
      oldTab.classList.remove(Tabs.ClassName.IS_SELECTED);
      oldAnchor.classList.remove(Tabs.ClassName.IS_SELECTED);
      oldAnchor.setAttribute('tabIndex', -1);
      oldAnchor.setAttribute('aria-selected', false);
    }

    newTab.classList.add(Tabs.ClassName.IS_SELECTED);
    newAnchor.classList.add(Tabs.ClassName.IS_SELECTED);
    newAnchor.setAttribute('tabIndex', 0);
    newAnchor.setAttribute('aria-selected', true);
  };

  /**
   * Update the selected pane. Handles aria states.
   * @param {number} index Index of the new pane.
   * @private
   */


  Tabs.prototype._selectPane = function _selectPane(index) {
    var newPane = this.panes[index];
    var oldPane = this.panes[this.getSelectedIndex()];
    var newHeight = newPane.offsetHeight;

    if (oldPane) {
      oldPane.classList.remove(Tabs.ClassName.IS_SELECTED);
      oldPane.setAttribute('aria-hidden', true);
    }

    newPane.classList.add(Tabs.ClassName.IS_SELECTED);
    newPane.setAttribute('aria-hidden', false);

    this.panesContainer.style.height = newHeight + 'px';
  };

  /**
   * Remove event listeners, classes, attributes, and other things added by this script.
   */


  Tabs.prototype.dispose = function dispose() {
    this.element.classList.remove(Tabs.ClassName.TABS);
    this.element.removeAttribute('role');

    for (var i = this.tabs.length - 1; i >= 0; i--) {
      var tab = this.tabs[i];
      var anchor = this.anchors[i];
      var pane = this.panes[i];

      tab.classList.remove(Tabs.ClassName.IS_SELECTED);
      anchor.classList.remove(Tabs.ClassName.IS_SELECTED);
      pane.classList.remove(Tabs.ClassName.IS_SELECTED);
      tab.removeAttribute('role');
      anchor.removeAttribute('role');
      anchor.removeAttribute('tabIndex');
      anchor.removeAttribute('aria-selected');
      anchor.removeAttribute('aria-controls');
      pane.removeAttribute('role');
      pane.removeAttribute('aria-labelledby');
      pane.removeAttribute('aria-hidden');
    }

    this.panesContainer.style.height = '';

    this.element.removeEventListener('click', this._onClick);
    this.element.removeEventListener('keydown', this._onKeydown);
    window.removeEventListener('hashchange', this._onHashChange);
    OdoWindowEvents.remove(this._resizeId);

    this.element = null;
    this.anchors = null;
    this.panes = null;
    this.panesContainer = null;
    this._selectedIndex = -1;
  };

  return Tabs;
}(TinyEmitter);

Tabs.ClassName = {
  TABS: 'odo-tabs',
  TAB: 'odo-tabs__tab',
  IS_SELECTED: 'is-selected'
};

Tabs.EventType = {
  WILL_SHOW: 'odotabs:willshow',
  DID_SHOW: 'odotabs:didshow'
};

return Tabs;

})));
//# sourceMappingURL=odo-tabs.js.map
