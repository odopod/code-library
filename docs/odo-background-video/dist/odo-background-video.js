(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-video'), require('@odopod/odo-window-events'), require('@odopod/odo-viewport'), require('@odopod/odo-object-fit'), require('@odopod/odo-responsive-images')) :
	typeof define === 'function' && define.amd ? define(['@odopod/odo-video', '@odopod/odo-window-events', '@odopod/odo-viewport', '@odopod/odo-object-fit', '@odopod/odo-responsive-images'], factory) :
	(global.OdoBackgroundVideo = factory(global.OdoVideo,global.OdoWindowEvents,global.OdoViewport,global.OdoObjectFit,global.OdoResponsiveImages));
}(this, (function (OdoVideo,OdoWindowEvents,OdoViewport,OdoObjectFit,OdoResponsiveImages) { 'use strict';

OdoVideo = OdoVideo && OdoVideo.hasOwnProperty('default') ? OdoVideo['default'] : OdoVideo;
OdoWindowEvents = OdoWindowEvents && OdoWindowEvents.hasOwnProperty('default') ? OdoWindowEvents['default'] : OdoWindowEvents;
OdoViewport = OdoViewport && OdoViewport.hasOwnProperty('default') ? OdoViewport['default'] : OdoViewport;
OdoObjectFit = OdoObjectFit && OdoObjectFit.hasOwnProperty('default') ? OdoObjectFit['default'] : OdoObjectFit;
OdoResponsiveImages = OdoResponsiveImages && OdoResponsiveImages.hasOwnProperty('default') ? OdoResponsiveImages['default'] : OdoResponsiveImages;

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
 * @fileoverview Add a odo video component which plays in the background when
 * the element comes into view and falls back to an image if the browser cannot
 * autoplay video.
 *
 * @author Glen Cheney <glen@odopod.com>
 * @author Evan Vaughn
 */

var BackgroundVideo = function () {
  function BackgroundVideo(element) {
    var _this2 = this;

    classCallCheck(this, BackgroundVideo);

    /**
     * Main element.
     * @type {Element}
     */
    this.element = element;

    /**
     * Odo video wrapper element.
     * @type {Element}
     */
    this._odoVideoElement = this.element.querySelector('.odo-video');

    /**
     * Fallback image wrapper element.
     * @type {Element}
     */
    this._odoImageElement = this.element.querySelector('.odo-background-video__fallback-img');

    /**
     * Whether the media elment is the video or not.
     * @type {boolean}
     */
    this.isVideo = null;

    /**
     * A promise which resolves when the video loads or when the image loads.
     * @type {Promise}
     */
    this.ready = new Promise(function (resolve) {
      _this2._resolve = resolve;
    });

    if (this._odoVideoElement) {
      OdoVideo.autoplay.then(this._handleAutoplayResult.bind(this));
    } else {
      this._cannotAutoplay();
    }

    // Cover it on resizes.
    this._resizeId = OdoWindowEvents.onResize(this._handleResize.bind(this));
  }

  BackgroundVideo.prototype._handleAutoplayResult = function _handleAutoplayResult(canAutoplay) {
    if (canAutoplay) {
      this._canAutoplay();
    } else {
      this._cannotAutoplay();
    }
  };

  /**
   * Browser supports autoplay. When the video enters the viewport it will autoplay.
   */


  BackgroundVideo.prototype._canAutoplay = function _canAutoplay() {
    // Reveal video element.
    this._odoVideoElement.classList.remove('hidden');

    // Initialize odo component.
    this._video = new OdoVideo(this._odoVideoElement, {
      controls: OdoVideo.Controls.NONE,
      pauseOnClick: false
    });

    this._viewportId = OdoViewport.add({
      element: this._odoVideoElement,
      threshold: '20%',
      enter: this._play.bind(this),
      exit: this._pause.bind(this)
    });

    var _this = this;

    function done() {
      this.removeEventListener('loadedmetadata', done);
      this.removeEventListener('error', done);
      _this._ready();
    }

    var videoEl = this._video.getVideoElement();
    videoEl.addEventListener('loadedmetadata', done);
    videoEl.addEventListener('error', done);

    this._video.listenOnData(OdoVideo.VideoEvents.LOADED_DATA, this._showFirstFrame.bind(this));

    this.isVideo = true;

    // Use js to cover the video.
    OdoObjectFit.cover(videoEl);
  };

  /**
   * Browser doesn't support autoplaying video without user interaction, fall back
   * to a static responsive image.
   */


  BackgroundVideo.prototype._cannotAutoplay = function _cannotAutoplay() {
    var img = this._odoImageElement.querySelector('img');
    this._odoImageElement.classList.add('odo-responsive-img');
    this._odoImageElement.classList.remove('hidden');

    // Tell Odo about our new responsive image.
    OdoResponsiveImages.add(this._odoImageElement);

    var _this = this;

    function done() {
      this.removeEventListener('load', done);
      this.removeEventListener('error', done);
      _this._ready();
    }

    img.addEventListener('load', done);
    img.addEventListener('error', done);

    this.isVideo = false;

    // Use js to cover the image.
    OdoObjectFit.cover(img);
  };

  BackgroundVideo.prototype._play = function _play() {
    this._video.play();
  };

  BackgroundVideo.prototype._pause = function _pause() {
    this._video.pause();
  };

  /**
   * The image has loaded or the video has started playing.
   * @private
   */


  BackgroundVideo.prototype._ready = function _ready() {
    this._resolve();
  };

  /**
   * Set the video the first frame to trigger it to show up in Safari 8.
   *
   * TODO: this doesn't work when preload="metadata" in Safari because it doesn't
   * even download the first frame.
   *
   * @private
   */


  BackgroundVideo.prototype._showFirstFrame = function _showFirstFrame() {
    if (!this._video.isPlaying) {
      this._video.getVideoElement().currentTime = 0;
    }
  };

  BackgroundVideo.prototype._handleResize = function _handleResize() {
    OdoObjectFit.cover(this.mediaElement);
  };

  BackgroundVideo.prototype.dispose = function dispose() {
    OdoWindowEvents.remove(this._resizeId);
    this._resizeId = null;

    if (this._video) {
      this._video.dispose();
      OdoViewport.remove(this._viewportId);
      this._viewportId = null;
      this.isVideo = null;
    }
  };

  createClass(BackgroundVideo, [{
    key: 'videoElement',
    get: function get$$1() {
      return this._odoVideoElement;
    }
  }, {
    key: 'imageElement',
    get: function get$$1() {
      return this._odoImageElement;
    }
  }, {
    key: 'mediaElement',
    get: function get$$1() {
      if (this.isVideo) {
        return this._video.getVideoElement();
      }

      return this._odoImageElement.querySelector('img');
    }
  }]);
  return BackgroundVideo;
}();

return BackgroundVideo;

})));
//# sourceMappingURL=odo-background-video.js.map
