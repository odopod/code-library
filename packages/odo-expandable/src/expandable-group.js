/**
 * @fileoverview A wrapper for multiple Expandable elements that will
 * allow them to operate coherently in an accordion type fashion.
 *
 * @author Matt Zaso <matt.zaso@odopod.com>
 */
import Settings from './settings';
import ExpandableItem from './expandable-item';

class ExpandableGroup {
  constructor(elements) {
    /** @type {Array.<!Element>} */
    this._elements = elements;

    /**
     * @type {Array.<!ExpandableItem>}
     * @protected
     */
    this.expandables = elements.map(trigger => new ExpandableItem(
      trigger.getAttribute(Settings.Attribute.TRIGGER),
      { groupedItem: true },
    ));

    this._onClick = this._onClickHandler.bind(this);
    document.body.addEventListener('click', this._onClick);
  }

  /**
   * Handler for clicks on the trigger.
   * @param {MouseEvent} evt Event object.
   * @private
   */
  _onClickHandler(evt) {
    evt.preventDefault();
    const closest = evt.target.closest(`[${Settings.Attribute.TRIGGER}]`);

    if (this._elements.includes(closest)) {
      this.toggleVisibility(closest.getAttribute(Settings.Attribute.TRIGGER));
    }
  }

  /**
   * Will iterate over all grouped items and toggle the selected one while collapsing all others.
   * @param {string} id The ID of the selected target to expand.
   * @private
   */
  toggleVisibility(id) {
    this.expandables.forEach((expandable) => {
      if (expandable.id === id) {
        expandable.toggle();
      } else {
        expandable.close();
      }
    });
  }

  /**
   * Dispose this instance and its handlers. Will also dispose all child
   * instances.
   * @public
   */
  dispose() {
    document.body.removeEventListener('click', this._onClick);
    this.expandables.forEach(item => item.dispose());
  }
}

Object.assign(ExpandableGroup, Settings);

export default ExpandableGroup;
