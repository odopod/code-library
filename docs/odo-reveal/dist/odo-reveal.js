(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-device'), require('@odopod/odo-viewport'), require('@odopod/odo-helpers')) :
	typeof define === 'function' && define.amd ? define(['@odopod/odo-device', '@odopod/odo-viewport', '@odopod/odo-helpers'], factory) :
	(global.OdoReveal = factory(global.OdoDevice,global.OdoViewport,global.OdoHelpers));
}(this, (function (OdoDevice,OdoViewport,odoHelpers) { 'use strict';

OdoDevice = OdoDevice && OdoDevice.hasOwnProperty('default') ? OdoDevice['default'] : OdoDevice;
OdoViewport = OdoViewport && OdoViewport.hasOwnProperty('default') ? OdoViewport['default'] : OdoViewport;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * @fileoverview Fade elements in and up when they come into view. Waits for
 * images inside the main element to load before triggering the fade.
 *
 * @author Glen Cheney <glen@odopod.com>
 *
 * TODO: Add a (better) way to ignore/add/remove images or videos.
 */

var Reveal = function () {
  /**
   * @param {Element} element Main element for the module.
   * @constructor
   */
  function Reveal(element) {
    var _this = this;

    classCallCheck(this, Reveal);

    this.element = element;
    this.images = this._getDependentImages();
    this._numImages = this.images.length;
    this._loadedImages = 0;
    this._imageCompleteHandler = this._imageComplete.bind(this);
    this._ready = new Promise(function (resolve) {
      _this._resolve = resolve;
    });

    if (this._numImages > 0) {
      this.images.forEach(function (image) {
        image.addEventListener('load', _this._imageCompleteHandler);
        image.addEventListener('error', _this._imageCompleteHandler);
      });
    } else {
      this._resolve();
    }

    // To avoid blank text while scrolling on native Android,
    // the type is faded in immediately and not given to the viewport
    // to track.
    if (Reveal.HAS_SCROLL_ANIMATION) {
      /**
       * Viewport id to remove it later.
       * @type {string}
       */
      this.id = OdoViewport.add({
        element: element,
        threshold: odoHelpers.getPercentageOption(element.getAttribute('data-threshold'), '25%'),
        enter: this._enteredView.bind(this)
      });
    } else {
      this._show();
    }
  }

  /**
   * Get all images within the main element which do not have the "ignore" class
   * on a parent element.
   * @return {Array.<HTMLImageElement>}
   * @private
   */


  Reveal.prototype._getDependentImages = function _getDependentImages() {
    var images = Array.from(this.element.querySelectorAll('img'));
    return images.filter(function (img) {
      return img.closest('.' + Reveal.ClassName.IGNORE) === null;
    });
  };

  /**
   * Element is in view. Wait until all images have finished loading then animate
   * the targets in.
   */


  Reveal.prototype._enteredView = function _enteredView() {
    this._ready.then(this._show.bind(this));
  };

  /**
   * Main element came into view. Add the fade in class to the main element which
   * triggers all type to start transitioning.
   * @private
   */


  Reveal.prototype._show = function _show() {
    var _this2 = this;

    this.element.classList.add(Reveal.ClassName.IN);

    var targetSelector = '.' + Reveal.ClassName.TARGET;
    var targets = Array.from(this.element.querySelectorAll(targetSelector));

    // Listen transition end on each target and add a class which removes
    // the transform and layer promotion from it.
    targets.forEach(function (el) {
      odoHelpers.onTransitionEnd(el, _this2._handleShown, null, OdoDevice.Dom.TRANSFORM);
    });

    this.dispose();
  };

  /**
   * Add the done class which removes the transforms and layer promotion.
   * @private
   */


  Reveal.prototype._handleShown = function _handleShown(evt) {
    evt.target.classList.add(Reveal.ClassName.DONE);
  };

  /**
   * An image loaded or failed to load. If it was the last image, resolve the
   * promise waiting for all images to finish.
   * @private
   */


  Reveal.prototype._imageComplete = function _imageComplete() {
    this._loadedImages += 1;

    if (this._loadedImages === this._numImages) {
      this._resolve();
    }
  };

  /**
   * Remove the type animations from the viewport watcher. Has no effect if the
   * element has already come into view.
   */


  Reveal.prototype.dispose = function dispose() {
    var _this3 = this;

    OdoViewport.remove(this.id);

    this.images.forEach(function (image) {
      image.removeEventListener('load', _this3._imageCompleteHandler);
      image.removeEventListener('error', _this3._imageCompleteHandler);
    });

    this.images = null;
    this.element = null;
  };

  /**
   * Auto-initialize all odo reveal elements currently on the page.
   * @param {Element|Document} [context] Optional context to initialize elements within.
   * @return {Array.<Reveal>}
   */


  Reveal.initializeAll = function initializeAll() {
    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

    return Array.from(context.querySelectorAll('.odo-reveal'), function (element) {
      return new Reveal(element);
    });
  };

  return Reveal;
}();

/**
 * Whether or not to add the main element to the Viewport watcher. By default,
 * no native Android browsers are registered. The type will fade in immediately.
 * @type {boolean}
 */


Reveal.HAS_SCROLL_ANIMATION = !odoHelpers.isNativeAndroid(navigator.userAgent);

/** @enum {string} */
Reveal.ClassName = {
  TARGET: 'odo-reveal__target',
  IN: 'odo-reveal--shown',
  DONE: 'odo-reveal--done',
  IGNORE: 'odo-reveal__ignore'
};

return Reveal;

})));
//# sourceMappingURL=odo-reveal.js.map
