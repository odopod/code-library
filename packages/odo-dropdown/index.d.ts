// Type definitions for OdoDropdown
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

import OdoBaseComponent from '@odopod/odo-base-component';

export as namespace OdoDropdown;

export = OdoDropdown;

declare class OdoDropdown extends OdoBaseComponent {
  constructor(element: HTMLElement, opts?: OdoDropdown.Options);

  options: OdoDropdown.Options;

  /**
   * Unique id for this instance.
   * @type {string}
   */
  id: string;

  /**
   * Get or set the selected index of the <select>
   */
  selectedIndex: number;

  /**
   * The display text for the currently selected option.
   */
  readonly selectedText: string;

  /**
   * The <select>
   */
  readonly select: HTMLSelectElement;

  /**
   * The button which opens the menu.
   */
  readonly button: HTMLButtonElement;

  /**
   * Get or set the value of the <select> and the custom menu.
   * @param {string} value Value which matches one of the options.
   */
  value: string;

  /**
   * Get/set the disabled property on the select and button.
   */
  disabled: boolean;

  /**
   * Generate the HTML to show on non-touch devices.
   * @return {string} A string of HTML.
   * @protected
   */
  protected getCustomOptionsHtml(): string;

  /**
   * Generate an HTML string for custom options based on the current options
   * in the <select>
   * @return {string} Markup.
   * @protected
   */
  protected getOptionsMarkup(): string;

  /**
   * Create an HTML string to be used for a custom option.
   * @param {HTMLOptionElement} option Native option element.
   * @return {string} Markup.
   * @protected
   */
  protected getOptionMarkup(option: HTMLOptionElement): string;

  /**
   * Return an array of custom option elements.
   * @return {Array.<HTMLDivElement>}
   */
  getCustomOptions(): HTMLDivElement[];

  /**
   * Return an array of option elements.
   * @return {Array.<HTMLOptionElement>}
   */
  getNativeOptions(): HTMLOptionElement;

  /**
   * Retrieve the text to display inside the button.
   * @param {number} selectedIndex Index of the selected option.
   * @return {string} Text to display.
   * @protected
   */
  protected getDisplayText(selectedIndex: number): string;

  /**
   * Toggle the state of an option.
   * @param {string} value Value of the option to toggle.
   * @param {boolean} isDisabled Whether to disable it or not.
   * @return {OdoDropdown} This instance for chaining.
   */
  toggleOptionByValue(value: string, isDisabled: boolean): OdoDropdown;

  /**
   * Disable an option.
   * @param {string} value Value of the option to disable.
   * @return {OdoDropdown} This instance.
   */
  disableOptionByValue(value: string): OdoDropdown;

  /**
   * Enable an option.
   * @param {string} value Value of the option to enable.
   * @return {OdoDropdown} This instance.
   */
  enableOptionByValue(value: string): OdoDropdown;

  /**
   * Remove event listeners and element references.
   */
  dispose(): void;
}

declare namespace OdoDropdown {
  export interface Options {
    insertMarkup?: boolean;
    useNative?: boolean;
  }

  /**
   * HTML class names for elements of the dropdown.
   */
  enum Classes {
    BASE = 'odo-dropdown',
    OPEN = 'odo-dropdown--open',
    BUTTON = 'odo-dropdown__button',
    OPTIONS_CONTAINER_OPEN = 'odo-dropdown__options--open',
    OPTIONS_CONTAINER = 'odo-dropdown__options',
    OPTION = 'odo-dropdown__option',
    OPTION_SELECTED = 'odo-dropdown__option--active',
    OPTION_DISABLED = 'odo-dropdown__option--disabled',
    SELECT = 'odo-dropdown__select',
    VALUE = 'odo-dropdown__value',
    DEFAULT = 'odo-dropdown__default',
    BASE_NATIVE = 'odo-dropdown--native',
  }

  enum Key {
    TAB = 9,
    ENTER = 13,
    ESC = 27,
    SPACE = 32,
    UP = 38,
    DOWN = 40,
  }

  enum EventType {
    CHANGE = 'ododropdown:change',
  }

  const Selector: {
    ENABLED_OPTION: string;
  };

  /**
   * Default options for each instance.
   */
  const Defaults: OdoDropdown.Options;
}
