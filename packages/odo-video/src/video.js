import screenfull from 'screenfull';
import settings from './settings';
import supportTest from './support-test';
import autoplayTest from './autoplay-test';
import Controls from './controls';

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
class Video {
  constructor(element, options) {
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
  _bindListeners() {
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
  }

  /**
   * Add event listeners to the video and UI elements.
   * @protected
   */
  bindEvents() {
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

    this.getElementByClass(Video.Classes.PLAY_TOGGLE)
      .addEventListener('click', this._onClick);
    this.getElementByClass(Video.Classes.VOLUME)
      .addEventListener('click', this._onVolumeToggle);
    this.getElementByClass(Video.Classes.PROGRESS_HOLDER)
      .addEventListener('click', this._onProgressClick);
    this.getElementByClass(Video.Classes.FULLSCREEN)
      .addEventListener('click', this._onFullscreenToggle);

    if (Video.screenfull.enabled) {
      document.addEventListener(
        Video.screenfull.raw.fullscreenchange,
        this._onFullscreenChange,
      );
      document.addEventListener(
        Video.screenfull.raw.fullscreenerror,
        this._onFullscreenChange,
      );

      // iOS handles full screen differently.
    } else if (this.videoEl.webkitSupportsFullscreen) {
      this.videoEl.addEventListener('webkitbeginfullscreen', this._onFullscreenChange);
      this.videoEl.addEventListener('webkitendfullscreen', this._onFullscreenChange);
    } else {
      this._noFullscreen = true;
    }
  }

  /**
   * Checks the network state of the video element. Returns true if the metadata
   * for the video is present.
   * @return {boolean}
   * @private
   */
  _isMetadataLoaded() {
    return this.videoEl.readyState > 0;
  }

  /**
   * Add the `loadedmetadata` event listener if the video has not loaded yet, or
   * call the event handler directly if it has.
   * @private
   */
  _waitForMetadata() {
    if (this._isMetadataLoaded()) {
      this._handleMetadataLoaded();
    } else {
      this.videoEl.addEventListener('loadedmetadata', this._onMetadataLoaded);
    }
  }

  /**
   * Save references to UI elements which needs to be constantly updated.
   * @protected
   */
  _saveElements() {
    this.currentTimeEl = this.getElementByClass(Video.Classes.CURRENT_TIME);
    this.progressEl = this.getElementByClass(Video.Classes.PROGRESS);
    this.bufferEl = this.getElementByClass(Video.Classes.BUFFER);
  }

  /**
   * Separated into its own function so sinon can stub it in the tests.
   * @return {HTMLVideoElement}
   * @private
   */
  _findVideoElement() {
    return this.element.getElementsByTagName('video')[0];
  }

  /**
   * Whether the video is currently playing.
   * @return {boolean}
   */
  _isPlaying() {
    if (this.videoEl.ended || this.videoEl.paused) {
      return false;
    }
    return true;
  }

  /**
   * For each <source> element, set a unique id on it.
   * @private
   */
  _setSourceIds() {
    this.getSourceElements().forEach((source) => {
      source.id = this.id + source.type.split('/')[1];
    });
  }

  /**
   * Retrieve all <source> elements within the video.
   * @return {Array.<HTMLSourceElement>}
   */
  getSourceElements() {
    return Array.from(this.videoEl.getElementsByTagName('source'));
  }

  /**
   * Return the main element this component was instantiated with.
   * @return {Element}
   */
  getElement() {
    return this.element;
  }

  /**
   * Returns the <video> element associated with this component.
   * @return {HTMLVideoElement}
   */
  getVideoElement() {
    return this.videoEl;
  }

  /**
   * Retrieve an element from within the main element by a class name.
   * @param {string} className Class name to search for.
   * @return {?Element} The element or null if it isn't found.
   */
  getElementByClass(className) {
    return this.element.getElementsByClassName(className)[0];
  }

  /**
   * Play the current video.
   * https://googlechrome.github.io/samples/play-return-promise/
   * @return {?Promise<void>} Chrome 50+, Firefox 53+, and Safari 10+ return a
   *     promise which is rejected if the device cannot autoplay.
   */
  play() {
    return this.videoEl.play();
  }

  /**
   * Pause the currently playing video.
   */
  pause() {
    this.videoEl.pause();
  }

  /**
   * If playing, pause. If paused, play.
   */
  togglePlayback() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Get the current time, in seconds.
   * @return {number}
   */
  getCurrentTime() {
    return this.videoEl.currentTime;
  }

  /**
   * Go to a specified time in the video.
   * @param {number} time Time in seconds.
   */
  setCurrentTime(time) {
    this.videoEl.currentTime = time;
  }

  /**
   * Mute the video.
   */
  mute() {
    this.videoEl.volume = 0;
    this.element.classList.add(Video.Classes.IS_MUTED);
  }

  /**
   * Unmute the video.
   */
  unmute() {
    this.videoEl.volume = 1;
    this.element.classList.remove(Video.Classes.IS_MUTED);
  }

  /**
   * Whether the video is currently muted.
   * @return {boolean}
   */
  isMuted() {
    return this.videoEl.volume === 0;
  }

  /**
   * Mute the video if it's playing audio or unmute it if it's already muted.
   */
  toggleVolume() {
    if (this.isMuted()) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Update the current video source. This method changes the appropriate <source>
   * `src` property.
   *
   * IE9 does not work when the <video>s `src` property or attribute is updated.
   *
   * @param {string} src Absolute or relative path to the video, without the extension.
   *     e.g. "/videos/cool-feature".
   */
  updateSource(src) {
    const { extension } = Video.getVideoType();
    const sources = this.getSourceElements();

    // Find the <source> element by Id.
    const source = sources.filter(source => source.id === this.id + extension)[0];

    const videoSource = src + '.' + extension;

    // Update the source's src.
    source.setAttribute('src', videoSource);

    this.videoEl.load();

    // Reset progress bars.
    this._setProgressDisplay();
    this._setBufferDisplay();

    // When metadata loads, update the times.
    this._waitForMetadata();
  }

  /**
   * Show the video is currently buffering.
   * @protected
   */
  showBuffering() {
    this.element.classList.add(Video.Classes.IS_BUFFERING);
  }

  /**
   * Show the video is done buffering.
   * @protected
   */
  hideBuffering() {
    this.element.classList.remove(Video.Classes.IS_BUFFERING);
  }

  /**
   * Converts a time value to MMSS, so 91 seconds is "1:31".
   * @param {number} currentTime Time in seconds.
   * @return {string} Human readable time.
   */
  static getPrettyTime(currentTime) {
    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor((currentTime - (hours * 3600)) / 60);
    let seconds = currentTime - (hours * 3600) - (minutes * 60);

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    let time = minutes + ':' + seconds;
    if (hours > 0) {
      if (minutes < 10) {
        time = '0' + time;
      }

      time = hours + ':' + time;
    }

    return time;
  }

  /**
   * Generate the controls elemenet and append it to the main element.
   * @private
   */
  _createControls() {
    const controls = new Video.ControlsCreator();
    const mainElement = controls.create(this.options.controls, this.options.layoutControls);
    this.element.appendChild(mainElement);
  }

  /**
   * Update the controls state/display with the new current time.
   * @private
   */
  _updateControls() {
    const seconds = this.getCurrentTime();
    this._setCurrentTimeDisplay(seconds);
    this._setProgressDisplay();

    // Give a hook to update custom controls.
    if (this.options.updateControls) {
      this.options.updateControls(seconds);
    }
  }

  /**
   * Sets the current time element's text to a pretty time given a float.
   * @param {number} seconds The current time of the video.
   */
  _setCurrentTimeDisplay(seconds) {
    this.currentTimeEl.textContent = Video.getPrettyTime(Math.round(seconds));
  }

  /**
   * Set the progress elements to a percentage.
   * @param {number} percentage Number between 0 and 1. If undefined, the percentage
   *     will be calculated from the video's current time and duration.
   * @private
   */
  _setProgressDisplay(percentage = this.videoEl.currentTime / this.videoEl.duration) {
    this.progressEl.style.width = percentage * 100 + '%';
  }

  /**
   * Determine the amount the video has buffered and set the buffer element's width
   * as that percentage.
   * @private
   */
  _setBufferDisplay() {
    // Progress events can be emitted before there is anything buffered.
    const percentage = this.videoEl.buffered.length > 0 ?
      this.videoEl.buffered.end(0) / this.videoEl.duration :
      0;

    this.bufferEl.style.width = percentage * 100 + '%';
  }

  /**
   * Clicked the fullscreen icon. Request or exit from fullscreen.
   */
  toggleFullscreen() {
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
  }

  /**
   * Event handler for both fullscreenchange and fullscreenerror. The state of
   * fullscreen has changed and styles need to be updated.
   * @private
   */
  _fullscreenChanged() {
    this.isFullscreen = !this.isFullscreen;
    this._toggleFullscreenState();
  }

  _toggleFullscreenState() {
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
  }

  /**
   * When the user stops interacting with the page, the cursor should disappear and
   * the controls should be hidden.
   * @private
   */
  _wentIdle() {
    this.element.classList.add(Video.Classes.IS_IDLE);
  }

  /**
   * When returning from the idle state, the cursor and controls should be shown.
   * Another timer is started to wait for idle state again.
   * @private
   */
  _returnFromIdle() {
    clearTimeout(this._idleTimeout);
    this._startIdleTimer();
    this.element.classList.remove(Video.Classes.IS_IDLE);
  }

  /**
   * Sets a timeout which will trigger the `wentIdle` method when it expires.
   * @private
   */
  _startIdleTimer() {
    this._idleTimeout = setTimeout(this._onIdleTimeout, Video.IDLE_TIMEOUT);
  }

  /**
   * Calculate the position of the click relative to the element the click listener
   * was bound to.
   * @param {MouseEvent} event Event object.
   * @return {{x: number, y: number}}
   * @private
   */
  static _getClickOffset(event) {
    if ('offsetX' in event) {
      return {
        x: event.offsetX,
        y: event.offsetY,
      };
    }

    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  /**
   * Event handler for the `loadedmetadata` event. Update UI with new data.
   * @private
   */
  _handleMetadataLoaded() {
    this.videoEl.removeEventListener('loadedmetadata', this._onMetadataLoaded);
    this._setCurrentTimeDisplay(this.videoEl.duration);
  }

  /**
   * Clicked on the main element. Toggle video playback.
   */
  _handleClick() {
    this.togglePlayback();
  }

  /**
   * Event handler for the `playing` event. Add the is-playing class.
   * @private
   */
  _handlePlaying() {
    this.isPlaying = true;
    this.element.classList.toggle(Video.Classes.IS_PLAYING, this.isPlaying);
  }

  /**
   * Event handler for the `paused` event. Remove the is-playing class.
   * @private
   */
  _handlePaused() {
    this.isPlaying = false;
    this.element.classList.toggle(Video.Classes.IS_PLAYING, this.isPlaying);
  }

  /**
   * Event handler for the `timeupdate` event. Update the UI.
   * @private
   */
  _handleTimeUpdate() {
    this._updateControls();
  }

  /**
   * Event handler for the `progress` event. Update the buffer display bar.
   * @private
   */
  _handleProgress() {
    this._setBufferDisplay();
  }

  /**
   * Clicked the progress bar track. Seek to the location of the click.
   * @param {MouseEvent} evt Event object.
   * @private
   */
  _handleProgressClick(evt) {
    const offset = Video._getClickOffset(evt);
    const width = evt.currentTarget.offsetWidth;
    const percent = offset.x / width;
    this._setProgressDisplay(percent);
    this.setCurrentTime(percent * this.videoEl.duration);
  }

  /**
   * Video started seeking. Show the user it's buffering.
   * @private
   */
  _handleSeeking() {
    // Avoid adding the buffering class when the video is looping - issue #1
    if (this.videoEl.buffered.length === 0 ||
        this.videoEl.buffered.end(0) < this.videoEl.currentTime) {
      this.showBuffering();
    }
  }

  /**
   * Video stopped seeking. Show the user it's ready to play.
   * @private
   */
  _handleSeeked() {
    this.hideBuffering();
  }

  /**
   * If the spacebar is pressed, toggle playback.
   * @param {KeyboardEvent} evt Event object.
   * @private
   */
  _handleKeyboardPlaybackToggle(evt) {
    // Trigger the controls to show again.
    this._returnFromIdle();

    // Spacebar.
    if (Video._getWhichKey(evt) === 32) {
      this.togglePlayback();
      evt.preventDefault();
    }
  }

  /**
   * Crossbrowser way to get the key which was pressed in a keyboard event.
   * @param {KeyboardEvent} event Event object.
   * @return {number}
   * @private
   */
  static _getWhichKey(event) {
    if (event.which) {
      return event.which;
    }
    return event.charCode || event.keyCode;
  }

  /**
   * Handler for triggering events on readyState or video data events
   * @param {Object} event Object containing event name and readyState.
   * @param {function():void} cb Callback function for event.
   * @public
   */
  listenOnData(event, cb) {
    let loaded;
    if (this.videoEl.readyState > event.readyState) {
      cb();
    } else {
      this.videoEl.addEventListener(event.name, loaded = () => {
        this.videoEl.removeEventListener(event.name, loaded);
        cb();
      });
    }
  }

  /**
   * Remove all event listeners, references to DOM elements, and generated elements.
   */
  dispose() {
    this.videoEl.removeEventListener('click', this._onClick);
    this.videoEl.removeEventListener('pause', this._onPause);
    this.videoEl.removeEventListener('playing', this._onPlay);
    this.videoEl.removeEventListener('timeupdate', this._onTimeUpdate);
    this.videoEl.removeEventListener('progress', this._onProgress);
    this.videoEl.removeEventListener('seeking', this._onSeeking);
    this.videoEl.removeEventListener('seeked', this._onSeeked);
    this.videoEl.removeEventListener('loadedmetadata', this._onMetadataLoaded);

    this.getElementByClass(Video.Classes.PLAY_TOGGLE)
      .removeEventListener('click', this._onClick);
    this.getElementByClass(Video.Classes.VOLUME)
      .removeEventListener('click', this._onVolumeToggle);
    this.getElementByClass(Video.Classes.PROGRESS_HOLDER)
      .removeEventListener('click', this._onProgressClick);
    this.getElementByClass(Video.Classes.FULLSCREEN)
      .removeEventListener('click', this._onFullscreenToggle);

    const fullscreenChange = this._onFullscreenChange;
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
  }

  /**
   * Get the media type and extension for the currently supported video types.
   * @return {{extension: string, type: string}}
   */
  static getVideoType() {
    // Webm is best.
    if (Video.support.webm) {
      return {
        extension: 'webm',
        type: 'video/webm',
      };
    }

    return {
      extension: 'mp4',
      type: 'video/mp4',
    };
  }
}

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
Video.autoplay = autoplayTest(Video.support);
Video._autoplayTest = autoplayTest;

/** @type {Controls} */
Video.ControlsCreator = Controls;

/** @type {boolean} IE9 is the only supported browser without flexbox. */
/* istanbul ignore next */
Video.NO_FLEXBOX = document.all && document.addEventListener && !window.atob;

/** @type {boolean|Object} Expose for testing. */
Video.screenfull = screenfull;

export default Video;
