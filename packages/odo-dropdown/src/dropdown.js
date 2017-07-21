import OdoDevice from '@odopod/odo-device';
import { animation, dom, style } from '@odopod/odo-helpers';
import OdoBaseComponent from '@odopod/odo-base-component';

let id = 0;
function uniqueId() {
  id += 1;
  return 'ododropdown-' + id;
}

class Dropdown extends OdoBaseComponent {
  constructor(element, options = {}) {
    super(element);

    /**
     * Override any defaults with the given options.
     * @type {Object}
     */
    this.options = Object.assign({}, Dropdown.Defaults, options);

    /**
     * Unique id for this instance.
     * @type {string}
     */
    this.id = uniqueId();

    /**
     * Whether the dropdown is currently open.
     * @type {boolean}
     */
    this._isOpen = false;

    /**
     * The <select> element.
     * @type {HTMLSelectElement}
     */
    this._select = this.getElementByClass(Dropdown.Classes.SELECT);

    // Give the select an id if it doesn't have one.
    dom.giveId(this._select, this.id);

    /**
     * The <label> for the <select>.
     * @type {?HTMLLabelElement}
     */
    this._label = document.querySelector(`label[for="${this._select.id}"]`);

    // Generate the custom markup for options.
    if (this.options.insertMarkup) {
      this._insertMarkup();
    }

    // Save Element references.
    this._optionsContainer = this.getElementByClass(Dropdown.Classes.OPTIONS_CONTAINER);
    this._button = this.getElementByClass(Dropdown.Classes.BUTTON);
    this._placeholder = this.getElementByClass(Dropdown.Classes.DEFAULT);
    this._valueContainer = this.getElementByClass(Dropdown.Classes.VALUE);

    // Set the selected option.
    this._selectedOption = this._getCustomSelectedOption();

    this._onSelectChange = this._handleSelectChange.bind(this);
    this._onPageClick = this._handlePageClick.bind(this);
    this._onButtonClick = this._showOptions.bind(this);
    this._onKey = this._handleKey.bind(this);

    this._transitionId = null;

    this._initialize();
  }

  /**
   * Determines whether to create custom dropdown module,
   * or use native select element
   */
  _initialize() {
    this._valueContainer.setAttribute('aria-hidden', true);

    if (this.options.useNative) {
      this._initializeNativeDropdown();
    } else {
      this._initializeCustomDropdown();
    }
  }

  /**
   * Return the selected custom option element.
   * @return {Element}
   */
  _getCustomSelectedOption() {
    return this.getCustomOptions()[this._select.selectedIndex];
  }

  /**
   * Insert the custom option html markup before the <select> element.
   */
  _insertMarkup() {
    const markup = this.getCustomOptionsHtml();
    this._select.insertAdjacentHTML('beforebegin', markup);
  }

  /**
   * Listen for change events on the <select>.
   */
  _initializeNativeDropdown() {
    this.element.classList.add(Dropdown.Classes.BASE_NATIVE);
    this._select.addEventListener('change', this._onSelectChange);

    // Hide the <button> from the screen reader so that it only reads the
    // <select> element. The <select> is actually positioned on top of the
    // <button> with zero opacity.
    this._button.setAttribute('aria-hidden', true);
    this._button.tabIndex = -1;
  }

  /**
   * Listen for clicks to trigger the menu and keyboard input.
   */
  _initializeCustomDropdown() {
    if (this._label) {
      dom.giveId(this._label, this.id + '-label');
      const id = this._label.id;
      this._optionsContainer.setAttribute('aria-labelledby', id);
    }

    this._select.tabIndex = -1;
    this._select.setAttribute('aria-hidden', true);
    this._button.setAttribute('aria-haspopup', 'true');
    this._button.setAttribute('aria-controls', this._select.id);
    this._button.setAttribute('aria-expanded', false);

    this._toggleButtonListener(true);
    this.element.addEventListener('keydown', this._onKey);
  }

