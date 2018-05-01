/**
 * @fileoverview An basic, expandable component that has both a trigger
 * and a target to open.
 *
 * @author Matt Zaso <matt.zaso@odopod.com>
 */
import Settings from './settings';

class ExpandableItem {
  constructor(id, options = {}) {
    /** @type {string} */
    this.id = id;

    /**
     * Override any defaults with the given options.
     * @type {Object}
     */
    this.options = Object.assign({}, Settings.Defaults, options);

    /** @type {Element} */
    this.trigger = document.body.querySelector(`[${Settings.Attribute.TRIGGER}="${id}"]`);

    /** @type {Element} */
    this.target = document.body.querySelector(`[${Settings.Attribute.TARGET}="${id}"]`);

    /** @type {boolean} */
    this.isOpen = this.target.classList.contains(Settings.ClassName.TARGET_OPEN);

    this._setA11yAttributes();

    if (this.isOpen) {
      this.open();
    }

    if (!this.options.groupedItem) {
      this._onTriggerClick = this._triggerClickHandler.bind(this);
      document.body.addEventListener('click', this._onTriggerClick);
    }
  }

  /**
   * Handler for clicks on the trigger.
   * @param {Event} evt Event object.
   * @private
   */
  _triggerClickHandler(evt) {
    evt.preventDefault();
    const closest = evt.target.closest(`[${Settings.Attribute.TRIGGER}]`);

    if (closest === this.trigger) {
      this.toggle();
    }
  }

  /**
   * Sets the appropriate ARIA attributes for a11y.
   * @private
   */
  _setA11yAttributes() {
    const elementId = `expandable-${this.id}`;

    this.trigger.setAttribute('aria-describedby', elementId);
    this.target.setAttribute('id', elementId);
    this.trigger.setAttribute('aria-expanded', this.isOpen.toString());
    this.trigger.setAttribute('aria-controls', elementId);
    this.target.setAttribute('aria-labelledby', elementId);
    this.target.setAttribute('aria-hidden', (!this.isOpen).toString());
  }

  /**
   * Removes the ARIA attributes assigned on instantiation.
   * @private
   */
  _removeA11yAttributes() {
    this.trigger.removeAttribute('aria-describedby');
    this.target.removeAttribute('id');
    this.trigger.removeAttribute('aria-expanded');
    this.target.removeAttribute('aria-labelledby');
    this.target.removeAttribute('aria-hidden');
  }

  /**
   * Toggles the expandable's state (open/closed).
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Opens the expandable.
   */
  open() {
    this.target.classList.add(Settings.ClassName.TARGET_OPEN);
    this.trigger.classList.add(Settings.ClassName.TRIGGER_OPEN);
    this.trigger.setAttribute('aria-expanded', 'true');
    this.target.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
  }

  /**
   * Closes the expandable.
   */
  close() {
    this.target.classList.remove(Settings.ClassName.TARGET_OPEN);
    this.trigger.classList.remove(Settings.ClassName.TRIGGER_OPEN);
    this.trigger.setAttribute('aria-expanded', 'false');
    this.target.setAttribute('aria-hidden', 'true');
    this.isOpen = false;
  }

  /**
   * Dispose this instance and its handlers.
   */
  dispose() {
    if (!this.options.groupedItem) {
      document.body.removeEventListener('click', this._onTriggerClick);
    }

    this._removeA11yAttributes();
  }
}

Object.assign(ExpandableItem, Settings);

export default ExpandableItem;
