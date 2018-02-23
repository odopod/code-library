/**
 * @fileoverview Add a odo video component which plays in the background when
 * the element comes into view and falls back to an image if the browser cannot
 * autoplay video.
 *
 * @author Glen Cheney <glen@odopod.com>
 * @author Evan Vaughn
 */

import OdoVideo from '@odopod/odo-video';
import OdoWindowEvents from '@odopod/odo-window-events';
import OdoViewport from '@odopod/odo-viewport';
import OdoObjectFit from '@odopod/odo-object-fit';
import OdoResponsiveImages from '@odopod/odo-responsive-images';

class BackgroundVideo {
  constructor(element) {
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
    this.ready = new Promise((resolve) => {
      this._resolve = resolve;
    });

    if (this._odoVideoElement) {
      OdoVideo.autoplay.then(this._handleAutoplayResult.bind(this));
    } else {
      this._cannotAutoplay();
    }

    // Cover it on resizes.
    this._resizeId = OdoWindowEvents.onResize(this._handleResize.bind(this));
  }

  _handleAutoplayResult(canAutoplay) {
    if (canAutoplay) {
      this._canAutoplay();
    } else {
      this._cannotAutoplay();
    }
  }

  /**
   * Browser supports autoplay. When the video enters the viewport it will autoplay.
   */
  _canAutoplay() {
    // Reveal video element.
    this._odoVideoElement.classList.remove('hidden');

    // Initialize odo component.
    this._video = new OdoVideo(this._odoVideoElement, {
      controls: OdoVideo.Controls.NONE,
      pauseOnClick: false,
    });

    this._viewportId = OdoViewport.add({
      element: this._odoVideoElement,
      threshold: '20%',
      enter: this._play.bind(this),
      exit: this._pause.bind(this),
    });

    const _this = this;

    function done() {
      this.removeEventListener('loadedmetadata', done);
      this.removeEventListener('error', done);
      _this._ready();
    }

    const videoEl = this._video.getVideoElement();
    videoEl.addEventListener('loadedmetadata', done);
    videoEl.addEventListener('error', done);

    this._video.listenOnData(
      OdoVideo.VideoEvents.LOADED_DATA,
      this._showFirstFrame.bind(this),
    );

    this.isVideo = true;

    // Use js to cover the video.
    OdoObjectFit.cover(videoEl);
  }

  /**
   * Browser doesn't support autoplaying video without user interaction, fall back
   * to a static responsive image.
   */
  _cannotAutoplay() {
    const img = this._odoImageElement.querySelector('img');
    this._odoImageElement.classList.add('odo-responsive-img');
    this._odoImageElement.classList.remove('hidden');

    // Tell Odo about our new responsive image.
    OdoResponsiveImages.add(this._odoImageElement);

    const _this = this;

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
  }

  _play() {
    this._video.play();
  }

  _pause() {
    this._video.pause();
  }

  /**
   * The image has loaded or the video has started playing.
   * @private
   */
  _ready() {
    this._resolve();
  }

  /**
   * Set the video the first frame to trigger it to show up in Safari 8.
   *
   * TODO: this doesn't work when preload="metadata" in Safari because it doesn't
   * even download the first frame.
   *
   * @private
   */
  _showFirstFrame() {
    if (!this._video.isPlaying) {
      this._video.getVideoElement().currentTime = 0;
    }
  }

  _handleResize() {
    OdoObjectFit.cover(this.mediaElement);
  }

  get videoElement() {
    return this._odoVideoElement;
  }

  get imageElement() {
    return this._odoImageElement;
  }

  get mediaElement() {
    if (this.isVideo) {
      return this._video.getVideoElement();
    }

    return this._odoImageElement.querySelector('img');
  }

  dispose() {
    OdoWindowEvents.remove(this._resizeId);
    this._resizeId = null;

    if (this._video) {
      this._video.dispose();
      OdoViewport.remove(this._viewportId);
      this._viewportId = null;
      this.isVideo = null;
    }
  }
}

export default BackgroundVideo;
