class TabsEvent {
  /**
   * Object representing a tab event.
   * @param {string} type Event type.
   * @param {number} index Index of tab.
   * @constructor
   */
  constructor(type, index) {
    this.type = type;

    /** @type {number} */
    this.index = index;

    /** @type {boolean} Whether `preventDefault` has been called. */
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

export default TabsEvent;
