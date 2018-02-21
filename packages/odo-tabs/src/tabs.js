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

import TinyEmitter from 'tiny-emitter';
import { giveId, clamp, setHash } from '@odopod/odo-helpers';
import OdoWindowEvents from '@odopod/odo-window-events';
import TabsEvent from './tabs-event';

let id = 0;
function uniqueId() {
  id += 1;
  return `odo-tabs${id}`;
}

class Tabs extends TinyEmitter {
  /**
   * A tabs component.
   * @param {Element} element The tabs list element.
   * @constructor
   */
  constructor(element) {
    super();

    /** @type {Element} */
    this.element = element;

    /** @private {number} */
    this._selectedIndex = -1;

    /**
     * List items, children of the tabs list.
     * @type {Array.<Element>}
     */
    this.tabs = Array.from(this.element.children);

    /**
     * Anchor elements inside the tab.
     * @type {Array.<HTMLAnchorElement>}
     */
    this.anchors = this.tabs.map(tab => tab.querySelector('a'));

    /**
     * Tab pane elements.
     * @type {Array.<HTMLElement>}
     */
    this.panes = this.anchors.map(anchor => document.getElementById(anchor.getAttribute('href').substring(1)));

    /**
     * Wrapper for the panes.
     * @type {HTMLElement}
     */
    this.panesContainer = this.panes[0].parentElement;

    /**
     * Get an array of [possible] hashes.
     * @type {Array.<?string>}
     */
    this.hashes = this.anchors.map(anchor => anchor.getAttribute('data-hash'));

    this.init();
  }

  init() {
    const startIndex = this.getStartingIndex();

    // Bind events.
    this._setupHandlers();

    // Add aria roles.
    this._processTabs();

    // Show the first or the one in the #hash.
    this.setSelectedIndex(startIndex, true);
  }

  /**
   * Determine the starting tab index. It will first look at the URL's #hash, then
   * for a pane which has the IS_SELECTED class, defaulting to the first tab if
   * neither of those exist.
   * @return {number}
   */
  getStartingIndex() {
    const hashIndex = this._getWindowHashIndex();

    if (hashIndex > -1) {
      return hashIndex;
    }

    const startIndex = this.panes.findIndex(pane => pane.matches('.' + Tabs.ClassName.IS_SELECTED));

    if (startIndex > -1) {
      return startIndex;
    }

    return 0;
  }

  /**
   * Set tabIndex attribute, add any aria roles and classes.
   * @protected
   */
  _processTabs() {
    this.element.classList.add(Tabs.ClassName.TABS);
    this.element.setAttribute('role', 'tablist');

    // Tab wrappers.
    this.tabs.forEach((tab) => {
      tab.setAttribute('role', 'presentation');
    });

    // Tab (anchor) elements.
    this.anchors.forEach((anchor, i) => {
      anchor.setAttribute('role', 'tab');
      anchor.setAttribute('tabIndex', -1);
      anchor.setAttribute('aria-selected', false);

      giveId(anchor, uniqueId);

      const pane = this.panes[i];
      anchor.setAttribute('aria-controls', pane.id);
      pane.setAttribute('aria-labelledby', anchor.id);
    });

    // Panes.
    this.panes.forEach((pane) => {
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-hidden', true);
    });
  }

  /**
   * Bind event listeners.
   * @protected
   */
  _setupHandlers() {
    this._onClick = this._handleClick.bind(this);
    this._onKeydown = this._handleKeydown.bind(this);
    this._onHashChange = this._handleHashChange.bind(this);

    this.element.addEventListener('click', this._onClick);
    this.element.addEventListener('keydown', this._onKeydown);
    window.addEventListener('hashchange', this._onHashChange);
    this._resizeId = OdoWindowEvents.onResize(this.update.bind(this));
  }

  /**
   * Delegated click listener. Look for a tab close to the target and select it
   * if it exists.
   * @param {MouseEvent} evt Event object.
   * @private
   */
  _handleClick(evt) {
    evt.preventDefault();

    const tab = evt.target.closest('.' + Tabs.ClassName.TAB);
    if (tab) {
      this.setSelectedIndex(this.tabs.indexOf(tab));
    }
  }

