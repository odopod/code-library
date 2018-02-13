/**
 * @fileoverview A subclass of ExpandableGroup which includes some additional
 * features like scrolling and collapsing animations.
 *
 * @author Matt Zaso
 */
import { scrollTo } from '@odopod/odo-helpers';
import OdoWindowEvents from '@odopod/odo-window-events';
import Settings from './settings';
import ExpandableGroup from './expandable-group';

class ExpandableAccordion extends ExpandableGroup {
  constructor(elements) {
    super(elements);

    /**
     * @param {{item: number, offset: number}} Object A map of the expandable offsets.
     */
    this._expandableOffsets = null;

    this._saveOffsets();

    // Set the initial value of each element based on its state.
    this._expandables.forEach(item => this._setHeight(item, item.isOpen));

    // A resize handler for when the DOM updates.
    this._resizeId = OdoWindowEvents.onResize(this._handleResize.bind(this));
  }

  /**
   * Called by OdoWindowEvents when the browser is resized. Allows us to update
   * our saved offsets and animate to their new positions.
   *
   * @private
   */
  _handleResize() {
    this._saveOffsets();
    this._expandables.forEach(item => this._setHeight(item, item.isOpen));
  }

  /**
   * When an item is clicked, we animate the accordion.
   *
   * @override
   */
  toggleVisibility(selectedId) {
    this._scrollToSelected(selectedId);
    this._expandables.forEach(item => this._animateHeight(item, item.id === selectedId));
    super.toggleVisibility(selectedId);
  }

  /**
   * On load and any other time the DOM updates, this function will save the offsets
   * of each accordion item into an object so we don't have to read the DOM every time.
   *
   * @private
   */
  _saveOffsets() {
    const scrollY = window.pageYOffset;
    const containerOffset = scrollY + this._expandables[0].trigger.getBoundingClientRect().top;
    this._expandableOffsets = this._expandables.map((el, i) => {
      const offset = containerOffset + (i * el.target.firstElementChild.offsetHeight);
      return { id: el.id, offset };
    });
  }

  /**
   * When called we will check the accordion's position in the viewport and scroll
   * the user into view if needed.
   *
   * @param {number} targetId The id of the ExpandableItem that was clicked.
   * @private
   */
  _scrollToSelected(targetId) {
    const viewportTop = window.pageYOffset;
    const viewportBottom = viewportTop + window.innerHeight;
    const item = this._expandableOffsets.find(item => item.id === targetId);
    const itemOffset = item.offset;
    const isOutOfView = itemOffset < viewportTop || itemOffset > viewportBottom;
    if (isOutOfView) {
      scrollTo(itemOffset, 300);
    }
  }

  /**
   * Sets the height of a given Expandable item.
   *
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
   *
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
   *
   * @override
   */
  dispose() {
    super.dispose();
    OdoWindowEvents.remove(this._resizeId);
  }
}

Object.assign(ExpandableAccordion, Settings);

export default ExpandableAccordion;