  /**
   * Key down event occured.
   * @param {KeyboardEvent} e Event object.
   */
  _handleKey(e) {
    const code = e.which;

    if (this._isOpen) {
      switch (code) {
        case Dropdown.Key.ESC:
        case Dropdown.Key.TAB:
          this._hideOptions();
          break;

        case Dropdown.Key.DOWN:
        case Dropdown.Key.UP:
          e.preventDefault();
          Dropdown._moveFocus(code === Dropdown.Key.DOWN);
          break;

        case Dropdown.Key.SPACE:
        case Dropdown.Key.ENTER:
          e.preventDefault();
          this._selectOption(e.target);
          break;
        // no default
      }
    } else {
      switch (code) {
        case Dropdown.Key.SPACE:
        case Dropdown.Key.DOWN:
        case Dropdown.Key.UP:
        case Dropdown.Key.ENTER:
          e.preventDefault();
          this._showOptions();
          break;
        // no default
      }
    }
  }

  /**
   * Transer focus from one option to the next or prev enabled option.
   * @param {boolean} isNext Whether to focus on the next or previous option.
   */
  static _moveFocus(isNext) {
    const selector = Dropdown.Selector.ENABLED_OPTION;
    const enabledOption = isNext ?
      Dropdown._nextMatch(document.activeElement, selector) :
      Dropdown._prevMatch(document.activeElement, selector);

    if (enabledOption) {
      enabledOption.focus();
    }
  }

  /**
   * Find the next sibling which matches a selector.
   * @param {Element} element Element to test.
   * @param {string} selector Selector to match.
   * @return {?Element} The element or null if there isn't one.
   */
  static _nextMatch(element, selector) {
    while ((element = element.nextElementSibling)) { // eslint-disable-line
      if (element.matches(selector)) {
        return element;
      }
    }

    return null;
  }

  /**
   * Find the previous sibling which matches a selector.
   * @param {Element} element Element to test.
   * @param {string} selector Selector to match.
   * @return {?Element} The element or null if there isn't one.
   */
  static _prevMatch(element, selector) {
    while ((element = element.previousElementSibling)) { // eslint-disable-line
      if (element.matches(selector)) {
        return element;
      }
    }

    return null;
  }

  /**
   * Delegated click event on the document. Check to see if it was an option,
   * otherwise hide the dropdown menu.
   * @param {MouseEvent} e Event object.
   */
  _handlePageClick(e) {
    const option = e.target.closest('.' + Dropdown.Classes.OPTION);
    if (option) {
      this._selectOption(option);
    } else {
      this._hideOptions();
    }
  }

  /**
   * Set the current value from an option element.
   * @param {Element} option Custom option element.
   */
  _selectOption(option) {
    // Avoid selecting disabled options or a target which is not an option (if
    // the user rapidly presses space|enter, this method could be called with
    // an event target which is not an option element because the transition
    // hasn't finished).
    if (option.classList.contains(Dropdown.Classes.OPTION_DISABLED) ||
        !option.classList.contains(Dropdown.Classes.OPTION)) {
      return;
    }

    const value = option.getAttribute('data-value');
    this.value = value;
    this._hideOptions();

    // Emit event to notify watchers that this has changed.
    this.emit(Dropdown.EventType.CHANGE, {
      name: this.select.name,
      value: this.value,
    });
  }

  /**
   * The native <select> input changed. Update the display.
   */
  _handleSelectChange() {
    this.value = this._select.value;

    // Emit event to notify watchers that this has changed.
    this.emit(Dropdown.EventType.CHANGE, {
      name: this.select.name,
      value: this.value,
    });
  }

  /**
   * Add or remove click listener for custom select display element
   * @params {boolean} add Whether to add or remove click listener
   */
  _toggleButtonListener(add) {
    if (add) {
      this._button.addEventListener('click', this._onButtonClick);
    } else {
      this._button.removeEventListener('click', this._onButtonClick);
    }
  }

  /**
   * Show the options dropdown menu.
   */
  _showOptions() {
    this._isOpen = true;

    // Clear any pending transition ends.
    animation.cancelTransitionEnd(this._transitionId);

    // Remove click listener on button.
    this._toggleButtonListener(false);

    this.element.classList.add(Dropdown.Classes.OPEN);
    this._optionsContainer.setAttribute('aria-hidden', false);
    this._button.setAttribute('aria-expanded', true);
    this._button.tabIndex = -1;
    style.causeLayout(this._optionsContainer);
    this._optionsContainer.classList.add(Dropdown.Classes.OPTIONS_CONTAINER_OPEN);
    this._transitionId = animation.onTransitionEnd(this._optionsContainer,
      this._handleOptionsShown, this);
  }

