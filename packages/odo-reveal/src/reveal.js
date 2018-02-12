/**
 * @fileoverview Fade elements in and up when they come into view. Waits for
 * images inside the main element to load before triggering the fade.
 *
 * @author Glen Cheney <glen@odopod.com>
 *
 * TODO: Add a (better) way to ignore/add/remove images or videos.
 */

import OdoDevice from '@odopod/odo-device';
import OdoViewport from '@odopod/odo-viewport';
import { getPercentageOption, isNativeAndroid, onTransitionEnd } from '@odopod/odo-helpers';

/**
 * @param {Element} element Main element for the module.
 * @constructor
 */
class Reveal {
  constructor(element) {
    this.element = element;
    this.images = this._getDependentImages();
    this._numImages = this.images.length;
    this._loadedImages = 0;
    this._imageCompleteHandler = this._imageComplete.bind(this);
    this._ready = new Promise((resolve) => {
      this._resolve = resolve;
    });

    if (this._numImages > 0) {
      this.images.forEach((image) => {
        image.addEventListener('load', this._imageCompleteHandler);
        image.addEventListener('error', this._imageCompleteHandler);
      });
    } else {
      this._resolve();
    }

    // To avoid blank text while scrolling on native Android,
    // the type is faded in immediately and not given to the viewport
    // to track.
    if (Reveal.HAS_SCROLL_ANIMATION) {
      this.id = OdoViewport.add({
        element,
        threshold: getPercentageOption(element.getAttribute('data-threshold'), '25%'),
        enter: this._enteredView.bind(this),
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
  _getDependentImages() {
    const images = Array.from(this.element.querySelectorAll('img'));
    return images.filter(img => img.closest('.' + Reveal.ClassName.IGNORE) === null);
  }

  /**
   * Element is in view. Wait until all images have finished loading then animate
   * the targets in.
   */
  _enteredView() {
    this._ready.then(this._show.bind(this));
  }

  /**
   * Main element came into view. Add the fade in class to the main element which
   * triggers all type to start transitioning.
   * @private
   */
  _show() {
    this.element.classList.add(Reveal.ClassName.IN);

    const targetSelector = '.' + Reveal.ClassName.TARGET;
    const targets = Array.from(this.element.querySelectorAll(targetSelector));

    // Listen transition end on each target and add a class which removes
    // the transform and layer promotion from it.
    targets.forEach((el) => {
      onTransitionEnd(el, this._handleShown, null, OdoDevice.Dom.TRANSFORM);
    });

    this.dispose();
  }

  /**
   * Add the done class which removes the transforms and layer promotion.
   * @private
   */
  _handleShown(evt) {
    evt.target.classList.add(Reveal.ClassName.DONE);
  }

  /**
   * An image loaded or failed to load. If it was the last image, resolve the
   * promise waiting for all images to finish.
   * @private
   */
  _imageComplete() {
    this._loadedImages += 1;

    if (this._loadedImages === this._numImages) {
      this._resolve();
    }
  }

  /**
   * Remove the type animations from the viewport watcher. Has no effect if the
   * element has already come into view.
   */
  dispose() {
    OdoViewport.remove(this.id);

    this.images.forEach((image) => {
      image.removeEventListener('load', this._imageCompleteHandler);
      image.removeEventListener('error', this._imageCompleteHandler);
    });

    this.images = null;
    this.element = null;
  }

  /**
   * Auto-initialize all odo reveal elements currently on the page.
   * @param {Element} [context] Optional context to initialize elements within.
   * @return {Array.<Reveal>}
   */
  static initializeAll(context = document) {
    return Array.from(
      context.querySelectorAll('.odo-reveal'),
      element => new Reveal(element),
    );
  }
}

/**
 * Whether or not to add the main element to the Viewport watcher. By default,
 * no native Android browsers are registered. The type will fade in immediately.
 * @type {boolean}
 */
Reveal.HAS_SCROLL_ANIMATION = !isNativeAndroid(navigator.userAgent);

/** @enum {string} */
Reveal.ClassName = {
  TARGET: 'odo-reveal__target',
  IN: 'odo-reveal--shown',
  DONE: 'odo-reveal--done',
  IGNORE: 'odo-reveal__ignore',
};

export default Reveal;
