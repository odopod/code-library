import OdoResponsiveAttributes from '@odopod/odo-responsive-attributes';

class ResponsiveClassesElement {
  constructor(element) {
    /**
     * Main element.
     * @type {Element}
     */
    this.element = element;

    /**
     * Read responsive attributes on the main element.
     * e.g. `data-class.md="foo"`.
     * @type {OdoResponsiveAttributes}
     * @private
     */
    this._attributes = new OdoResponsiveAttributes(element, 'class');
  }

  /**
   * Add multiple classes to the main element.
   * @param {string[]} classesToAdd Classes to add.
   */
  _addAllClasses(classesToAdd) {
    this.element.classList.add(...classesToAdd);
  }

  /**
  * Remove multiple classes to the main element.
  * @param {string[]} classesToRemove Classes to add.
  */
  _removeAllClasses(classesToRemove) {
    Object.keys(classesToRemove).forEach((breakpoint) => {
      if (classesToRemove[breakpoint]) {
        this.element.classList.remove(...classesToRemove[breakpoint].split(' '));
      }
    });
  }

  /**
   * Split read and writing to and from the DOM into separate methods so that
   * reads can be batched together and writes can be batched together. This
   * avoids layout thrashing.
   */
  read() {
    this._attributes.update();
  }

  /**
   * Update current classes on the element.
   */
  write() {
    this._removeAllClasses(this._attributes.values);
    this._addAllClasses(this._attributes.currentValue === null ?
      [] :
      this._attributes.currentValue.split(' '));
  }

  /**
   * Cleanup.
   */
  dispose() {
    this._attributes.dispose();
    this.element = null;
  }
}

export default ResponsiveClassesElement;
