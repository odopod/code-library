(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-device'), require('@odopod/odo-helpers'), require('@odopod/odo-base-component')) :
	typeof define === 'function' && define.amd ? define(['@odopod/odo-device', '@odopod/odo-helpers', '@odopod/odo-base-component'], factory) :
	(global.OdoDropdown = factory(global.OdoDevice,global.OdoHelpers,global.OdoBaseComponent));
}(this, (function (OdoDevice,odoHelpers,OdoBaseComponent) { 'use strict';

OdoDevice = OdoDevice && OdoDevice.hasOwnProperty('default') ? OdoDevice['default'] : OdoDevice;
OdoBaseComponent = OdoBaseComponent && OdoBaseComponent.hasOwnProperty('default') ? OdoBaseComponent['default'] : OdoBaseComponent;

var babelHelpers = {};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



babelHelpers;

var id = 0;
function uniqueId() {
  id += 1;
  return 'ododropdown-' + id;
}

var Dropdown = function (_OdoBaseComponent) {
  inherits(Dropdown, _OdoBaseComponent);

  function Dropdown(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Dropdown);

    /**
     * Override any defaults with the given options.
     * @type {Object}
     */
    var _this = possibleConstructorReturn(this, _OdoBaseComponent.call(this, element));

    _this.options = Object.assign({}, Dropdown.Defaults, options);

    /**
     * Unique id for this instance.
     * @type {string}
     */
    _this.id = uniqueId();

    /**
     * Whether the dropdown is currently open.
     * @type {boolean}
     */
    _this._isOpen = false;

    /**
     * The <select> element.
     * @type {HTMLSelectElement}
     */
    _this._select = _this.getElementByClass(Dropdown.Classes.SELECT);

    // Give the select an id if it doesn't have one.
    odoHelpers.dom.giveId(_this._select, _this.id);

    /**
     * The <label> for the <select>.
     * @type {?HTMLLabelElement}
     */
    _this._label = document.querySelector('label[for="' + _this._select.id + '"]');

    // Generate the custom markup for options.
    if (_this.options.insertMarkup) {
      _this._insertMarkup();
    }

    // Save Element references.
    _this._optionsContainer = _this.getElementByClass(Dropdown.Classes.OPTIONS_CONTAINER);
    _this._button = _this.getElementByClass(Dropdown.Classes.BUTTON);
    _this._placeholder = _this.getElementByClass(Dropdown.Classes.DEFAULT);
    _this._valueContainer = _this.getElementByClass(Dropdown.Classes.VALUE);

    // Set the selected option.
    _this._selectedOption = _this._getCustomSelectedOption();

    _this._onSelectChange = _this._handleSelectChange.bind(_this);
    _this._onPageClick = _this._handlePageClick.bind(_this);
    _this._onButtonClick = _this._showOptions.bind(_this);
    _this._onKey = _this._handleKey.bind(_this);

    _this._transitionId = null;

    _this._initialize();
    return _this;
  }

  /**
   * Determines whether to create custom dropdown module,
   * or use native select element
   */


  Dropdown.prototype._initialize = function _initialize() {
    this._valueContainer.setAttribute('aria-hidden', true);

    if (this.options.useNative) {
      this._initializeNativeDropdown();
    } else {
      this._initializeCustomDropdown();
    }
  };

  /**
   * Return the selected custom option element.
   * @return {Element}
   */


  Dropdown.prototype._getCustomSelectedOption = function _getCustomSelectedOption() {
    return this.getCustomOptions()[this._select.selectedIndex];
  };

  /**
   * Insert the custom option html markup before the <select> element.
   */


  Dropdown.prototype._insertMarkup = function _insertMarkup() {
    var markup = this.getCustomOptionsHtml();
    this._select.insertAdjacentHTML('beforebegin', markup);
  };

  /**
   * Listen for change events on the <select>.
   */


  Dropdown.prototype._initializeNativeDropdown = function _initializeNativeDropdown() {
    this.element.classList.add(Dropdown.Classes.BASE_NATIVE);
    this._select.addEventListener('change', this._onSelectChange);

    // Hide the <button> from the screen reader so that it only reads the
    // <select> element. The <select> is actually positioned on top of the
    // <button> with zero opacity.
    this._button.setAttribute('aria-hidden', true);
    this._button.tabIndex = -1;
  };

  /**
   * Listen for clicks to trigger the menu and keyboard input.
   */


  Dropdown.prototype._initializeCustomDropdown = function _initializeCustomDropdown() {
    if (this._label) {
      odoHelpers.dom.giveId(this._label, this.id + '-label');
      var _id = this._label.id;
      this._optionsContainer.setAttribute('aria-labelledby', _id);
    }

    this._select.tabIndex = -1;
    this._select.setAttribute('aria-hidden', true);
    this._button.setAttribute('aria-haspopup', 'true');
    this._button.setAttribute('aria-controls', this._select.id);
    this._button.setAttribute('aria-expanded', false);

    this._toggleButtonListener(true);
    this.element.addEventListener('keydown', this._onKey);
  };

  /**
   * Key down event occured.
   * @param {KeyboardEvent} e Event object.
   */


  Dropdown.prototype._handleKey = function _handleKey(e) {
    var code = e.which;

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
  };

  /**
   * Transer focus from one option to the next or prev enabled option.
   * @param {boolean} isNext Whether to focus on the next or previous option.
   */


  Dropdown._moveFocus = function _moveFocus(isNext) {
    var selector = Dropdown.Selector.ENABLED_OPTION;
    var enabledOption = isNext ? Dropdown._nextMatch(document.activeElement, selector) : Dropdown._prevMatch(document.activeElement, selector);

    if (enabledOption) {
      enabledOption.focus();
    }
  };

  /**
   * Find the next sibling which matches a selector.
   * @param {Element} element Element to test.
   * @param {string} selector Selector to match.
   * @return {?Element} The element or null if there isn't one.
   */


  Dropdown._nextMatch = function _nextMatch(element, selector) {
    while (element = element.nextElementSibling) {
      // eslint-disable-line
      if (element.matches(selector)) {
        return element;
      }
    }

    return null;
  };

  /**
   * Find the previous sibling which matches a selector.
   * @param {Element} element Element to test.
   * @param {string} selector Selector to match.
   * @return {?Element} The element or null if there isn't one.
   */


  Dropdown._prevMatch = function _prevMatch(element, selector) {
    while (element = element.previousElementSibling) {
      // eslint-disable-line
      if (element.matches(selector)) {
        return element;
      }
    }

    return null;
  };

  /**
   * Delegated click event on the document. Check to see if it was an option,
   * otherwise hide the dropdown menu.
   * @param {MouseEvent} e Event object.
   */


  Dropdown.prototype._handlePageClick = function _handlePageClick(e) {
    var option = e.target.closest('.' + Dropdown.Classes.OPTION);
    if (option) {
      this._selectOption(option);
    } else {
      this._hideOptions();
    }
  };

  /**
   * Set the current value from an option element.
   * @param {Element} option Custom option element.
   */


  Dropdown.prototype._selectOption = function _selectOption(option) {
    // Avoid selecting disabled options or a target which is not an option (if
    // the user rapidly presses space|enter, this method could be called with
    // an event target which is not an option element because the transition
    // hasn't finished).
    if (option.classList.contains(Dropdown.Classes.OPTION_DISABLED) || !option.classList.contains(Dropdown.Classes.OPTION)) {
      return;
    }

    var value = option.getAttribute('data-value');
    this.value = value;
    this._hideOptions();

    // Emit event to notify watchers that this has changed.
    this.emit(Dropdown.EventType.CHANGE, {
      name: this.select.name,
      value: this.value
    });
  };

  /**
   * The native <select> input changed. Update the display.
   */


  Dropdown.prototype._handleSelectChange = function _handleSelectChange() {
    this.value = this._select.value;

    // Emit event to notify watchers that this has changed.
    this.emit(Dropdown.EventType.CHANGE, {
      name: this.select.name,
      value: this.value
    });
  };

  /**
   * Add or remove click listener for custom select display element
   * @params {boolean} add Whether to add or remove click listener
   */


  Dropdown.prototype._toggleButtonListener = function _toggleButtonListener(add) {
    if (add) {
      this._button.addEventListener('click', this._onButtonClick);
    } else {
      this._button.removeEventListener('click', this._onButtonClick);
    }
  };

  /**
   * Show the options dropdown menu.
   */


  Dropdown.prototype._showOptions = function _showOptions() {
    this._isOpen = true;

    // Clear any pending transition ends.
    odoHelpers.animation.cancelTransitionEnd(this._transitionId);

    // Remove click listener on button.
    this._toggleButtonListener(false);

    this.element.classList.add(Dropdown.Classes.OPEN);
    this._optionsContainer.setAttribute('aria-hidden', false);
    this._button.setAttribute('aria-expanded', true);
    this._button.tabIndex = -1;
    odoHelpers.style.causeLayout(this._optionsContainer);
    this._optionsContainer.classList.add(Dropdown.Classes.OPTIONS_CONTAINER_OPEN);
    this._transitionId = odoHelpers.animation.onTransitionEnd(this._optionsContainer, this._handleOptionsShown, this);
  };

  /**
   * Options dropdown finished show animation.
   */


  Dropdown.prototype._handleOptionsShown = function _handleOptionsShown() {
    document.body.addEventListener('click', this._onPageClick);

    // If all the options are disabled, a selected option doesn't exist.
    if (this._selectedOption) {
      this._selectedOption.focus();
    }
  };

  /**
   * Hide the options dropdown.
   */


  Dropdown.prototype._hideOptions = function _hideOptions() {
    this._isOpen = false;

    // Clear any pending transition ends.
    odoHelpers.animation.cancelTransitionEnd(this._transitionId);

    document.body.removeEventListener('click', this._onPageClick);
    this._optionsContainer.setAttribute('aria-hidden', true);
    this._button.tabIndex = 0;
    this._button.setAttribute('aria-expanded', false);
    this._optionsContainer.classList.remove(Dropdown.Classes.OPTIONS_CONTAINER_OPEN);
    this._transitionId = odoHelpers.animation.onTransitionEnd(this._optionsContainer, this._handleOptionsHidden, this);
  };

  /**
   * Options dropdown finished hiding.
   */


  Dropdown.prototype._handleOptionsHidden = function _handleOptionsHidden() {
    this.element.classList.remove(Dropdown.Classes.OPEN);
    this._button.focus();
    this._toggleButtonListener(true);
  };

  /**
   * Generate the HTML to show on non-touch devices.
   * @return {string} A string of HTML.
   * @protected
   */


  Dropdown.prototype.getCustomOptionsHtml = function getCustomOptionsHtml() {
    return '<div class="' + Dropdown.Classes.OPTIONS_CONTAINER + '" role="menu" aria-hidden="true">' + this.getOptionsMarkup() + '</div>';
  };

  /**
   * Generate an HTML string for custom options based on the current options
   * in the <select>
   * @return {string} Markup.
   * @protected
   */


  Dropdown.prototype.getOptionsMarkup = function getOptionsMarkup() {
    var _this2 = this;

    return this.getNativeOptions().reduce(function (str, option) {
      return str + _this2.getOptionMarkup(option);
    }, '');
  };

  /**
   * Create an HTML string to be used for a custom option.
   * @param {HTMLOptionElement} option Native option element.
   * @return {string} Markup.
   * @protected
   */


  Dropdown.prototype.getOptionMarkup = function getOptionMarkup(option) {
    var selected = option.selected ? ' ' + Dropdown.Classes.OPTION_SELECTED : '';
    var disabled = option.disabled ? ' ' + Dropdown.Classes.OPTION_DISABLED : '';
    var className = Dropdown.Classes.OPTION + selected + disabled;
    return '<div class="' + className + '" data-value="' + option.value + '" tabindex="-1" role="menuitem">' + option.text + '</div>';
  };

  /**
   * Return an array of custom option elements.
   * @return {Array.<HTMLDivElement>}
   */


  Dropdown.prototype.getCustomOptions = function getCustomOptions() {
    return this.getElementsByClass(Dropdown.Classes.OPTION);
  };

  /**
   * Return an array of option elements.
   * @return {Array.<HTMLOptionElement>}
   */


  Dropdown.prototype.getNativeOptions = function getNativeOptions() {
    return Array.from(this.select.options);
  };

  /**
   * Retrieve the text to display inside the button.
   * @param {number} selectedIndex Index of the selected option.
   * @return {string} Text to display.
   * @protected
   */


  Dropdown.prototype.getDisplayText = function getDisplayText(selectedIndex) {
    return this.select.options[selectedIndex].text;
  };

  /**
   * Retrieve the selected index of the <select>
   * @return {number}
   */


  /**
   * Toggle the state of an option.
   * @param {string} value Value of the option to toggle.
   * @param {boolean} isDisabled Whether to disable it or not.
   * @return {Dropdown} This instance for chaining.
   */
  Dropdown.prototype.toggleOptionByValue = function toggleOptionByValue(value, isDisabled) {
    var customOption = this._optionsContainer.querySelector('[data-value="' + value + '"]');
    var nativeOption = this._select.querySelector('[value="' + value + '"]');

    customOption.classList.toggle(Dropdown.Classes.OPTION_DISABLED, isDisabled);
    if (isDisabled) {
      customOption.setAttribute('aria-disabled', true);
    } else {
      customOption.removeAttribute('aria-disabled');
    }

    nativeOption.disabled = isDisabled;

    return this;
  };

  /**
   * Disable an option.
   * @param {string} value Value of the option to disable.
   * @return {Dropdown} This instance.
   */


  Dropdown.prototype.disableOptionByValue = function disableOptionByValue(value) {
    return this.toggleOptionByValue(value, true);
  };

  /**
   * Enable an option.
   * @param {string} value Value of the option to enable.
   * @return {Dropdown} This instance.
   */


  Dropdown.prototype.enableOptionByValue = function enableOptionByValue(value) {
    return this.toggleOptionByValue(value, false);
  };

  Dropdown.prototype.dispose = function dispose() {
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
    _OdoBaseComponent.prototype.dispose.call(this);
  };

  createClass(Dropdown, [{
    key: 'selectedIndex',
    get: function get() {
      return this._select.selectedIndex;
    }

    /**
     * Set the selected option by index.
     * @param {number} index Index to select.
     */
    ,
    set: function set(index) {
      this.value = this._select.options[index].value;
    }

    /**
     * Returns the <select>.
     * @return {HTMLSelectElement}
     */

  }, {
    key: 'select',
    get: function get() {
      return this._select;
    }

    /**
     * Returns the button to open the select menu.
     * @return {HTMLButtonElement}
     */

  }, {
    key: 'button',
    get: function get() {
      return this._button;
    }

    /**
     * Return the display text for the currently selected option.
     * @returns {string}
     */

  }, {
    key: 'selectedText',
    get: function get() {
      return this._select.options[this._select.selectedIndex].text;
    }

    /**
     * Retrieve the selected value.
     * @return {string}
     */

  }, {
    key: 'value',
    get: function get() {
      return this._select.value;
    }

    /**
     * Set the value of the <select> and the custom menu.
     * @param {string} value Value which matches one of the options.
     */
    ,
    set: function set(value) {
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
        var text = this.getDisplayText(this.selectedIndex);

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

  }, {
    key: 'disabled',
    get: function get() {
      return this.select.disabled;
    }

    /**
     * Set the disabled state of the component.
     * @param {boolean} isDisabled Whether it's disabled or not.
     */
    ,
    set: function set(isDisabled) {
      this.select.disabled = isDisabled;
      this.button.disabled = isDisabled;
    }
  }]);
  return Dropdown;
}(OdoBaseComponent);

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
  BASE_NATIVE: 'odo-dropdown--native'
};

Dropdown.Key = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  UP: 38,
  DOWN: 40
};

Dropdown.EventType = {
  CHANGE: 'ododropdown:change'
};

Dropdown.Selector = {
  ENABLED_OPTION: '.' + Dropdown.Classes.OPTION + ':not(.' + Dropdown.Classes.OPTION_DISABLED + ')'
};

Dropdown.Defaults = {
  insertMarkup: true,
  useNative: OdoDevice.HAS_TOUCH_EVENTS
};

return Dropdown;

})));
//# sourceMappingURL=odo-dropdown.js.map
