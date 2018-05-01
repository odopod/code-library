/**
 * @fileoverview A subclass of ExpandableGroup which includes some additional
 * features like scrolling and collapsing animations.
 *
 * @author Matt Zaso <matt.zaso@odopod.com>
 */
import { scrollTo } from '@odopod/odo-helpers';
import OdoWindowEvents from '@odopod/odo-window-events';
import ExpandableGroup from './expandable-group';

class ExpandableAccordion extends ExpandableGroup {
  constructor(elements) {
    super(elements);

    /**
     * @type {Array.<{id: string, offset: number}>} Object A map of the expandable offsets.
     */
    this._expandableOffsets = [];

    // Set the initial value of each element based on its state.
    this.update();

    // A resize handler for when the DOM updates.
    this._resizeId = OdoWindowEvents.onResize(this.update.bind(this));
  }

  /**
   * Called by OdoWindowEvents when the browser is resized. Allows us to update
   * our saved offsets and animate to their new positions.
   * @private
   */
  update() {
    // Find any already open expandables.
    const openExpandables = this.expandables.map(expandable => expandable.isOpen);

    // Set the transition duration to zero so there is no animation when measuring.
    this.expandables.forEach((expandable) => {
      expandable.target.style.transitionDuration = '0s';
      expandable.close();
      this._setHeight(expandable, false);
    });

    // Save offsets now that all expandables are collapsed.
    this._expandableOffsets = this._getOffsets();

    // Reopen any expandables that were open before.
    this.expandables.forEach((expandable, i) => {
      this._setHeight(expandable, openExpandables[i]);
    });

    // Cause the browser to do a layout and set the heights of the elements
    // with a transition duration of zero.
    this.expandables[0].trigger.offsetWidth; // eslint-disable-line no-unused-expressions

    // Now that everything has been reset, enable transitions again.
    this.expandables.forEach((expandable, i) => {
      expandable.target.style.transitionDuration = '';
      if (openExpandables[i]) {
        expandable.open();
      }
    });
  }

  /**
   * When an item is clicked, we animate the accordion.
   * @override
   */
  toggleVisibility(id) {
    this.expandables.forEach((expandable) => {
      this._animateHeight(expandable, expandable.id === id);
    });
    super.toggleVisibility(id);
    this._scrollToSelected(id);
  }

  /**
   * On load and any other time the DOM updates, this function will save the offsets
   * of each accordion item into an object so we don't have to read the DOM every time.
   * @private
   * @return {Array.<{id: string, offset: number}>}
   */
  _getOffsets() {
    const scrollY = window.pageYOffset;
    return this.expandables.map(expandable => ({
      id: expandable.id,
      offset: scrollY + expandable.trigger.getBoundingClientRect().top,
    }));
  }

  /**
   * When called we will check the accordion's position in the viewport and scroll
   * the user into view if needed.
   * @param {string} id The id of the ExpandableItem that was clicked.
   * @private
   */
  _scrollToSelected(id) {
    const item = this._expandableOffsets.find(item => item.id === id);
    if (item.offset < window.pageYOffset) {
      scrollTo(item.offset, 300);
    }
  }

  /**
   * Sets the height of a given Expandable item.
   * @param {Expandable} expandable The Expandable instance to modify.
   * @param {boolean} setToOpen Whether we setting the Expandable to it's open state.
   */
  _setHeight(expandable, setToOpen) {
    const contentHeight = setToOpen ? expandable.target.firstElementChild.offsetHeight : 0;
    expandable.target.style.height = `${contentHeight}px`;
  }

  /**
   * Called if we need to alter the Expandable state. Only does so if either the same
   * Expandable that is open is clicked or another one was clicked and this one needs
   * to be closed.
   * @param {Expandable} expandable The expandable to test and potentially alter.
   * @param {boolean} isTarget Whether or not the current expandable was the one clicked.
   */
  _animateHeight(expandable, isTarget) {
    if (isTarget || expandable.isOpen) {
      this._setHeight(expandable, !expandable.isOpen);
    }
  }

  /**
   * Remove the resize handler and dispose.
   * @override
   */
  dispose() {
    super.dispose();
    OdoWindowEvents.remove(this._resizeId);
  }
}

export default ExpandableAccordion;
