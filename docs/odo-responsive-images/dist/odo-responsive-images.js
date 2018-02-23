(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('picturefill'), require('@odopod/odo-viewport')) :
	typeof define === 'function' && define.amd ? define(['picturefill', '@odopod/odo-viewport'], factory) :
	(global.OdoResponsiveImages = factory(global.picturefill,global.OdoViewport));
}(this, (function (picturefill,Viewport) { 'use strict';

picturefill = picturefill && picturefill.hasOwnProperty('default') ? picturefill['default'] : picturefill;
Viewport = Viewport && Viewport.hasOwnProperty('default') ? Viewport['default'] : Viewport;

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

var debounce = function debounce(func, wait, immediate) {
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  }

  var debounced = function debounced() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  debounced.flush = function () {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;

      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * If the first parameter is not an array, return an array containing the first
 * parameter.
 * @param {*} thing Anything.
 * @return {Array.<*>} Array of things.
 */
function arrayify(thing) {
  if (Array.isArray(thing)) {
    return thing;
  }

  if (thing && typeof thing.length === 'number') {
    return Array.from(thing);
  }

  return [thing];
}

/**
 * Move children from one element to another. Ignores <noscript> elements.
 * @param {Element} fromElement Element to move children from.
 * @param {Element} toElement Element to move children to.
 * @private
 */
function transferChildren(fromElement, toElement) {
  // Include comment nodes. Convert to array because the NodeList is "live"
  // and will be updated when an element is removed from it.
  var frag = document.createDocumentFragment();
  var children = Array.from(fromElement.childNodes);

  for (var i = 0; i < children.length; i++) {
    if (children[i].nodeName !== 'NOSCRIPT') {
      frag.appendChild(children[i]);
    }
  }

  toElement.appendChild(frag);
}

/**
 * Whether the given thing is an element.
 * @param {*} thing Thing to test.
 * @return {boolean}
 */
function isElement(thing) {
  return thing && thing.nodeType === 1;
}

var ResponsiveImages = function () {
  function ResponsiveImages() {
    classCallCheck(this, ResponsiveImages);

    /**
     * Because this class is a singleton, assign settings to the instance.
     * @enum {string}
     */
    this.ClassName = {
      IMAGE: 'odo-responsive-img',
      LOADED: 'odo-responsive-img--loaded'
    };

    /**
     * An array of viewport item ids and picture elements.
     * @type {Array.<{id: string, element: Element}>}
     */
    this.images = [];

    // Save context for this callback so it can easily be removed.
    this._imageLoadHandler = this._handleImageLoad.bind(this);
    this._imageInViewHandler = this._handleImageInView.bind(this);

    /**
     * Debounce calls to `_update`.
     * @type {function}
     */
    this.updateOffsets = debounce(this._update, ResponsiveImages.DEBOUNCE_TIME);
  }

  ResponsiveImages.prototype.initialize = function initialize() {
    // Ignore elements which are already <picture>.
    this._add(Array.from(document.querySelectorAll('.' + this.ClassName.IMAGE + ':not(picture)')));
  };

  /**
   * Add an array of images to track.
   * @param {Array.<Element>} newImages Images array.
   */


  ResponsiveImages.prototype._add = function _add(newImages) {
    var _this = this;

    var options = newImages.map(function (image) {
      return _this._getViewportOptions(image);
    });
    var ids = Viewport.add(options);
    this.images = this.images.concat(ids.map(function (id, i) {
      return {
        id: id,
        element: newImages[i]
      };
    }));
  };

  /**
   * Retrieve options to give OdoViewport for an element.
   * @param {Element} picture The picture/div element.
   * @return {!Object} OdoViewportItem options.
   */


  ResponsiveImages.prototype._getViewportOptions = function _getViewportOptions(picture) {
    return {
      element: picture,
      threshold: picture.getAttribute('data-threshold') || 0,
      enter: this._imageInViewHandler
    };
  };

  /**
   * Callback for when the image has entered the viewport. This triggers the image
   * to start loading.
   * @param {ViewportItem} viewportItem Data about the element entering view.
   */


  ResponsiveImages.prototype._handleImageInView = function _handleImageInView(viewportItem) {
    this._loadImage(viewportItem.element);
  };

  /**
   * Given the parent placeholder div, load the responsive image inside it.
   * @param {Element} placeholder An element with the odo responsive image class.
   * @private
   */


  ResponsiveImages.prototype._loadImage = function _loadImage(placeholder) {
    var img = placeholder.querySelector('img');

    if (!img) {
      throw new Error('Unable to find <img> element within Odo Responsive Images placeholder.');
    }

    var srcset = img.getAttribute('data-srcset');

    // Determine if this is img[srcset] or if it should be a <picture>.
    if (srcset !== null) {
      // Not sure what is best here, setting the property or the attribute, for both
      // picturefill and native responsive images, so both are set.
      img.srcset = srcset;
      img.setAttribute('srcset', srcset);
      img.removeAttribute('data-srcset');
      placeholder._odoResponsiveImageUsed = true;
    } else {
      // Create a new picture element with the same contents and replace the
      // placeholder with it.
      var parent = placeholder.parentElement;
      var picture = document.createElement('picture');
      picture.className = placeholder.className;
      transferChildren(placeholder, picture);
      var type = placeholder.getAttribute('data-type');
      if (type) {
        picture.setAttribute('data-type', type);
      }

      img = picture.querySelector('img');

      // Replace the placeholder element with the picture.
      parent.replaceChild(picture, placeholder);
      picture._odoResponsiveImageUsed = true;
    }

    // Splice out of array.
    this._removeImageEntry(placeholder);

    // Now that the DOM is in the final state, see if this image is already loaded.
    if (this.isImageLoaded(img)) {
      setTimeout(this._handleImageLoad.bind(this, {
        target: img
      }), 30);
    }

    // When the image first loads, add the loaded class and possibly update
    // the background-image property.
    img.addEventListener('load', this._imageLoadHandler, false);
    img.addEventListener('error', this._imageLoadHandler, false);

    // Run picturefill on the new element.
    picturefill({
      elements: [img]
    });
  };

  /**
   * Retrieve the image object which matches the given placeholder element.
   * @param {Element} placeholder Responsive image element wrapper (the one which
   *     gets replaced when using <picture>).
   * @return {?number} Index of the responsive image object.
   */


  ResponsiveImages.prototype._getImageIndexByPlaceholder = function _getImageIndexByPlaceholder(placeholder) {
    var index = null;

    for (var i = 0, len = this.images.length; i < len; i++) {
      if (this.images[i].element === placeholder) {
        index = i;
        break;
      }
    }

    return index;
  };

  /**
   * Removes an image stored in the `images` array from the array and from the
   * Viewport watcher.
   * @param {Element} placeholder Placeholder element.
   * @private
   */


  ResponsiveImages.prototype._removeImageEntry = function _removeImageEntry(placeholder) {
    var index = this._getImageIndexByPlaceholder(placeholder);

    // Unable to find the index of the placeholder image. It is either already
    // loaded, or the "placeholder" was the replacement?
    if (index === null) {
      return;
    }

    Viewport.remove(this.images[index].id);
    this.images.splice(index, 1);
  };

  /**
   * Whether an image element has already been loaded.
   * @param {HTMLImageElement} img The <img>.
   * @return {boolean}
   */


  ResponsiveImages.prototype.isImageLoaded = function isImageLoaded(img) {
    return img.naturalWidth > 0;
  };

  /**
   * Determine if this is element should use a background image.
   * @param {HTMLImageElement} img Image in question.
   * @return {boolean}
   */


  ResponsiveImages.prototype._isBackgroundImage = function _isBackgroundImage(img) {
    return img.parentElement.getAttribute('data-type') === 'background';
  };

  /**
   * Whether the given element is a Odo Responsive Image which is not already
   * loading and has not been loaded yet.
   * @param {Element} picture Element to test.
   */


  ResponsiveImages.prototype._isUnloadedResponsiveImage = function _isUnloadedResponsiveImage(picture) {
    if (!isElement(picture)) {
      throw new TypeError('Odo Responsive Images requires an element. Got: "' + picture + '"');
    }

    if (!picture.classList.contains(this.ClassName.IMAGE)) {
      throw new TypeError(picture + ' is not a Odo Responsive Image.');
    }

    // The _loadImage method adds this property to the picture (or div when using
    // img[srcset]) after it has done its business.
    return picture._odoResponsiveImageUsed !== true;
  };

  /**
   * Whether the given element is already in the `images` object array.
   * @param {Element} placeholder Element to test.
   * @return {boolean}
   */


  ResponsiveImages.prototype.isUntrackedImage = function isUntrackedImage(placeholder) {
    return this._getImageIndexByPlaceholder(placeholder) === null;
  };

  /**
   * Load event handler for images.
   * @param {UIEvent} evt Image load event object.
   */


  ResponsiveImages.prototype._handleImageLoad = function _handleImageLoad(evt) {
    var _this2 = this;

    var img = /** @type {HTMLImageElement} */evt.target;

    // Exit early if this image is longer in the DOM.
    if (!img.parentNode) {
      return;
    }

    // Call debounced update offsets because once an image loads, it could
    // offset everything below it on the page.
    this.updateOffsets();

    // Set the background image url if it has a [data-type="background"] attribute.
    if (this._isBackgroundImage(img)) {
      this._updateBackgroundImage(img);
    } else {
      // No longer need to listen for the load event for <picture>s. It will be
      // handled natively or by picturefill.
      this._removeImageHandlers(img);
    }

    // Write to the DOM all at once if many images load at the same time.
    requestAnimationFrame(function () {
      // classList is smart enough not to change the className property if the
      // element already has the class which is being added.
      img.parentNode.classList.add(_this2.ClassName.LOADED);
    });
  };

  /**
   * Update the background image property with the current source of a responsive image.
   * @param {HTMLImageElement} img Image element.
   */


  ResponsiveImages.prototype._updateBackgroundImage = function _updateBackgroundImage(img) {
    img.parentNode.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")';
  };

  /**
   * Notify the Viewport to update its value. This method is called when a new
   * image loads. It should also be called manually if offsets on the page change.
   */


  ResponsiveImages.prototype._update = function _update() {
    Viewport.update();
  };

  /**
   * Remove the event listeners bound to the image.
   * @param {Element} img Image element.
   */


  ResponsiveImages.prototype._removeImageHandlers = function _removeImageHandlers(img) {
    if (img) {
      img.removeEventListener('load', this._imageLoadHandler, false);
      img.removeEventListener('error', this._imageLoadHandler, false);
    }
  };

  /**
   * Clean up all references and listeners for current images.
   */


  ResponsiveImages.prototype.flush = function flush() {
    var _this3 = this;

    // Remove load listener for each image and stop the Viewport component
    // from watching it.
    this.images.forEach(function (image) {
      var img = image.element.querySelector('img');
      _this3._removeImageHandlers(img);
      Viewport.remove(image.id);
    });

    this.images.length = 0;

    // Remove all `load` events from background images.
    var selector = '.' + this.ClassName.IMAGE + '[data-type="background"] img';
    Array.from(document.querySelectorAll(selector)).forEach(function (img) {
      _this3._removeImageHandlers(img);
    });
  };

  /**
   * Remove watched images from this component.
   * @param {Element|Array.<Element>} placeholders An element or array of elements.
   *     The element should be the parent element of the <img>.
   */


  ResponsiveImages.prototype.remove = function remove(placeholders) {
    var _this4 = this;

    arrayify(placeholders).forEach(function (placeholder) {
      _this4._removeImageEntry(placeholder);
      _this4._removeImageHandlers(placeholder.querySelector('img'));
    });
  };

  /**
   * Add more images for the ResponsiveImages component to watch.
   * @param {Element|Array.<Element>} pictures An element or array of elements.
   *     The element should be the parent element of the <img>.
   */


  ResponsiveImages.prototype.add = function add(pictures) {
    var pics = arrayify(pictures).filter(this._isUnloadedResponsiveImage, this).filter(this.isUntrackedImage, this);

    if (pics.length === 0) {
      return;
    }

    this._add(pics);
  };

  /**
   * Force the load of an element or group of elements instead of waiting for it
   * to come into the viewport.
   * @param {Element|Array.<Element>} pictures An element or array of elements.
   *     The element should be the parent element of the <img>.
   */


  ResponsiveImages.prototype.load = function load(pictures) {
    arrayify(pictures).filter(this._isUnloadedResponsiveImage, this).forEach(this._loadImage, this);
  };

  return ResponsiveImages;
}();

ResponsiveImages.DEBOUNCE_TIME = 300;

// Create a single instance and return that.
var responsiveImages = new ResponsiveImages();

return responsiveImages;

})));
//# sourceMappingURL=odo-responsive-images.js.map
