/**
 * @fileoverview
 *
 * @author Matt Zaso
 */
import Settings from './expandable-settings';
import Expandable from './expandable';

class ExpandableGroup {
  constructor(elements) {
    this._elements = elements;

    this._expandables = elements.map((trigger) => {
      return new Expandable(trigger.getAttribute(Settings.Attribute.TRIGGER), { groupedItem: true });
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
   * Dispose this instance and its handlers.
   */
  dispose() {
    document.body.removeEventListener('click', this._onTriggerClick);
    this._expandables.forEach(item => item.dispose());
  }
}

export default ExpandableGroup;
