/**
 * @fileoverview An basic, expandable component that has both a trigger
 * and a target to open.
 *
 * @author Matt Zaso
 */
import Settings from './settings';
import ExpandableGroup from './expandable-group';

class Expandable {
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
    this._target.setAttribute('role', 'region');
    this._target.setAttribute('aria-expanded', 'true');
  }

  /**
   * Removes the ARIA attributes assigned on instantiation.
   * @private
   */
  _removeA11yAttributes() {
    this._trigger.removeAttribute('aria-describedby');
    this._target.removeAttribute('id');
    this._target.removeAttribute('role');
    this._target.removeAttribute('aria-expanded');
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
    this._target.setAttribute('aria-expanded', 'true');
  }

  /**
   * Closes the expandable.
   */
  close() {
    this._target.classList.remove(Settings.ClassName.TARGET_OPEN);
    this._trigger.classList.remove(Settings.ClassName.TRIGGER_OPEN);
    this._target.setAttribute('aria-expanded', 'false');
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
   * Instantiates all instances of the expandable. Groups are instantiated separate from
   * Expandables and require different parameters. This helper chunks out and groups the
   * grouped expandables before instantiating all of them.
   *
   * @return {Array.<Expandable, ExpandableGroup>} all instances of both types.
   * @public
   */
  static initializeAll() {
    const elements = Array.from(document.querySelectorAll(`[${Settings.Attribute.TRIGGER}]`));

    const single = [];
    const groups = [];
    const groupIds = [];

    elements.forEach((item) => {
      if (item.getAttribute(Settings.Attribute.GROUP)) {
        const groupId = item.getAttribute(Settings.Attribute.GROUP);
        if (groupIds.indexOf(groupId) < 0) {
          groups.push(elements.filter(el => el.getAttribute(Settings.Attribute.GROUP) === groupId));
          groupIds.push(groupId);
        }
      } else {
        single.push(item);
      }
    });

    const singleInstances =
      single.map(trigger => new Expandable(trigger.getAttribute(Settings.Attribute.TRIGGER)));
    const groupInstances = groups.map(grouping => new ExpandableGroup(grouping));

    return singleInstances.concat(groupInstances);
  }
}

Object.assign(Expandable, Settings);

export default Expandable;
