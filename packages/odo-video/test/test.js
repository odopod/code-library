/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const sinon = window.sinon;
const fixture = window.fixture;

const OdoVideo = window.OdoVideo;

fixture.setBase('fixtures');

function noop() {}

let readyState = null;
let webkitSupport = null;
let element;
let instance;

// Clone the fixture and append it to the body. Then create a new instance.
function createFixture(id, options, theReadyState, webkit) {
  fixture.load(`${id}.html`);
  element = fixture.el.firstElementChild;

  if (!OdoVideo.support) {
    const sources = element.getElementsByTagName('source');
    for (let i = 0; i < sources.length; i++) {
      sources[i].type = sources[i].getAttribute('type');
    }
  }

  readyState = theReadyState;
  webkitSupport = webkit;

  instance = new OdoVideo(element, options);

  readyState = null;
  webkitSupport = null;
}

function removeFixture() {
  if (instance.getElement()) {
    instance.dispose();
  }

  element = null;
  instance = null;
  fixture.cleanup();
}

// Return fake video element to OdoVideo.
const old = OdoVideo.prototype._findVideoElement;
OdoVideo.prototype._findVideoElement = function _findVideoElement() {
  const videoEl = old.call(this);
  const obj = {
    readyState: 0,
    currentTime: 20,
    duration: 100,
    volume: 1,
    muted: false,
    play: noop,
    pause: noop,
    load: noop,
    paused: true,
    ended: false,
    buffered: {
      end() {
        return 80;
      },
      length: 1,
    },
    addEventListener: videoEl.addEventListener.bind(videoEl),
    removeEventListener: videoEl.removeEventListener.bind(videoEl),
    getElementsByTagName: videoEl.getElementsByTagName.bind(videoEl),
    dispatchEvent: videoEl.dispatchEvent.bind(videoEl),
  };

  // Add fake support for iOS properties.
  if (webkitSupport) {
    obj.webkitSupportsFullscreen = true;
    obj.webkitEnterFullscreen = sinon.spy();
  }

  if (readyState) {
    obj.readyState = readyState;
  }

  return obj;
};