  /**
   * Options dropdown finished show animation.
   */
  _handleOptionsShown() {
    document.body.addEventListener('click', this._onPageClick);

    // If all the options are disabled, a selected option doesn't exist.
    if (this._selectedOption) {
      this._selectedOption.focus();
    }
  }

  /**
   * Hide the options dropdown.
   */
  _hideOptions() {
    this._isOpen = false;

    // Clear any pending transition ends.
    animation.cancelTransitionEnd(this._transitionId);

    document.body.removeEventListener('click', this._onPageClick);
    this._optionsContainer.setAttribute('aria-hidden', true);
    this._button.tabIndex = 0;
    this._button.setAttribute('aria-expanded', false);
    this._optionsContainer.classList.remove(Dropdown.Classes.OPTIONS_CONTAINER_OPEN);
    this._transitionId = animation.onTransitionEnd(this._optionsContainer,
      this._handleOptionsHidden, this);
  }

  /**
   * Options dropdown finished hiding.
   */
  _handleOptionsHidden() {
    this.element.classList.remove(Dropdown.Classes.OPEN);
    this._button.focus();
    this._toggleButtonListener(true);
  }

  /**
   * Generate the HTML to show on non-touch devices.
   * @return {string} A string of HTML.
   * @protected
   */
  getCustomOptionsHtml() {
    return `<div class="${Dropdown.Classes.OPTIONS_CONTAINER}" role="menu" aria-hidden="true">` +
      this.getOptionsMarkup() +
      '</div>';
  }

  /**
   * Generate an HTML string for custom options based on the current options
   * in the <select>
   * @return {string} Markup.
   * @protected
   */
  getOptionsMarkup() {
    return this.getNativeOptions().reduce((str, option) => str + this.getOptionMarkup(option), '');
  }

  /**
   * Create an HTML string to be used for a custom option.
   * @param {HTMLOptionElement} option Native option element.
   * @return {string} Markup.
   * @protected
   */
  getOptionMarkup(option) {
    const selected = option.selected ? ' ' + Dropdown.Classes.OPTION_SELECTED : '';
    const disabled = option.disabled ? ' ' + Dropdown.Classes.OPTION_DISABLED : '';
    const className = Dropdown.Classes.OPTION + selected + disabled;
    return `<div class="${className}" data-value="${option.value}" tabindex="-1" role="menuitem">` +
      option.text + '</div>';
  }

  /**
   * Return an array of custom option elements.
   * @return {Array.<HTMLDivElement>}
   */
  getCustomOptions() {
    return this.getElementsByClass(Dropdown.Classes.OPTION);
  }

  /**
   * Return an array of option elements.
   * @return {Array.<HTMLOptionElement>}
   */
  getNativeOptions() {
    return Array.from(this.select.options);
  }

  /**
   * Retrieve the text to display inside the button.
   * @param {number} selectedIndex Index of the selected option.
   * @return {string} Text to display.
   * @protected
   */
  getDisplayText(selectedIndex) {
    return this.select.options[selectedIndex].text;
  }

  /**
   * Retrieve the selected index of the <select>
   * @return {number}
   */
  get selectedIndex() {
    return this._select.selectedIndex;
  }

  /**
   * Set the selected option by index.
   * @param {number} index Index to select.
   */
  set selectedIndex(index) {
    this.value = this._select.options[index].value;
  }

  /**
   * Returns the <select>.
   * @return {HTMLSelectElement}
   */
  get select() {
    return this._select;
  }

  /**
   * Returns the button to open the select menu.
   * @return {HTMLButtonElement}
   */
  get button() {
    return this._button;
  }

  /**
   * Return the display text for the currently selected option.
   * @returns {string}
   */
  get selectedText() {
    return this._select.options[this._select.selectedIndex].text;
  }

  /**
   * Retrieve the selected value.
   * @return {string}
   */
  get value() {
    return this._select.value;
  }

