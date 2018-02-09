/**
 * @fileoverview A wrapper for multiple Expandable elements that will
 * allow them to operate coherently in an accordion type fashion.
 *
 * @author Matt Zaso
 */
import Settings from './expandable-settings';
import Expandable from './expandable';

class ExpandableGroup {
  constructor(elements) {
    /** @type {Array.<!Element>} */
    this._elements = elements;

    /** @type {Array.<!Expandable>} */
    this._expandables = elements.map((trigger) => {
      // Create new expandable instances and keep them in an array.
      const options = { groupedItem: true };
      return new Expandable(trigger.getAttribute(Settings.Attribute.TRIGGER), options);
    });

    this._bindListeners();
  }

  /**
   * Binds the listeners to the body to handle click events.
   * @private
   */
  _bindListeners() {
    this._onClick = this._onClickHandler.bind(this);
    document.body.addEventListener('click', this._onClick);
  }

  /**
   * Handler for clicks on the trigger.
   * @param {Event} evt Event object.
   * @private
   */
  _onClickHandler(evt) {
    evt.preventDefault();
    const closest = evt.target.closest(`[${Settings.Attribute.TRIGGER}]`);

    if (closest !== null && this._elements.includes(closest)) {
      this._toggleGroupVisibility(closest.getAttribute(Settings.Attribute.TRIGGER));
    }
  }

  /**
   * Will iterate over all grouped items and toggle the selected one while collapsing all others.
   * @param {int} selectedId The ID of the selected target to expand.
   * @private
   */
  _toggleGroupVisibility(selectedId) {
    this._expandables.forEach((expandable) => {
      if (expandable.id === selectedId) {
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
    document.body.removeEventListener('click', this._onTriggerClick);
    this._expandables.forEach(item => item.dispose());
  }
}

export default ExpandableGroup;