describe('The OdoVideo Component', () => {
  describe('video support', () => {
    const support = OdoVideo.support;

    afterEach(() => {
      OdoVideo.support = support;
    });

    it('can get the correct video type based on support', () => {
      OdoVideo.support = {
        webm: 'probably',
        ogg: 'probably',
        h264: 'probably',
        vp9: 'probably',
      };

      expect(OdoVideo.getVideoType()).to.deep.equal({
        extension: 'webm',
        type: 'video/webm',
      });

      OdoVideo.support.webm = '';

      expect(OdoVideo.getVideoType()).to.deep.equal({
        extension: 'mp4',
        type: 'video/mp4',
      });
    });
  });

  describe('default controls', () => {
    beforeEach(() => {
      createFixture('base');
    });

    afterEach(removeFixture);

    it('will instantiate correctly', () => {
      const sources = instance.getSourceElements();
      expect(sources).to.have.length(2);

      // Give unique IDs to source elements.
      Array.from(sources).forEach((source) => {
        expect(source.id).to.exist;
      });
    });

    it('can determine if the video is playing', () => {
      const videoEl = instance.getVideoElement();
      instance.videoEl = {
        ended: true,
        paused: false,
      };

      expect(instance._isPlaying()).to.be.false;

      instance.videoEl = {
        ended: false,
        paused: false,
      };
      expect(instance._isPlaying()).to.be.true;

      instance.videoEl = {
        ended: false,
        paused: true,
      };
      expect(instance._isPlaying()).to.be.false;

      instance.videoEl = videoEl;
    });

    it('can toggle playback', () => {
      expect(instance.isPlaying).to.be.false;
      expect(instance.getElement().classList.contains(OdoVideo.Classes.IS_PLAYING)).to.be.false;

      instance.togglePlayback();
      instance._handlePlaying();
      expect(instance.isPlaying).to.be.true;
      expect(instance.getElement().classList.contains(OdoVideo.Classes.IS_PLAYING)).to.be.true;

      instance.togglePlayback();
      instance._handlePaused(); // Trigger event handler manually
      expect(instance.isPlaying).to.be.false;
      expect(instance.getElement().classList.contains(OdoVideo.Classes.IS_PLAYING)).to.be.false;
    });

    it('will toggle playback on click', () => {
      const stub = sinon.stub(instance, 'play');
      instance._handleClick();
      expect(stub.callCount).to.equal(1);
      stub.restore();
    });

    it('can toggle volume', () => {
      expect(instance.isMuted()).to.be.false;
      expect(instance.getElement().classList.contains(OdoVideo.Classes.IS_MUTED)).to.be.false;

      instance.toggleVolume();
      expect(instance.isMuted()).to.be.true;
      expect(instance.getElement().classList.contains(OdoVideo.Classes.IS_MUTED)).to.be.true;

      instance.toggleVolume();
      expect(instance.isMuted()).to.be.false;
      expect(instance.getElement().classList.contains(OdoVideo.Classes.IS_MUTED)).to.be.false;
    });

    it('will have buffering class when seeking', () => {
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_BUFFERING)).to.be.false;

      const videoEl = instance.getVideoElement();
      instance.videoEl = {
        buffered: {
          end() {
            return 11;
          },
        },
        currentTime: 10,
      };

      // When this part of the video has already been buffered, it will not add
      // the buffering class.
      instance._handleSeeking();
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_BUFFERING)).to.be.false;

      instance.videoEl.buffered = [];
      instance._handleSeeking();
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_BUFFERING)).to.be.true;

      instance._handleSeeked();
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_BUFFERING)).to.be.false;

      instance.videoEl = videoEl;
    });

    it('will update controls while buffering', () => {
      const spy = sinon.spy(instance, '_setCurrentTimeDisplay');
      const spy2 = sinon.spy(instance, '_setProgressDisplay');
      instance._handleTimeUpdate();
      expect(spy.callCount).to.equal(1);
      instance._handleProgress();
      expect(spy2.callCount).to.equal(1);
    });

    it('can set progress display with a value', () => {
      instance._setProgressDisplay(0.5);
      expect(instance.progressEl.style.width).to.equal('50%');
    });

    it('can get pretty time', () => {
      expect(OdoVideo.getPrettyTime(2.3)).to.equal('0:02.3');
      expect(OdoVideo.getPrettyTime(12)).to.equal('0:12');
      expect(OdoVideo.getPrettyTime(92)).to.equal('1:32');
      expect(OdoVideo.getPrettyTime(60 * 60 + 5)).to.equal('1:00:05');
      expect(OdoVideo.getPrettyTime(60 * 60 + 60 * 10 + 32)).to.equal('1:10:32');
    });

    it('will update the video\'s current time on progress click', (done) => {
      function doIt() {
        const offset = sinon.stub(OdoVideo, '_getClickOffset').returns({
          x: 10,
        });
        const setter = sinon.spy(instance, 'setCurrentTime');

        const progressHolder = instance.getElementByClass(OdoVideo.Classes.PROGRESS_HOLDER);
        const progressWidth = progressHolder.offsetWidth;
        const time = 10 / progressWidth * instance.videoEl.duration;

        instance._handleProgressClick({
          target: progressHolder,
          currentTarget: progressHolder,
        });

        expect(setter.calledWith(time)).to.be.true;

        offset.restore();

        done();
      }

      function supportsIt() {
        instance.videoEl.removeEventListener('loadedmetadata', supportsIt);
        doIt();
      }

      if (OdoVideo.support) {
        instance.videoEl.addEventListener('loadedmetadata', supportsIt);
      } else {
        doIt();
      }
    });

    it('can get the cross browser keycode from a keyboard event', () => {
      expect(OdoVideo._getWhichKey({
        which: 32,
        charCode: 32,
        keyCode: 32,
      })).to.equal(32);

      expect(OdoVideo._getWhichKey({
        which: null,
        charCode: 32,
        keyCode: 32,
      })).to.equal(32);

      expect(OdoVideo._getWhichKey({
        which: null,
        charCode: null,
        keyCode: 32,
      })).to.equal(32);

      expect(OdoVideo._getWhichKey({
        which: null,
        charCode: 32,
        keyCode: null,
      })).to.equal(32);
    });

    it('will toggle playback when spacebar is pressed', () => {
      const spy = sinon.spy();
      const returnFromIdle = sinon.stub(instance, '_returnFromIdle');
      const togglePlayback = sinon.stub(instance, 'togglePlayback');
      const getWhichKey = sinon.stub(OdoVideo, '_getWhichKey').returns(13);

      instance._handleKeyboardPlaybackToggle({
        preventDefault: spy,
      });

      expect(returnFromIdle.callCount).to.equal(1);
      expect(togglePlayback.callCount).to.equal(0);
      expect(spy.callCount).to.equal(0);

      getWhichKey.returns(32);

      instance._handleKeyboardPlaybackToggle({
        preventDefault: spy,
      });

      expect(returnFromIdle.callCount).to.equal(2);
      expect(togglePlayback.callCount).to.equal(1);
      expect(spy.callCount).to.equal(1);

      returnFromIdle.restore();
      togglePlayback.restore();
      getWhichKey.restore();
    });

    it('can update the video source', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const videoType = OdoVideo.getVideoType();
      const getSources = sinon.stub(instance, 'getSourceElements').returns([
        {
          id: instance.id + 'webm',
          setAttribute: spy1,
        },
        {
          id: instance.id + 'mp4',
          setAttribute: spy2,
        },
      ]);
      const loader = sinon.stub(instance.videoEl, 'load');

      instance.updateSource('foo');
      const src = 'foo.' + videoType.extension;

      expect(loader.callCount).to.equal(1);
      expect(getSources.callCount).to.equal(1);
      if (videoType.extension === 'webm') {
        expect(spy1.calledWith('src', src)).to.be.true;
      } else {
        expect(spy2.calledWith('src', src)).to.be.true;
      }

      getSources.restore();
    });

    it('can set the buffer display when content has buffered', () => {
      instance._setBufferDisplay();
      expect(instance.bufferEl.style.width).to.equal('80%');
    });

    it('can set the buffer display when no content has buffered', () => {
      const videoEl = instance.videoEl;

      instance.videoEl = {
        buffered: {
          length: 0,
        },
      };

      instance._setBufferDisplay();

      expect(instance.bufferEl.style.width).to.equal('0%');

      instance.videoEl = videoEl;
    });

    it('can get click offset', () => {
      expect(OdoVideo._getClickOffset({
        offsetX: 10,
        offsetY: 5,
      })).to.deep.equal({
        x: 10,
        y: 5,
      });

      expect(OdoVideo._getClickOffset({
        clientX: 100,
        clientY: 5,
        currentTarget: {
          getBoundingClientRect() {
            return {
              top: 15,
              left: 20,
              bottom: 25,
              right: 30,
            };
          },
        },
      })).to.deep.equal({
        x: 100 - 20,
        y: 5 - 15,
      });
    });

    it('can attach events to video load events', () => {
      const callback = sinon.spy();

      // readyState is less than 0, so we trigger an event
      const loaded = document.createEvent('Event');
      loaded.initEvent('loadedmetadata', true, true);
      instance.listenOnData(OdoVideo.VideoEvents.LOADED_METADATA, callback);
      instance.videoEl.dispatchEvent(loaded);
      expect(callback.callCount).to.equal(1);

      // readyState > 1
      instance.videoEl.readyState = 2;
      instance.listenOnData(OdoVideo.VideoEvents.LOADED_METADATA, callback);
      expect(callback.callCount).to.equal(2);
    });
  });

  describe('a video which is already loaded', () => {
    beforeEach(() => {
      createFixture('base', {
        pauseOnClick: false,
      }, 4);
    });

    afterEach(removeFixture);

    it('will not wait for metadata to load', () => {
      expect(instance.videoEl.readyState).to.equal(4);
    });
  });

  describe('no fullscreen support', () => {
    const screenfull = OdoVideo.screenfull;

    beforeEach(() => {
      OdoVideo.screenfull = false;
      createFixture('base');
    });

    afterEach(() => {
      removeFixture();
      OdoVideo.screenfull = screenfull;
    });

    it('will instantiate correctly', () => {
      expect(instance._noFullscreen).to.be.true;
    });

    it('can toggle fullscreen mode', () => {
      instance.toggleFullscreen();
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_FULLSCREEN)).to.be.true;
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_IDLE)).to.be.false;
      expect(instance.isFullscreen).to.be.true;

      instance._wentIdle();
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_IDLE)).to.be.true;

      instance.toggleFullscreen();
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_FULLSCREEN)).to.be.false;
      expect(instance.element.classList.contains(OdoVideo.Classes.IS_IDLE)).to.be.false;
      expect(instance.isFullscreen).to.be.false;
    });
  });

  describe('native fullscreen support', () => {
    const screenfull = OdoVideo.screenfull;

    beforeEach(() => {
      OdoVideo.screenfull = {
        raw: {
          requestFullscreen: 'webkitRequestFullscreen',
          exitFullscreen: 'webkitExitFullscreen',
          fullscreenElement: 'webkitFullscreenElement',
          fullscreenEnabled: 'webkitFullscreenEnabled',
          fullscreenchange: 'webkitfullscreenchange',
          fullscreenerror: 'webkitfullscreenerror',
        },
        element: null,
        enabled: true,
        isFullscreen: noop,
        request: noop,
        exit: noop,
        toggle: noop,
      };
      createFixture('base');
    });

    afterEach(() => {
      removeFixture();
      OdoVideo.screenfull = screenfull;
    });

    it('will instantiate correctly', () => {
      expect(OdoVideo.screenfull.enabled).to.be.true;
      expect(instance._noFullscreen).to.be.false;
    });

    it('can go fullscreen', () => {
      const stub = sinon.stub(OdoVideo.screenfull, 'toggle');
      instance.toggleFullscreen();
      expect(stub.callCount).to.equal(1);
      expect(stub.calledWith(instance.element)).to.be.true;
      stub.restore();
    });
  });

  describe('iOS fullscreen support', () => {
    const screenfull = OdoVideo.screenfull;

    beforeEach(() => {
      OdoVideo.screenfull = false;
      createFixture('base', {}, null, true);
    });

    afterEach(() => {
      removeFixture();
      OdoVideo.screenfull = screenfull;
    });

    it('will instantiate correctly', () => {
      expect(instance.videoEl.webkitSupportsFullscreen).to.be.true;
      expect(instance._noFullscreen).to.be.false;
    });

    it('can go fullscreen', () => {
      const fullscreenState = sinon.spy(instance, '_toggleFullscreenState');
      instance.toggleFullscreen();
      expect(instance.videoEl.webkitEnterFullscreen.callCount).to.equal(1);
      expect(fullscreenState.callCount).to.equal(0);
    });
  });

  describe('stacked progress controls', () => {
    beforeEach(() => {
      createFixture('base', {
        controls: OdoVideo.Controls.STACKED_PROGRESS,
      });
    });

    afterEach(removeFixture);

    it('will have the stacked class', () => {
      const controls = instance.getElementByClass(OdoVideo.Classes.CONTROLS);
      expect(controls.classList.contains(OdoVideo.Classes.CONTROLS_STACKED));
    });
  });

  describe('no controls', () => {
    beforeEach(() => {
      createFixture('base', {
        controls: OdoVideo.Controls.NONE,
      });
    });

    afterEach(removeFixture);

    it('will be hidden but still there', () => {
      const controls = instance.getElementByClass(OdoVideo.Classes.CONTROLS);
      expect(window.getComputedStyle(controls, null).display).to.equal('none');
      expect(controls).to.exist;
    });
  });

  describe('custom controls', () => {
    beforeEach(() => {
      createFixture('base', {
        controls: OdoVideo.Controls.CUSTOM,
        layoutControls(elements) {
          elements.controls.appendChild(elements.currentTime);
          elements.controls.appendChild(elements.progressContainer);
          elements.controls.appendChild(elements.fullScreenToggle);
          elements.controls.appendChild(elements.volumeToggle);
          elements.controls.appendChild(elements.playToggle);
        },

        updateControls: noop,
      });
    });

    afterEach(removeFixture);

    it('will have the customized layout', () => {
      const controls = instance.getElementByClass(OdoVideo.Classes.CONTROLS);
      const currentTime = instance.getElementByClass(OdoVideo.Classes.CURRENT_TIME);
      const playToggle = instance.getElementByClass(OdoVideo.Classes.PLAY_TOGGLE);
      expect(controls.firstElementChild).to.equal(currentTime);
      expect(controls.lastElementChild).to.equal(playToggle);
    });

    it('will get a callback to update custom controls', () => {
      const spy = sinon.spy(instance.options, 'updateControls');
      instance._updateControls();
      expect(spy.callCount).to.equal(1);
    });
  });

  describe('no local storage', () => {
    const has = OdoVideo._autoplayTest.HAS_LOCAL_STORAGE;

    beforeEach(() => {
      OdoVideo._autoplayTest.HAS_LOCAL_STORAGE = false;
    });

    afterEach(() => {
      OdoVideo._autoplayTest.HAS_LOCAL_STORAGE = has;
      localStorage.removeItem('odovideoautoplay');
      localStorage.removeItem('odovideoautoplaytries');
    });

    it('will not try to set localStorage', () => {
      localStorage.removeItem('odovideoautoplay');
      localStorage.removeItem('odovideoautoplaytries');
      return OdoVideo._autoplayTest(false).then(() => {
        expect(localStorage.getItem('odovideoautoplay')).to.equal(null);
        expect(localStorage.getItem('odovideoautoplaytries')).to.equal(null);
      });
    });
  });

  describe('autoplay storing results', () => {
    afterEach(() => {
      localStorage.removeItem('odovideoautoplay');
      localStorage.removeItem('odovideoautoplaytries');
    });

    it('will check localStorage to see if autoplay is already tested', () => {
      const spy = sinon.spy(window.localStorage, 'getItem');
      localStorage.setItem('odovideoautoplay', true);

      return OdoVideo._autoplayTest(false).then((can) => {
        expect(can).to.equal(true);
        expect(spy.calledWith('odovideoautoplay')).to.be.true;
        window.localStorage.getItem.restore();
      });
    });

    it('will try up to 3 times for a result', () => {
      const spy = sinon.spy(window.localStorage, 'getItem');
      localStorage.setItem('odovideoautoplay', false);
      localStorage.setItem('odovideoautoplaytries', 3);

      return OdoVideo._autoplayTest(false).then((can) => {
        expect(can).to.equal(false);
        expect(spy.callCount).to.equal(2);
        window.localStorage.getItem.restore();
      });
    });
  });
});