  /**
   * Set the value of the <select> and the custom menu.
   * @param {string} value Value which matches one of the options.
   */
  set value(value) {
    // Remove the old selected class.
    if (this._selectedOption) {
      this._selectedOption.classList.remove(Dropdown.Classes.OPTION_SELECTED);
    }

    // Set new value.
    this._select.value = value;

    // Update currently selected option.
    this._selectedOption = this._getCustomSelectedOption();

    if (this._selectedOption) {
      // Read the text for the new value.
      const text = this.getDisplayText(this.selectedIndex);

      this._selectedOption.classList.add(Dropdown.Classes.OPTION_SELECTED);

      // Update display.
      this._placeholder.style.display = 'none';
      this._placeholder.setAttribute('aria-hidden', true);
      this._valueContainer.textContent = text;
      this._valueContainer.removeAttribute('aria-hidden');
    } else {
      this._placeholder.style.display = '';
      this._placeholder.removeAttribute('aria-hidden');
      this._valueContainer.textContent = '';
      this._valueContainer.setAttribute('aria-hidden', true);
    }
  }

  /**
   * Get the disabled state of the component.
   * @return {boolean}
   */
  get disabled() {
    return this.select.disabled;
  }

  /**
   * Set the disabled state of the component.
   * @param {boolean} isDisabled Whether it's disabled or not.
   */
  set disabled(isDisabled) {
    this.select.disabled = isDisabled;
    this.button.disabled = isDisabled;
  }

  /**
   * Toggle the state of an option.
   * @param {string} value Value of the option to toggle.
   * @param {boolean} isDisabled Whether to disable it or not.
   * @return {Dropdown} This instance for chaining.
   */
  toggleOptionByValue(value, isDisabled) {
    const customOption = this._optionsContainer.querySelector(`[data-value="${value}"]`);
    const nativeOption = this._select.querySelector(`[value="${value}"]`);

    customOption.classList.toggle(Dropdown.Classes.OPTION_DISABLED, isDisabled);
    if (isDisabled) {
      customOption.setAttribute('aria-disabled', true);
    } else {
      customOption.removeAttribute('aria-disabled');
    }

    nativeOption.disabled = isDisabled;

    return this;
  }

  /**
   * Disable an option.
   * @param {string} value Value of the option to disable.
   * @return {Dropdown} This instance.
   */
  disableOptionByValue(value) {
    return this.toggleOptionByValue(value, true);
  }

  /**
   * Enable an option.
   * @param {string} value Value of the option to enable.
   * @return {Dropdown} This instance.
   */
  enableOptionByValue(value) {
    return this.toggleOptionByValue(value, false);
  }

  dispose() {
    this._select.removeEventListener('change', this._onSelectChange);
    this._button.removeEventListener('click', this._onButtonClick);
    document.body.removeEventListener('click', this._onPageClick);
    this._optionsContainer.parentNode.removeChild(this._optionsContainer);

    // Prefer resetting the tabIndex property by using removeAttribute to lets the
    // browser decide if it should go back to 0 (like if it was a button) or to
    // -1 if it wasn't originally focusable.
    this._select.removeAttribute('tabindex');
    this._select.removeAttribute('aria-hidden');
    this._button.removeAttribute('tabindex');
    this._button.removeAttribute('aria-hidden');
    this._button.removeAttribute('aria-haspopup');
    this._button.removeAttribute('aria-controls');
    this._button.removeAttribute('aria-expanded');

    this._selectedOption = null;
    this._optionsContainer = null;
    this._button = null;
    this._placeholder = null;
    this._valueContainer = null;
    this._select = null;
    super.dispose();
  }
}

Dropdown.Classes = {
  BASE: 'odo-dropdown',
  OPEN: 'odo-dropdown--open',
  BUTTON: 'odo-dropdown__button',
  OPTIONS_CONTAINER_OPEN: 'odo-dropdown__options--open',
  OPTIONS_CONTAINER: 'odo-dropdown__options',
  OPTION: 'odo-dropdown__option',
  OPTION_SELECTED: 'odo-dropdown__option--active',
  OPTION_DISABLED: 'odo-dropdown__option--disabled',
  SELECT: 'odo-dropdown__select',
  VALUE: 'odo-dropdown__value',
  DEFAULT: 'odo-dropdown__default',
  BASE_NATIVE: 'odo-dropdown--native',
};

Dropdown.Key = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  UP: 38,
  DOWN: 40,
};

Dropdown.EventType = {
  CHANGE: 'ododropdown:change',
};

Dropdown.Selector = {
  ENABLED_OPTION: `.${Dropdown.Classes.OPTION}:not(.${Dropdown.Classes.OPTION_DISABLED})`,
};

Dropdown.Defaults = {
  insertMarkup: true,
  useNative: OdoDevice.HAS_TOUCH_EVENTS,
};

export default Dropdown;