  /**
   * Key pressed on the tab list. Change focus or select the tab.
   * @param {KeyboardEvent} evt Event object.
   * @private
   */
  _handleKeydown(evt) {
    let focusedIndex = this._getFocusedTabIndex();

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
    this._focusTab(clamp(focusedIndex, 0, this.tabs.length - 1));
  }

  /**
   * URL hash changed, see if the hash matches one of the hashes stored and if it
   * does, navigate to that pane.
   * @private
   */
  _handleHashChange() {
    const hashIndex = this._getWindowHashIndex();
    if (hashIndex > -1) {
      this.setSelectedIndex(hashIndex);
    }
  }

  /**
   * Reset the height of the pane parent.
   * @private
   */
  update() {
    const currentPane = this.panes[this.getSelectedIndex()];
    const newHeight = currentPane.offsetHeight;
    this.panesContainer.style.height = newHeight + 'px';
  }

  /**
   * Retrieve the hash without the `#` from the url.
   * @return {number}
   * @private
   */
  _getWindowHashIndex() {
    return this.hashes.indexOf(window.location.hash.substring(1));
  }

  /**
   * Find the index of the currently focused tab.
   * @return {number}
   * @private
   */
  _getFocusedTabIndex() {
    const focusedTab = document.activeElement.closest('.' + Tabs.ClassName.TAB);
    return this.tabs.indexOf(focusedTab);
  }

  /**
   * Focus on a tab.
   * @param {number} index Tab index to focus on.
   * @private
   */
  _focusTab(index) {
    this.anchors[index].focus();
  }

  /**
   * Returns the currently selected index.
   * @return {number}
   */
  getSelectedIndex() {
    return this._selectedIndex;
  }

  /**
   * Set the selected index to a new value. Will exit early if the index is out of
   * range, or the index is the same as the current one.
   * @param {number} index Index to go to.
   * @param {boolean} [skipHash] Whether to skip setting the hash.
   */
  setSelectedIndex(index, skipHash) {
    if (index === this._selectedIndex || index < 0 || index >= this.tabs.length) {
      return;
    }

    // Trigger the will show event and give listeners a chance to cancel showing
    // the tab/pane.
    const willShowEvent = new TabsEvent(Tabs.EventType.WILL_SHOW, index);
    this.emit(willShowEvent.type, willShowEvent);

    if (willShowEvent.defaultPrevented) {
      return;
    }

    this._selectTab(index);
    this._selectPane(index);

    this._selectedIndex = index;

    if (!skipHash && this.hashes[index]) {
      setHash(this.hashes[index]);
    }

    const didShowEvent = new TabsEvent(Tabs.EventType.DID_SHOW, index);
    this.emit(didShowEvent.type, didShowEvent);
  }

  /**
   * Update the selected tab.
   * @param {number} index Index of the new tab.
   * @private
   */
  _selectTab(index) {
    const newTab = this.tabs[index];
    const oldTab = this.tabs[this.getSelectedIndex()];
    const newAnchor = this.anchors[index];
    const oldAnchor = this.anchors[this.getSelectedIndex()];

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
  }

  /**
   * Update the selected pane. Handles aria states.
   * @param {number} index Index of the new pane.
   * @private
   */
  _selectPane(index) {
    const newPane = this.panes[index];
    const oldPane = this.panes[this.getSelectedIndex()];
    const newHeight = newPane.offsetHeight;

    if (oldPane) {
      oldPane.classList.remove(Tabs.ClassName.IS_SELECTED);
      oldPane.setAttribute('aria-hidden', true);
    }

    newPane.classList.add(Tabs.ClassName.IS_SELECTED);
    newPane.setAttribute('aria-hidden', false);

    this.panesContainer.style.height = newHeight + 'px';
  }

  /**
   * Remove event listeners, classes, attributes, and other things added by this script.
   */
  dispose() {
    this.element.classList.remove(Tabs.ClassName.TABS);
    this.element.removeAttribute('role');

    for (let i = this.tabs.length - 1; i >= 0; i--) {
      const tab = this.tabs[i];
      const anchor = this.anchors[i];
      const pane = this.panes[i];

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
  }
}

Tabs.ClassName = {
  TABS: 'odo-tabs',
  TAB: 'odo-tabs__tab',
  IS_SELECTED: 'is-selected',
};

Tabs.EventType = {
  WILL_SHOW: 'odotabs:willshow',
  DID_SHOW: 'odotabs:didshow',
};

export default Tabs;
