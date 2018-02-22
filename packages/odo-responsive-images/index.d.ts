// Type definitions for OdoResponsiveImages
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

export as namespace OdoResponsiveImages;

declare const instance: OdoResponsiveImages;
export = instance;

interface ImageItem {
  id: string;
  element: HTMLElement;
}

declare class OdoResponsiveImages {

  constructor();

  /**
   * Class names used by this component.
   */
  ClassName: {
    IMAGE: string;
    LOADED: string;
  };

  /**
   * An array of viewport item ids and picture elements.
   */
  images: ImageItem[];

  /**
   * Notify the Viewport to update its value. This method is called when a new
   * image loads. It should also be called manually if offsets on the page change.
   */
  updateOffsets(): void;

  /**
   * Add all OdoResponsiveImages currently on the page to the watched items.
   */
  initialize(): void;

  /**
   * Whether an image element has already been loaded.
   * @param {HTMLImageElement} img The <img>.
   * @return {boolean}
   */
  isImageLoaded(img: HTMLImageElement): boolean;

  /**
   * Whether the given element is already in the `images` object array.
   * @param {Element} placeholder Element to test.
   * @return {boolean}
   */
  isUntrackedImage(placeholder: HTMLElement): boolean;

  /**
   * Clean up all references and listeners for current images.
   */
  flush(): void;

  /**
   * Remove watched images from this component.
   * @param {HTMLElement|HTMLElement[]} placeholders An element or array of elements.
   *     The element should be the parent element of the <img>.
   */
  remove(placeholders: HTMLElement | HTMLElement[]): void;

  /**
   * Add more images for the ResponsiveImages component to watch.
   * @param {HTMLElement|HTMLElement[]} pictures An element or array of elements.
   *     The element should be the parent element of the <img>.
   */
  add(pictures: HTMLElement | HTMLElement[]): void;

  /**
   * Force the load of an element or group of elements instead of waiting for it
   * to come into the viewport.
   * @param {HTMLElement|HTMLElement[]} pictures An element or array of elements.
   *     The element should be the parent element of the <img>.
   */
  load(pictures: HTMLElement | HTMLElement[]): void;
}

declare namespace OdoResponsiveImages {
  /**
   * Time in milliseconds that updates are debounced for.
   */
  const DEBOUNCE_TIME: number;
}
