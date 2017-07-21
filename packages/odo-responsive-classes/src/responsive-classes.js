import OdoBaseComponent from '@odopod/odo-base-component';
import ResponsiveClassesElement from './responsive-classes-element';

class ResponsiveClasses extends OdoBaseComponent {

  constructor() {
    super(document.body, true);
    this.items = [];
    this.initializeAll();
  }

  /**
   * When the browser matches a new media query, update.
   * @override
   */
  onMediaQueryChange() {
    this.process();
  }

  /**
   * Dispose of class name switchers.
   * @param {ArrayLike.<Element>} elements Array of class name switcher elements.
   */
  removeAll(elements) {
    const els = Array.from(elements);
    const items = this.items.filter(item => els.indexOf(item.element) > -1);

    items.forEach((item) => {
      this.items.splice(this.items.indexOf(item), 1);
      item.dispose();
    });
  }

  /**
  * Create instances to track.
  * @param {ArrayLike.<Element>} elements
  */
  addAll(elements) {
    const newItems = [];

    for (let i = 0, len = elements.length; i < len; i++) {
      newItems.push(new ResponsiveClassesElement(elements[i]));
    }

    // Merge new items into current items.
    this.items = this.items.concat(newItems);

    this.process();
  }

  /**
   * Initializes all ResponsiveClasses instances on the page or within the given
   * context.
   *
   * @param {Element} [context] Optionally provide the context (scope)
   *     for the query. Default is the body.
   */
  initializeAll(context = document.body) {
    this.addAll(context.querySelectorAll('.odo-responsive-classes'));
  }

  /**
   * Dispose of all ResponsiveClassesElement instances from within a context.
   * @param {Element} context Scope for the query.
   */
  disposeAll(context) {
    this.removeAll(context.querySelectorAll('.odo-responsive-classes'));
  }

  /**
   * By reading values from the DOM all at once, then writing to the DOM all at
   * once, layout thrashing is avoided, optimizing this code path.
   */
  process() {
    this.items.forEach((item) => {
      item.read();
    });

    this.items.forEach((item) => {
      item.write();
    });
  }
}

export default new ResponsiveClasses();
