(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('screenfull')) :
	typeof define === 'function' && define.amd ? define(['screenfull'], factory) :
	(global.OdoVideo = factory(global.screenfull));
}(this, (function (screenfull) { 'use strict';

screenfull = screenfull && screenfull.hasOwnProperty('default') ? screenfull['default'] : screenfull;

var settings = {
  Classes: {
    BASE: 'odo-video',

    IS_PLAYING: 'odo-video--playing',
    IS_FULLSCREEN: 'odo-video--fullscreen',
    IS_MUTED: 'odo-video--muted',
    IS_BUFFERING: 'odo-video--buffering',
    IS_IDLE: 'odo-video--idle',
    NO_FLEXBOX: 'odo-video--no-flexbox',
    CONTROLS_STACKED: 'odo-video__controls--stacked',
    CONTROLS_HIDDEN: 'odo-video__controls--hidden',

    CONTROLS: 'odo-video__controls',
    PLAY_TOGGLE: 'odo-video__play-toggle',
    PLAY_CONTROL: 'odo-video__play-control',
    PAUSE_CONTROL: 'odo-video__pause-control',
    PROGRESS_CONTAINER: 'odo-video__progress-container',
    PROGRESS_HOLDER: 'odo-video__progress-holder',
    BUFFER: 'odo-video__buffer',
    PROGRESS: 'odo-video__progress',
    CURRENT_TIME: 'odo-video__current-time',
    VOLUME: 'odo-video__volume',
    MUTE_CONTROL: 'odo-video__mute-control',
    UNMUTE_CONTROL: 'odo-video__unmute-control',
    FULLSCREEN: 'odo-video__fullscreen',
    FULLSCREEN_CONTROL: 'odo-video__fullscreen-control',
    EXIT_FULLSCREEN_CONTROL: 'odo-video__exit-fullscreen-control',
    FLEXIBLE_SPACE: 'odo-video__flexible-space'
  },

  Icons: {
    FULLSCREEN: '<svg viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2H8v2h2.586L8 6.587 9.414 8 12 5.415V8h2V2zM8 9.414L6.586 8 4 10.586V8H2v6h6v-2H5.415z"/></svg>',
    EXIT_FULLSCREEN: '<svg viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path d="M15 2.4L13.6 1 11 3.6V1H9v6h6V5h-2.6L15 2.4zM5 9H1v2h2.6L1 13.6 2.4 15 5 12.4V15h2V9H5z"/></svg>',
    AUDIO_ON: '<svg viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path d="M1 5.366v5.294c0 .177.142.32.317.32h2.89c.093 0 .18.034.254.093l4.505 3.743c.16.135.4.018.402-.19l.002-13.25c0-.21-.243-.325-.403-.193L4.47 4.923c-.077.064-.173.098-.27.098H1.33c-.235 0-.33.17-.33.346zm10.292-1.03c-.295-.296-.76-.296-1.057 0-.292.296-.292.775.002 1.07v-.002c.642.652 1.04 1.55 1.04 2.54 0 .992-.396 1.884-1.04 2.535-.294.295-.294.774 0 1.07.143.148.334.222.526.222.19 0 .388-.074.528-.22.91-.922 1.476-2.202 1.476-3.606 0-1.41-.567-2.69-1.476-3.61h.002zm1.71-1.732c-.294-.296-.76-.296-1.053 0-.294.296-.293.772 0 1.066 1.08 1.096 1.754 2.602 1.754 4.273s-.667 3.176-1.753 4.273c-.294.294-.294.77 0 1.067.142.146.337.222.53.222.19 0 .386-.076.526-.222 1.35-1.366 2.19-3.257 2.19-5.34-.008-2.08-.843-3.975-2.194-5.34z"/></svg>',
    AUDIO_OFF: '<svg viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path d="M1 5.366v5.294c0 .177.142.32.317.32h2.89c.093 0 .18.034.254.093l4.505 3.743c.16.135.4.018.402-.19l.002-13.25c0-.21-.243-.325-.403-.193L4.47 4.923c-.077.064-.173.098-.27.098H1.33c-.235 0-.33.17-.33.346z"/></svg>'
  },

  IDLE_TIMEOUT: 2000,

  Defaults: {
    controls: 1,
    layoutControls: null,
    updateControls: null,
    pauseOnClick: true
  },

  Controls: {
    NONE: 0,
    INLINE_PROGRESS: 1,
    STACKED_PROGRESS: 2,
    CUSTOM: 3
  },

  VideoEvents: {
    LOADED_METADATA: {
      name: 'loadedmetadata',
      readyState: 1
    },
    LOADED_DATA: {
      name: 'loadeddata',
      readyState: 2
    },
    CAN_PLAY: {
      name: 'canplay',
      readyState: 3
    },
    CAN_PLAYTHROUGH: {
      name: 'canplaythrough',
      readyState: 4
    }
  }
};

// Determine support for videos. From Modernizr source.
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/video.js

// Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
var supportTest = (function () {
  var elem = document.createElement('video');
  var bool = !!elem.canPlayType;

  // IE9 Running on Windows Server 2008 can cause an exception to be thrown, bug #224
  // End of life for 'mainstream' WS2008 was 2015-1-13.
  /* istanbul ignore next */
  if (bool) {
    bool = new Boolean(bool); // eslint-disable-line no-new-wrappers
    bool.ogg = elem.canPlayType('video/ogg; codecs="theora"');

    // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
    bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"');
    bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"');
    bool.vp9 = elem.canPlayType('video/webm; codecs="vp9"');
    bool.hls = elem.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"');
  }

  return bool;
});

function test(support) {
  // If the test has already passed, return a resolved promise.
  if (test.HAS_LOCAL_STORAGE && window.localStorage.getItem('odovideoautoplay') === 'true') {
    return Promise.resolve(true);
  }

  // Retrieve the number of autoplay test attempts. Max is 3.
  var tries = test.HAS_LOCAL_STORAGE && parseInt(window.localStorage.getItem('odovideoautoplaytries'), 10) || 0;
  if (tries > 2) {
    return Promise.resolve(false);
  }

  /* istanbul ignore next */
  return new Promise(function (resolve) {
    var timeout = void 0;

    // Chrome can handle 300ms. IE11 requires at least 900 to avoid failing consistenly.
    var waitTime = 1000;
    var elem = document.createElement('video');

    var complete = function complete(bool) {
      if (test.HAS_LOCAL_STORAGE) {
        window.localStorage.setItem('odovideoautoplay', bool);
        window.localStorage.setItem('odovideoautoplaytries', tries + 1);
      }

      resolve(bool);
    };

    var testAutoplay = function testAutoplay(arg) {
      clearTimeout(timeout);
      elem.removeEventListener('playing', testAutoplay);
      complete(arg && arg.type === 'playing' || elem.currentTime !== 0);
      elem.parentNode.removeChild(elem);
    };

    // Skip the test if video itself, or the autoplay element on it isn't supported.
    if (!support || !('autoplay' in elem)) {
      complete(false);
      return;
    }

    // Starting with iOS 10, video[autoplay] videos must be on screen, visible
    // through css, and inserted into the DOM.
    // https://webkit.org/blog/6784/new-video-policies-for-ios/
    elem.style.cssText = 'position:fixed;top:0;left:0;height:1px;width:1px;opacity:0;';
    elem.src = 'data:video/mp4;base64,AAAAFGZ0eXBNU05WAAACAE1TTlYAAAOUbW9vdgAAAGxtdmhkAAAAAM9ghv7PYIb+AAACWAAACu8AAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAnh0cmFrAAAAXHRraGQAAAAHz2CG/s9ghv4AAAABAAAAAAAACu8AAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAFAAAAA4AAAAAAHgbWRpYQAAACBtZGhkAAAAAM9ghv7PYIb+AAALuAAANq8AAAAAAAAAIWhkbHIAAAAAbWhscnZpZGVBVlMgAAAAAAABAB4AAAABl21pbmYAAAAUdm1oZAAAAAAAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAVdzdGJsAAAAp3N0c2QAAAAAAAAAAQAAAJdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAFAAOABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAEmNvbHJuY2xjAAEAAQABAAAAL2F2Y0MBTUAz/+EAGGdNQDOadCk/LgIgAAADACAAAAMA0eMGVAEABGjuPIAAAAAYc3R0cwAAAAAAAAABAAAADgAAA+gAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAADgAAAAEAAABMc3RzegAAAAAAAAAAAAAADgAAAE8AAAAOAAAADQAAAA0AAAANAAAADQAAAA0AAAANAAAADQAAAA0AAAANAAAADQAAAA4AAAAOAAAAFHN0Y28AAAAAAAAAAQAAA7AAAAA0dXVpZFVTTVQh0k/Ou4hpXPrJx0AAAAAcTVREVAABABIAAAAKVcQAAAAAAAEAAAAAAAAAqHV1aWRVU01UIdJPzruIaVz6ycdAAAAAkE1URFQABAAMAAAAC1XEAAACHAAeAAAABBXHAAEAQQBWAFMAIABNAGUAZABpAGEAAAAqAAAAASoOAAEAZABlAHQAZQBjAHQAXwBhAHUAdABvAHAAbABhAHkAAAAyAAAAA1XEAAEAMgAwADAANQBtAGUALwAwADcALwAwADYAMAA2ACAAMwA6ADUAOgAwAAABA21kYXQAAAAYZ01AM5p0KT8uAiAAAAMAIAAAAwDR4wZUAAAABGjuPIAAAAAnZYiAIAAR//eBLT+oL1eA2Nlb/edvwWZflzEVLlhlXtJvSAEGRA3ZAAAACkGaAQCyJ/8AFBAAAAAJQZoCATP/AOmBAAAACUGaAwGz/wDpgAAAAAlBmgQCM/8A6YEAAAAJQZoFArP/AOmBAAAACUGaBgMz/wDpgQAAAAlBmgcDs/8A6YEAAAAJQZoIBDP/AOmAAAAACUGaCQSz/wDpgAAAAAlBmgoFM/8A6YEAAAAJQZoLBbP/AOmAAAAACkGaDAYyJ/8AFBAAAAAKQZoNBrIv/4cMeQ==';

    elem.setAttribute('autoplay', '');
    elem.setAttribute('muted', '');
    elem.setAttribute('playsinline', '');
    document.documentElement.appendChild(elem);

    // Wait for the next tick to add the listener, otherwise the element may
    // not have time to play in high load situations (e.g. the test suite).
    setTimeout(function () {
      elem.addEventListener('playing', testAutoplay);
      timeout = setTimeout(testAutoplay, waitTime);
    }, 0);
  });
}

// Support: Safari private browsing.
test.HAS_LOCAL_STORAGE = function () {
  try {
    var testKey = 'test';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) /* istanbul ignore next */{
    return false;
  }
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var Controls = function () {
  function Controls() {
    classCallCheck(this, Controls);
  }

  Controls.prototype.createElement = function createElement(type, options) {
    var el = document.createElement(type);
    Object.keys(options).forEach(function (k) {
      el[k] = options[k];
    });

    return el;
  };

  Controls.prototype.createElements = function createElements() {
    return {
      controls: this.createElement('div', {
        className: settings.Classes.CONTROLS
      }),
      playToggle: this.createElement('button', {
        className: settings.Classes.PLAY_TOGGLE,
        title: Controls.LABEL.PLAY_TOGGLE
      }),
      playControl: this.createElement('span', {
        className: settings.Classes.PLAY_CONTROL
      }),
      pauseControl: this.createElement('span', {
        className: settings.Classes.PAUSE_CONTROL
      }),
      progressContainer: this.createElement('div', {
        className: settings.Classes.PROGRESS_CONTAINER
      }),
      progressHolder: this.createElement('div', {
        className: settings.Classes.PROGRESS_HOLDER
      }),
      buffer: this.createElement('div', {
        className: settings.Classes.BUFFER
      }),
      progress: this.createElement('div', {
        className: settings.Classes.PROGRESS
      }),
      currentTime: this.createElement('div', {
        className: settings.Classes.CURRENT_TIME
      }),
      volumeToggle: this.createElement('button', {
        className: settings.Classes.VOLUME,
        title: Controls.LABEL.VOLUME
      }),
      muteControl: this.createElement('span', {
        className: settings.Classes.MUTE_CONTROL,
        innerHTML: settings.Icons.AUDIO_ON
      }),
      unmuteControl: this.createElement('span', {
        className: settings.Classes.UNMUTE_CONTROL,
        innerHTML: settings.Icons.AUDIO_OFF
      }),
      fullScreenToggle: this.createElement('button', {
        className: settings.Classes.FULLSCREEN,
        title: Controls.LABEL.FULLSCREEN
      }),
      enterFullscreen: this.createElement('span', {
        className: settings.Classes.FULLSCREEN_CONTROL,
        innerHTML: settings.Icons.FULLSCREEN
      }),
      exitFullscreen: this.createElement('span', {
        className: settings.Classes.EXIT_FULLSCREEN_CONTROL,
        innerHTML: settings.Icons.EXIT_FULLSCREEN
      }),
      flexibleSpace: this.createElement('div', {
        className: settings.Classes.FLEXIBLE_SPACE
      })
    };
  };

  Controls.prototype.create = function create(style, customFn) {
    var elements = this.createElements();

    elements.playToggle.appendChild(elements.playControl);
    elements.playToggle.appendChild(elements.pauseControl);

    elements.volumeToggle.appendChild(elements.muteControl);
    elements.volumeToggle.appendChild(elements.unmuteControl);

    elements.fullScreenToggle.appendChild(elements.enterFullscreen);
    elements.fullScreenToggle.appendChild(elements.exitFullscreen);

    elements.progressHolder.appendChild(elements.buffer);
    elements.progressHolder.appendChild(elements.progress);
    elements.progressContainer.appendChild(elements.progressHolder);

    switch (style) {
      case settings.Controls.INLINE_PROGRESS:
        this._createInline(elements);
        break;
      case settings.Controls.NONE:

        // When no controls are specified, create them anyways. It's easier to hide
        // the controls and still have them in the DOM than it is to many if-statements
        // checking if the controls exist before modifying them.
        this._createInline(elements);
        elements.controls.classList.add(settings.Classes.CONTROLS_HIDDEN);
        break;
      case settings.Controls.STACKED_PROGRESS:
        this._createStacked(elements);
        break;
      case settings.Controls.CUSTOM:
        customFn(elements);
        break;
      // no default
    }

    return elements.controls;
  };

  Controls.prototype._createInline = function _createInline(elements) {
    elements.controls.appendChild(elements.playToggle);
    elements.controls.appendChild(elements.progressContainer);
    elements.controls.appendChild(elements.currentTime);
    elements.controls.appendChild(elements.volumeToggle);
    elements.controls.appendChild(elements.fullScreenToggle);
  };

  Controls.prototype._createStacked = function _createStacked(elements) {
    elements.controls.appendChild(elements.progressContainer);
    elements.controls.appendChild(elements.playToggle);
    elements.controls.appendChild(elements.flexibleSpace);
    elements.controls.appendChild(elements.currentTime);
    elements.controls.appendChild(elements.volumeToggle);
    elements.controls.appendChild(elements.fullScreenToggle);
    elements.controls.classList.add(settings.Classes.CONTROLS_STACKED);
  };

  return Controls;
}();

Controls.LABEL = {
  PLAY_TOGGLE: 'toggle video playback.',
  VOLUME: 'toggle mute for video.',
  FULLSCREEN: 'toggle video fullscreen mode.'
};

/**
 * Features:
 *
 * Autoplay support callbacks.
 * Skinnable UI controls.
 * Fullscreen mode.
 * Click-to-seek.
 * Preload video.
 * Dynamically update source.
 * Hide controls & mouse in fullscreen when idle.
 * Spacebar pauses video in fullscreen mode.
 * Function to define control structure.
 * Callback for updating controls on video progress.
 */

var Video = function () {
  function Video(element, options) {
    classCallCheck(this, Video);

    /**
     * @type {Element}
     */
    this.element = element;

    /**
     * @type {HTMLVideoElement}
     */
    this.videoEl = this._findVideoElement();

    /**
     * Random id for this instance.
     */
    this.id = Math.random().toString(36).substring(7);

    /**
     * Options for this instance.
     * @type {object}
     */
    this.options = Object.assign({}, Video.Defaults, options);

    this.isPlaying = this._isPlaying();
    this.isFullscreen = false;
    this._idleTimeout = null;

    /**
     * Whether the browser can go in fullscreen mode. This will be true for iOS
     * because the video element can go fullscreen, but false for IE<11.
     * @private {boolean}
     */
    this._noFullscreen = false;

    this.element.classList.toggle(Video.Classes.NO_FLEXBOX, Video.NO_FLEXBOX);

    // Set id attributes for each source.
    this._setSourceIds();
    this._createControls();
    this._saveElements();
    this.bindEvents();

    if (this._isMetadataLoaded()) {
      this._setProgressDisplay();
      this._setBufferDisplay();
    }

    this.autoplay = Promise.resolve(Video.autoplay);
  }

  /**
   * Bind the correct `this` context to each event listener. The native `bind`
   * method returns a different function each time `bind` is called, so the value
   * must be saved in order to remove the correct listener.
   * @protected
   */


  Video.prototype._bindListeners = function _bindListeners() {
    this._onMetadataLoaded = this._handleMetadataLoaded.bind(this);
    this._onClick = this._handleClick.bind(this);
    this._onPlay = this._handlePlaying.bind(this);
    this._onPause = this._handlePaused.bind(this);
    this._onTimeUpdate = this._handleTimeUpdate.bind(this);
    this._onProgress = this._handleProgress.bind(this);
    this._onFullscreenToggle = this.toggleFullscreen.bind(this);
    this._onFullscreenChange = this._fullscreenChanged.bind(this);
    this._onVolumeToggle = this.toggleVolume.bind(this);
    this._onProgressClick = this._handleProgressClick.bind(this);
    this._onSeeking = this._handleSeeking.bind(this);
    this._onSeeked = this._handleSeeked.bind(this);
    this._onMouseMove = this._returnFromIdle.bind(this);
    this._onIdleTimeout = this._wentIdle.bind(this);
    this._onKeyboardPlaybackToggle = this._handleKeyboardPlaybackToggle.bind(this);
  };

  /**
   * Add event listeners to the video and UI elements.
   * @protected
   */


  Video.prototype.bindEvents = function bindEvents() {
    this._bindListeners();
    this._waitForMetadata();

    if (this.options.pauseOnClick) {
      this.videoEl.addEventListener('click', this._onClick);
    }

    // Sent when playback is paused.
    this.videoEl.addEventListener('pause', this._onPause);

    // Sent when the media begins to play (either for the first time, after having
    // been paused, or after ending and then restarting).
    this.videoEl.addEventListener('playing', this._onPlay);
    this.videoEl.addEventListener('timeupdate', this._onTimeUpdate);
    this.videoEl.addEventListener('progress', this._onProgress);
    // this.videoEl.addEventListener('volumechange', this._onVolumeChange);
    this.videoEl.addEventListener('seeking', this._onSeeking);
    this.videoEl.addEventListener('seeked', this._onSeeked);

    this.getElementByClass(Video.Classes.PLAY_TOGGLE).addEventListener('click', this._onClick);
    this.getElementByClass(Video.Classes.VOLUME).addEventListener('click', this._onVolumeToggle);
    this.getElementByClass(Video.Classes.PROGRESS_HOLDER).addEventListener('click', this._onProgressClick);
    this.getElementByClass(Video.Classes.FULLSCREEN).addEventListener('click', this._onFullscreenToggle);

    if (Video.screenfull.enabled) {
      document.addEventListener(Video.screenfull.raw.fullscreenchange, this._onFullscreenChange);
      document.addEventListener(Video.screenfull.raw.fullscreenerror, this._onFullscreenChange);

      // iOS handles full screen differently.
    } else if (this.videoEl.webkitSupportsFullscreen) {
      this.videoEl.addEventListener('webkitbeginfullscreen', this._onFullscreenChange);
      this.videoEl.addEventListener('webkitendfullscreen', this._onFullscreenChange);
    } else {
      this._noFullscreen = true;
    }
  };

  /**
   * Checks the network state of the video element. Returns true if the metadata
   * for the video is present.
   * @return {boolean}
   * @private
   */


  Video.prototype._isMetadataLoaded = function _isMetadataLoaded() {
    return this.videoEl.readyState > 0;
  };

  /**
   * Add the `loadedmetadata` event listener if the video has not loaded yet, or
   * call the event handler directly if it has.
   * @private
   */


  Video.prototype._waitForMetadata = function _waitForMetadata() {
    if (this._isMetadataLoaded()) {
      this._handleMetadataLoaded();
    } else {
      this.videoEl.addEventListener('loadedmetadata', this._onMetadataLoaded);
    }
  };

  /**
   * Save references to UI elements which needs to be constantly updated.
   * @protected
   */


  Video.prototype._saveElements = function _saveElements() {
    this.currentTimeEl = this.getElementByClass(Video.Classes.CURRENT_TIME);
    this.progressEl = this.getElementByClass(Video.Classes.PROGRESS);
    this.bufferEl = this.getElementByClass(Video.Classes.BUFFER);
  };

  /**
   * Separated into its own function so sinon can stub it in the tests.
   * @return {HTMLVideoElement}
   * @private
   */


  Video.prototype._findVideoElement = function _findVideoElement() {
    return this.element.getElementsByTagName('video')[0];
  };

  /**
   * Whether the video is currently playing.
   * @return {boolean}
   */


  Video.prototype._isPlaying = function _isPlaying() {
    if (this.videoEl.ended || this.videoEl.paused) {
      return false;
    }
    return true;
  };

  /**
   * For each <source> element, set a unique id on it.
   * @private
   */


  Video.prototype._setSourceIds = function _setSourceIds() {
    var _this = this;

    this.getSourceElements().forEach(function (source) {
      source.id = _this.id + source.type.split('/')[1];
    });
  };

  /**
   * Retrieve all <source> elements within the video.
   * @return {Array.<HTMLSourceElement>}
   */


  Video.prototype.getSourceElements = function getSourceElements() {
    return Array.from(this.videoEl.getElementsByTagName('source'));
  };

  /**
   * Return the main element this component was instantiated with.
   * @return {Element}
   */


  Video.prototype.getElement = function getElement() {
    return this.element;
  };

  /**
   * Returns the <video> element associated with this component.
   * @return {HTMLVideoElement}
   */


  Video.prototype.getVideoElement = function getVideoElement() {
    return this.videoEl;
  };

  /**
   * Retrieve an element from within the main element by a class name.
   * @param {string} className Class name to search for.
   * @return {?Element} The element or null if it isn't found.
   */


  Video.prototype.getElementByClass = function getElementByClass(className) {
    return this.element.getElementsByClassName(className)[0];
  };

  /**
   * Play the current video.
   * https://googlechrome.github.io/samples/play-return-promise/
   * @return {?Promise<void>} Chrome 50+, Firefox 53+, and Safari 10+ return a
   *     promise which is rejected if the device cannot autoplay.
   */


  Video.prototype.play = function play() {
    return this.videoEl.play();
  };

  /**
   * Pause the currently playing video.
   */


  Video.prototype.pause = function pause() {
    this.videoEl.pause();
  };

  /**
   * If playing, pause. If paused, play.
   */


  Video.prototype.togglePlayback = function togglePlayback() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  };

  /**
   * Get the current time, in seconds.
   * @return {number}
   */


  Video.prototype.getCurrentTime = function getCurrentTime() {
    return this.videoEl.currentTime;
  };

  /**
   * Go to a specified time in the video.
   * @param {number} time Time in seconds.
   */


  Video.prototype.setCurrentTime = function setCurrentTime(time) {
    this.videoEl.currentTime = time;
  };

  /**
   * Mute the video.
   */


  Video.prototype.mute = function mute() {
    this.videoEl.volume = 0;
    this.element.classList.add(Video.Classes.IS_MUTED);
  };

  /**
   * Unmute the video.
   */


  Video.prototype.unmute = function unmute() {
    this.videoEl.volume = 1;
    this.element.classList.remove(Video.Classes.IS_MUTED);
  };

  /**
   * Whether the video is currently muted.
   * @return {boolean}
   */


  Video.prototype.isMuted = function isMuted() {
    return this.videoEl.volume === 0;
  };

  /**
   * Mute the video if it's playing audio or unmute it if it's already muted.
   */


  Video.prototype.toggleVolume = function toggleVolume() {
    if (this.isMuted()) {
      this.unmute();
    } else {
      this.mute();
    }
  };

  /**
   * Update the current video source. This method changes the appropriate <source>
   * `src` property.
   *
   * IE9 does not work when the <video>s `src` property or attribute is updated.
   *
   * @param {string} src Absolute or relative path to the video, without the extension.
   *     e.g. "/videos/cool-feature".
   */


  Video.prototype.updateSource = function updateSource(src) {
    var _this2 = this;

    var _Video$getVideoType = Video.getVideoType(),
        extension = _Video$getVideoType.extension;

    var sources = this.getSourceElements();

    // Find the <source> element by Id.
    var source = sources.filter(function (source) {
      return source.id === _this2.id + extension;
    })[0];

    var videoSource = src + '.' + extension;

    // Update the source's src.
    source.setAttribute('src', videoSource);

    this.videoEl.load();

    // Reset progress bars.
    this._setProgressDisplay();
    this._setBufferDisplay();

    // When metadata loads, update the times.
    this._waitForMetadata();
  };

  /**
   * Show the video is currently buffering.
   * @protected
   */


  Video.prototype.showBuffering = function showBuffering() {
    this.element.classList.add(Video.Classes.IS_BUFFERING);
  };

  /**
   * Show the video is done buffering.
   * @protected
   */


  Video.prototype.hideBuffering = function hideBuffering() {
    this.element.classList.remove(Video.Classes.IS_BUFFERING);
  };

  /**
   * Converts a time value to MMSS, so 91 seconds is "1:31".
   * @param {number} currentTime Time in seconds.
   * @return {string} Human readable time.
   */


  Video.getPrettyTime = function getPrettyTime(currentTime) {
    var hours = Math.floor(currentTime / 3600);
    var minutes = Math.floor((currentTime - hours * 3600) / 60);
    var seconds = currentTime - hours * 3600 - minutes * 60;

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    var time = minutes + ':' + seconds;
    if (hours > 0) {
      if (minutes < 10) {
        time = '0' + time;
      }

      time = hours + ':' + time;
    }

    return time;
  };

  /**
   * Generate the controls elemenet and append it to the main element.
   * @private
   */


  Video.prototype._createControls = function _createControls() {
    var controls = new Video.ControlsCreator();
    var mainElement = controls.create(this.options.controls, this.options.layoutControls);
    this.element.appendChild(mainElement);
  };

  /**
   * Update the controls state/display with the new current time.
   * @private
   */


  Video.prototype._updateControls = function _updateControls() {
    var seconds = this.getCurrentTime();
    this._setCurrentTimeDisplay(seconds);
    this._setProgressDisplay();

    // Give a hook to update custom controls.
    if (this.options.updateControls) {
      this.options.updateControls(seconds);
    }
  };

  /**
   * Sets the current time element's text to a pretty time given a float.
   * @param {number} seconds The current time of the video.
   */


  Video.prototype._setCurrentTimeDisplay = function _setCurrentTimeDisplay(seconds) {
    this.currentTimeEl.textContent = Video.getPrettyTime(Math.round(seconds));
  };

  /**
   * Set the progress elements to a percentage.
   * @param {number} percentage Number between 0 and 1. If undefined, the percentage
   *     will be calculated from the video's current time and duration.
   * @private
   */


  Video.prototype._setProgressDisplay = function _setProgressDisplay() {
    var percentage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.videoEl.currentTime / this.videoEl.duration;

    this.progressEl.style.width = percentage * 100 + '%';
  };

  /**
   * Determine the amount the video has buffered and set the buffer element's width
   * as that percentage.
   * @private
   */


  Video.prototype._setBufferDisplay = function _setBufferDisplay() {
    // Progress events can be emitted before there is anything buffered.
    var percentage = this.videoEl.buffered.length > 0 ? this.videoEl.buffered.end(0) / this.videoEl.duration : 0;

    this.bufferEl.style.width = percentage * 100 + '%';
  };

  /**
   * Clicked the fullscreen icon. Request or exit from fullscreen.
   */


  Video.prototype.toggleFullscreen = function toggleFullscreen() {
    if (Video.screenfull) {
      // Handle it the standardized way.
      Video.screenfull.toggle(this.element);
    } else if (this._noFullscreen) {
      // Support: IE<11. Since there won't be any entered/exited fullscreen events,
      // that callback must be invoked immediately.
      this._fullscreenChanged();
    } else {
      // Since the native video controls will be shown and not the Video
      // custom controls, it can be assumed that this event handler will only
      // be triggered by requesting fullscreen.
      this.videoEl.webkitEnterFullscreen();
    }
  };

  /**
   * Event handler for both fullscreenchange and fullscreenerror. The state of
   * fullscreen has changed and styles need to be updated.
   * @private
   */


  Video.prototype._fullscreenChanged = function _fullscreenChanged() {
    this.isFullscreen = !this.isFullscreen;
    this._toggleFullscreenState();
  };

  Video.prototype._toggleFullscreenState = function _toggleFullscreenState() {
    this.element.classList.toggle(Video.Classes.IS_FULLSCREEN, this.isFullscreen);

    if (this.isFullscreen) {
      this._startIdleTimer();

      // Take focus off the fullscreen button because the spacebar should pause
      // the video, but when it's focused, it will exit fullscreen.
      document.activeElement.blur();
      this.element.focus();
      this.element.addEventListener('mousemove', this._onMouseMove);

      // Use keyup instead of keypress because special keys (control, shift, alt, etc.)
      // do not trigger the keypress event.
      document.addEventListener('keyup', this._onKeyboardPlaybackToggle);
    } else {
      this._returnFromIdle();

      // Return from idle starts a new timer, which isn't wanted when closing fullscreen.
      clearTimeout(this._idleTimeout);
      this.element.removeEventListener('mousemove', this._onMouseMove);
      document.removeEventListener('keyup', this._onKeyboardPlaybackToggle);
    }
  };

  /**
   * When the user stops interacting with the page, the cursor should disappear and
   * the controls should be hidden.
   * @private
   */


  Video.prototype._wentIdle = function _wentIdle() {
    this.element.classList.add(Video.Classes.IS_IDLE);
  };

  /**
   * When returning from the idle state, the cursor and controls should be shown.
   * Another timer is started to wait for idle state again.
   * @private
   */


  Video.prototype._returnFromIdle = function _returnFromIdle() {
    clearTimeout(this._idleTimeout);
    this._startIdleTimer();
    this.element.classList.remove(Video.Classes.IS_IDLE);
  };

  /**
   * Sets a timeout which will trigger the `wentIdle` method when it expires.
   * @private
   */


  Video.prototype._startIdleTimer = function _startIdleTimer() {
    this._idleTimeout = setTimeout(this._onIdleTimeout, Video.IDLE_TIMEOUT);
  };

  /**
   * Calculate the position of the click relative to the element the click listener
   * was bound to.
   * @param {MouseEvent} event Event object.
   * @return {{x: number, y: number}}
   * @private
   */


  Video._getClickOffset = function _getClickOffset(event) {
    if ('offsetX' in event) {
      return {
        x: event.offsetX,
        y: event.offsetY
      };
    }

    var rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  /**
   * Event handler for the `loadedmetadata` event. Update UI with new data.
   * @private
   */


  Video.prototype._handleMetadataLoaded = function _handleMetadataLoaded() {
    this.videoEl.removeEventListener('loadedmetadata', this._onMetadataLoaded);
    this._setCurrentTimeDisplay(this.videoEl.duration);
  };

  /**
   * Clicked on the main element. Toggle video playback.
   */


  Video.prototype._handleClick = function _handleClick() {
    this.togglePlayback();
  };

  /**
   * Event handler for the `playing` event. Add the is-playing class.
   * @private
   */


  Video.prototype._handlePlaying = function _handlePlaying() {
    this.isPlaying = true;
    this.element.classList.toggle(Video.Classes.IS_PLAYING, this.isPlaying);
  };

  /**
   * Event handler for the `paused` event. Remove the is-playing class.
   * @private
   */


  Video.prototype._handlePaused = function _handlePaused() {
    this.isPlaying = false;
    this.element.classList.toggle(Video.Classes.IS_PLAYING, this.isPlaying);
  };

  /**
   * Event handler for the `timeupdate` event. Update the UI.
   * @private
   */


  Video.prototype._handleTimeUpdate = function _handleTimeUpdate() {
    this._updateControls();
  };

  /**
   * Event handler for the `progress` event. Update the buffer display bar.
   * @private
   */


  Video.prototype._handleProgress = function _handleProgress() {
    this._setBufferDisplay();
  };

  /**
   * Clicked the progress bar track. Seek to the location of the click.
   * @param {MouseEvent} evt Event object.
   * @private
   */


  Video.prototype._handleProgressClick = function _handleProgressClick(evt) {
    var offset = Video._getClickOffset(evt);
    var width = evt.currentTarget.offsetWidth;
    var percent = offset.x / width;
    this._setProgressDisplay(percent);
    this.setCurrentTime(percent * this.videoEl.duration);
  };

  /**
   * Video started seeking. Show the user it's buffering.
   * @private
   */


  Video.prototype._handleSeeking = function _handleSeeking() {
    // Avoid adding the buffering class when the video is looping - issue #1
    if (this.videoEl.buffered.length === 0 || this.videoEl.buffered.end(0) < this.videoEl.currentTime) {
      this.showBuffering();
    }
  };

  /**
   * Video stopped seeking. Show the user it's ready to play.
   * @private
   */


  Video.prototype._handleSeeked = function _handleSeeked() {
    this.hideBuffering();
  };

  /**
   * If the spacebar is pressed, toggle playback.
   * @param {KeyboardEvent} evt Event object.
   * @private
   */


  Video.prototype._handleKeyboardPlaybackToggle = function _handleKeyboardPlaybackToggle(evt) {
    // Trigger the controls to show again.
    this._returnFromIdle();

    // Spacebar.
    if (Video._getWhichKey(evt) === 32) {
      this.togglePlayback();
      evt.preventDefault();
    }
  };

  /**
   * Crossbrowser way to get the key which was pressed in a keyboard event.
   * @param {KeyboardEvent} event Event object.
   * @return {number}
   * @private
   */


  Video._getWhichKey = function _getWhichKey(event) {
    if (event.which) {
      return event.which;
    }
    return event.charCode || event.keyCode;
  };

  /**
   * Handler for triggering events on readyState or video data events
   * @param {Object} event Object containing event name and readyState.
   * @param {function():void} cb Callback function for event.
   * @public
   */


  Video.prototype.listenOnData = function listenOnData(event, cb) {
    var _this3 = this;

    var _loaded = void 0;
    if (this.videoEl.readyState > event.readyState) {
      cb();
    } else {
      this.videoEl.addEventListener(event.name, _loaded = function loaded() {
        _this3.videoEl.removeEventListener(event.name, _loaded);
        cb();
      });
    }
  };

  /**
   * Remove all event listeners, references to DOM elements, and generated elements.
   */


  Video.prototype.dispose = function dispose() {
    this.videoEl.removeEventListener('click', this._onClick);
    this.videoEl.removeEventListener('pause', this._onPause);
    this.videoEl.removeEventListener('playing', this._onPlay);
    this.videoEl.removeEventListener('timeupdate', this._onTimeUpdate);
    this.videoEl.removeEventListener('progress', this._onProgress);
    this.videoEl.removeEventListener('seeking', this._onSeeking);
    this.videoEl.removeEventListener('seeked', this._onSeeked);
    this.videoEl.removeEventListener('loadedmetadata', this._onMetadataLoaded);

    this.getElementByClass(Video.Classes.PLAY_TOGGLE).removeEventListener('click', this._onClick);
    this.getElementByClass(Video.Classes.VOLUME).removeEventListener('click', this._onVolumeToggle);
    this.getElementByClass(Video.Classes.PROGRESS_HOLDER).removeEventListener('click', this._onProgressClick);
    this.getElementByClass(Video.Classes.FULLSCREEN).removeEventListener('click', this._onFullscreenToggle);

    var fullscreenChange = this._onFullscreenChange;
    if (Video.screenfull.enabled) {
      document.removeEventListener(Video.screenfull.raw.fullscreenchange, fullscreenChange);
      document.removeEventListener(Video.screenfull.raw.fullscreenerror, fullscreenChange);
    } else if (this.videoEl.webkitSupportsFullscreen) {
      this.videoEl.removeEventListener('webkitbeginfullscreen', fullscreenChange);
      this.videoEl.removeEventListener('webkitendfullscreen', fullscreenChange);
    }

    this.element.removeChild(this.getElementByClass(Video.Classes.CONTROLS));

    this.currentTimeEl = null;
    this.progressEl = null;
    this.bufferEl = null;
    this.element = null;
    this.videoEl = null;
  };

  /**
   * Get the media type and extension for the currently supported video types.
   * @return {{extension: string, type: string}}
   */


  Video.getVideoType = function getVideoType() {
    // Webm is best.
    if (Video.support.webm) {
      return {
        extension: 'webm',
        type: 'video/webm'
      };
    }

    return {
      extension: 'mp4',
      type: 'video/mp4'
    };
  };

  return Video;
}();

/* Merge in settings */


Object.assign(Video, settings);

/**
 * Determine support for videos. It is a boolean value with properties for
 * h264, webm, vp9, ogg, hls.
 * @type {Boolean}
 */
Video.support = supportTest();

/**
 * An async test for autoplay feature.
 * @type {Promise}
 */
Video.autoplay = test(Video.support);
Video._autoplayTest = test;

/** @type {Controls} */
Video.ControlsCreator = Controls;

/** @type {boolean} IE9 is the only supported browser without flexbox. */
/* istanbul ignore next */
Video.NO_FLEXBOX = document.all && document.addEventListener && !window.atob;

/** @type {boolean|Object} Expose for testing. */
Video.screenfull = screenfull;

return Video;

})));
//# sourceMappingURL=odo-video.js.map
