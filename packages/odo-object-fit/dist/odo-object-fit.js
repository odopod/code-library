(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OdoObjectFit = factory());
}(this, (function () { 'use strict';

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

var ObjectFit = function () {
  function ObjectFit(element, style) {
    classCallCheck(this, ObjectFit);

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


  ObjectFit.prototype._fit = function _fit(el) {
    var container = this._getParentSize();
    var element = this._getFitSize(container.width, container.height);

    el.style.width = element.width + 'px';
    el.style.height = element.height + 'px';
    el.style.marginLeft = (container.width - element.width) / 2 + 'px';
    el.style.marginTop = (container.height - element.height) / 2 + 'px';
  };

  /**
   * Retrieve the width and height of the containing block.
   * @return {{width: number, height: number}}
   * @private
   */


  ObjectFit.prototype._getParentSize = function _getParentSize() {
    return {
      width: this.element.parentElement.offsetWidth,
      height: this.element.parentElement.offsetHeight
    };
  };

  /**
   * Calculate the width and height of the media element based on the containing
   * block's width/height and the object-fit style.
   * @param {number} containerWidth Containing block's width.
   * @param {number} containerHeight Containing block's height.
   * @return {{width: number, height: number}}
   * @private
   */


  ObjectFit.prototype._getFitSize = function _getFitSize(containerWidth, containerHeight) {
    var containerRatio = containerWidth / containerHeight;
    var elementWidth = void 0;
    var elementHeight = void 0;

    if (this.style === ObjectFit.Style.COVER) {
      // Determine the actual width and height of the image when it's covering the area.
      if (this._mediaRatio > containerRatio) {
        elementWidth = containerHeight * this._mediaRatio;
        elementHeight = containerHeight;
      } else {
        elementWidth = containerWidth;
        elementHeight = containerWidth / this._mediaRatio;
      }
    } else /* if this.style === ObjectFit.Style.CONTAIN */if (this._mediaRatio > containerRatio) {
        elementWidth = containerWidth;
        elementHeight = containerWidth / this._mediaRatio;
      } else {
        elementWidth = containerHeight * this._mediaRatio;
        elementHeight = containerHeight;
      }

    return {
      width: Math.round(elementWidth),
      height: Math.round(elementHeight)
    };
  };

  /**
   * Retrieves the media element's width/height ratio.
   * @return {number}
   * @private
   */


  ObjectFit.prototype._getMediaRatio = function _getMediaRatio() {
    if (this._isVideo) {
      return this.element.videoWidth / this.element.videoHeight;
    }
    return this.element.naturalWidth / this.element.naturalHeight;
  };

  /**
   * Listen for when the metadata (video width/height) is loaded for videos or
   * the load event for images.
   * @return {string}
   */


  /** @private */
  ObjectFit.prototype._listenForMediaLoad = function _listenForMediaLoad() {
    this._mediaLoadedHandler = this._handleMediaLoaded.bind(this);

    if (this._isMediaLoaded(this.element)) {
      this._mediaLoadedHandler();
    } else {
      this.element.addEventListener(this._loadEventName, this._mediaLoadedHandler);
    }
  };

  /**
   * Videos have a readyState. Anything greater than zero means it has metadata.
   * Some browsers implement the `complete` property on images. Also test the `naturalWidth`.
   * @param {HTMLImageElement|HTMLVideoElement} element Media element.
   * @return {boolean}
   */


  ObjectFit.prototype._isMediaLoaded = function _isMediaLoaded(element) {
    return element.readyState > 0 || element.src && element.complete || element.naturalWidth > 0;
  };

  /** @private */


  ObjectFit.prototype._unlistenForMediaLoad = function _unlistenForMediaLoad() {
    this.element.removeEventListener(this._loadEventName, this._mediaLoadedHandler);
  };

  /**
   * Image loaded, it has `naturalWidth` and `naturalHeight` properties.
   *
   * Video metadata loaded, all attributes now contain as much useful information
   * as they're going to.
   * @private
   */


  ObjectFit.prototype._handleMediaLoaded = function _handleMediaLoaded() {
    this._unlistenForMediaLoad();
    this._mediaRatio = this._getMediaRatio();
    this._fit(this.element);
    this.element = null;
  };

  /**
   * Create new object fit objects to cover their container.
   * @param {ArrayLike.<Element>|Element} elements An array-like of elements or
   *     a single element.
   * @static
   */


  ObjectFit.cover = function cover(elements) {
    ObjectFit._run(elements, ObjectFit.Style.COVER);
  };

  /**
   * Create new object fit objects to be contained in their container.
   * @param {ArrayLike.<Element>|Element} elements An array-like of elements or
   *     a single element.
   * @static
   */


  ObjectFit.contain = function contain(elements) {
    ObjectFit._run(elements, ObjectFit.Style.CONTAIN);
  };

  /**
   * Gives the ability to pass multiple elements. Fails silently when no elements
   * are given or exits early if the browser supports object-fit.
   * @param {ArrayLike.<Element>|Element} elements An array-like of elements or
   *     a single element.
   * @param {ObjectFit.Style} type What type of object-fit this is.
   * @static
   */


  ObjectFit._run = function _run(elements, type) {
    // Exit early if it already supports object-fit.
    if (ObjectFit.SUPPORTED || !elements || elements && elements.length === 0) {
      return;
    }

    if (elements.length) {
      for (var i = 0; i < elements.length; i++) {
        new ObjectFit(elements[i], type); // eslint-disable-line no-new
      }
    } else {
      new ObjectFit(elements, type); // eslint-disable-line no-new
    }
  };

  createClass(ObjectFit, [{
    key: '_loadEventName',
    get: function get$$1() {
      return this._isVideo ? 'loadedmetadata' : 'load';
    }
  }]);
  return ObjectFit;
}();

/**
 * Whether the browser supports object-fit.
 * @type {boolean}
 */


ObjectFit.SUPPORTED = document.createElement('div').style.objectFit === '';

/** @enum {number} */
ObjectFit.Style = {
  COVER: 1,
  CONTAIN: 2
};

return ObjectFit;

})));
//# sourceMappingURL=odo-object-fit.js.map
