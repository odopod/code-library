/**
 * @fileoverview An basic, expandable component that has both a trigger
 * and a target to open.
 *
 * @author Matt Zaso
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
    this._trigger = document.body.querySelector(`[${Settings.Attribute.TRIGGER}="${id}"]`);

    /** @type {Element} */
    this._target = document.body.querySelector(`[${Settings.Attribute.TARGET}="${id}"]`);

    this._setA11yAttributes();

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

    if (closest === this._trigger) {
      this.toggle();
    }
  }

  /**
   * Sets the appropriate ARIA attributes for a11y.
   * @private
   */
  _setA11yAttributes() {
    const elementId = `expandable-${this.id}`;

    this._trigger.setAttribute('aria-describedby', elementId);
    this._target.setAttribute('id', elementId);
    this._trigger.setAttribute('aria-expanded', this.isOpen.toString());
    this._trigger.setAttribute('aria-controls', elementId);
    this._target.setAttribute('aria-labelledby', elementId);
    this._target.setAttribute('aria-hidden', (!this.isOpen).toString());
  }

  /**
   * Removes the ARIA attributes assigned on instantiation.
   * @private
   */
  _removeA11yAttributes() {
    this._trigger.removeAttribute('aria-describedby');
    this._target.removeAttribute('id');
    this._trigger.removeAttribute('aria-expanded');
    this._target.removeAttribute('aria-labelledby');
    this._target.removeAttribute('aria-hidden');
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
    this._target.classList.add(Settings.ClassName.TARGET_OPEN);
    this._trigger.classList.add(Settings.ClassName.TRIGGER_OPEN);
    this._trigger.setAttribute('aria-expanded', 'true');
    this._target.setAttribute('aria-hidden', 'false');
  }

  /**
   * Closes the expandable.
   */
  close() {
    this._target.classList.remove(Settings.ClassName.TARGET_OPEN);
    this._trigger.classList.remove(Settings.ClassName.TRIGGER_OPEN);
    this._trigger.setAttribute('aria-expanded', 'false');
    this._target.setAttribute('aria-hidden', 'true');
  }

  get isOpen() {
    return this._target.classList.contains(Settings.ClassName.TARGET_OPEN);
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

  /**
   * Instantiates a single instance of the Expandable Item.
   *
   * @param {Element} element Either a trigger or target.
   * @return {ExpandableItem} the instance of the Expandable Item.
   * @public
   */
  static initialize(element) {
    const triggerId = element.getAttribute(Settings.Attribute.TRIGGER);
    const targetId = element.getAttribute(Settings.Attribute.TARGET);
    const id = targetId || triggerId;

    return new ExpandableItem(id);
  }
}

Object.assign(ExpandableItem, Settings);

export default ExpandableItem;
