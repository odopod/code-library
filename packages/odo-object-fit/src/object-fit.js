/**
 * @fileoverview A helper which fits media elements (img, video). It polyfills
 * CSS' object-fit: cover and contain. If the browser supports object-fit, it
 * will not run. The media element should have full width and height as well as
 * the object-fit property.
 *
 * Usage:
 *
 *     .my-element {
 *       width: 100%;
 *       height: 100%;
 *       object-fit: cover;
 *     }
 *
 *     // Cover a single element.
 *     ObjectFit.cover(myElement);
 *
 *     // Cover multiple media elements.
 *     ObjectFit.cover([myElement, thatOtherElement]);
 */

class ObjectFit {
  constructor(element, style) {
    /** @type {HTMLImageElement|HTMLVideoElement} */
    this.element = element;

    /** @type {ObjectFit.Style} */
    this.style = style;

    /** @private {boolean} */
    this._isVideo = element.nodeName.toLowerCase() === 'video';

    /** @private {number} */
    this._mediaRatio = null;

    this._listenForMediaLoad();
  }

  /**
   * Calculate the dimenions of the media element and set them.
   * @param {HTMLElement} el Element to size.
   * @private
   */
  _fit(el) {
    const container = this._getParentSize();
    const element = this._getFitSize(container.width, container.height);

    el.style.width = element.width + 'px';
    el.style.height = element.height + 'px';
    el.style.marginLeft = ((container.width - element.width) / 2) + 'px';
    el.style.marginTop = ((container.height - element.height) / 2) + 'px';
  }

  /**
   * Retrieve the width and height of the containing block.
   * @return {{width: number, height: number}}
   * @private
   */
  _getParentSize() {
    return {
      width: this.element.parentElement.offsetWidth,
      height: this.element.parentElement.offsetHeight,
    };
  }

  /**
   * Calculate the width and height of the media element based on the containing
   * block's width/height and the object-fit style.
   * @param {number} containerWidth Containing block's width.
   * @param {number} containerHeight Containing block's height.
   * @return {{width: number, height: number}}
   * @private
   */
  _getFitSize(containerWidth, containerHeight) {
    const containerRatio = containerWidth / containerHeight;
    let elementWidth;
    let elementHeight;

    if (this.style === ObjectFit.Style.COVER) {
      // Determine the actual width and height of the image when it's covering the area.
      if (this._mediaRatio > containerRatio) {
        elementWidth = containerHeight * this._mediaRatio;
        elementHeight = containerHeight;
      } else {
        elementWidth = containerWidth;
        elementHeight = containerWidth / this._mediaRatio;
      }
    } else /* if this.style === ObjectFit.Style.CONTAIN */ if (this._mediaRatio > containerRatio) {
      elementWidth = containerWidth;
      elementHeight = containerWidth / this._mediaRatio;
    } else {
      elementWidth = containerHeight * this._mediaRatio;
      elementHeight = containerHeight;
    }

    return {
      width: Math.round(elementWidth),
      height: Math.round(elementHeight),
    };
  }

  /**
   * Retrieves the media element's width/height ratio.
   * @return {number}
   * @private
   */
  _getMediaRatio() {
    if (this._isVideo) {
      return this.element.videoWidth / this.element.videoHeight;
    }
    return this.element.naturalWidth / this.element.naturalHeight;
  }

  /**
   * Listen for when the metadata (video width/height) is loaded for videos or
   * the load event for images.
   * @return {string}
   */
  get _loadEventName() {
    return this._isVideo ? 'loadedmetadata' : 'load';
  }

  /** @private */
  _listenForMediaLoad() {
    this._mediaLoadedHandler = this._handleMediaLoaded.bind(this);

    if (this._isMediaLoaded(this.element)) {
      this._mediaLoadedHandler();
    } else {
      this.element.addEventListener(this._loadEventName, this._mediaLoadedHandler);
    }
  }

  /**
   * Videos have a readyState. Anything greater than zero means it has metadata.
   * Some browsers implement the `complete` property on images. Also test the `naturalWidth`.
   * @param {HTMLImageElement|HTMLVideoElement} element Media element.
   * @return {boolean}
   */
  _isMediaLoaded(element) {
    return element.readyState > 0 || (element.src && element.complete) || element.naturalWidth > 0;
  }

  /** @private */
  _unlistenForMediaLoad() {
    this.element.removeEventListener(this._loadEventName, this._mediaLoadedHandler);
  }

  /**
   * Image loaded, it has `naturalWidth` and `naturalHeight` properties.
   *
   * Video metadata loaded, all attributes now contain as much useful information
   * as they're going to.
   * @private
   */
  _handleMediaLoaded() {
    this._unlistenForMediaLoad();
    this._mediaRatio = this._getMediaRatio();
    this._fit(this.element);
    this.element = null;
  }

  /**
   * Create new object fit objects to cover their container.
   * @param {ArrayLike.<Element>|Element} elements An array-like of elements or
   *     a single element.
   * @static
   */
  static cover(elements) {
    ObjectFit._run(elements, ObjectFit.Style.COVER);
  }

  /**
   * Create new object fit objects to be contained in their container.
   * @param {ArrayLike.<Element>|Element} elements An array-like of elements or
   *     a single element.
   * @static
   */
  static contain(elements) {
    ObjectFit._run(elements, ObjectFit.Style.CONTAIN);
  }

  /**
   * Gives the ability to pass multiple elements. Fails silently when no elements
   * are given or exits early if the browser supports object-fit.
   * @param {ArrayLike.<Element>|Element} elements An array-like of elements or
   *     a single element.
   * @param {ObjectFit.Style} type What type of object-fit this is.
   * @static
   */
  static _run(elements, type) {
    // Exit early if it already supports object-fit.
    if (ObjectFit.SUPPORTED || !elements || (elements && elements.length === 0)) {
      return;
    }

    if (elements.length) {
      for (let i = 0; i < elements.length; i++) {
        new ObjectFit(elements[i], type); // eslint-disable-line no-new
      }
    } else {
      new ObjectFit(elements, type); // eslint-disable-line no-new
    }
  }
}

/**
 * Whether the browser supports object-fit.
 * @type {boolean}
 */
ObjectFit.SUPPORTED = document.createElement('div').style.objectFit === '';

/** @enum {number} */
ObjectFit.Style = {
  COVER: 1,
  CONTAIN: 2,
};

export default ObjectFit;
