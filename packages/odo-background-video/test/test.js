/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const sinon = window.sinon;
const fixture = window.fixture;
const OdoBackgroundVideo = window.OdoBackgroundVideo;
const OdoObjectFit = window.OdoObjectFit;

const OdoVideo = window.OdoVideo;

fixture.setBase('fixtures');

const noop = () => {};

// Create a fake video element for browsers w/o video (phantomjs).
function getFakeVideoElement(videoEl) {
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

  return obj;
}

// Return the fake video element to OdoVideo for browsers w/o video.
if (!OdoVideo.support) {
  const old = OdoVideo.prototype._findVideoElement;
  OdoVideo.prototype._findVideoElement = function _findVideoElement(readyState) {
    const fake = getFakeVideoElement(old.call(this));
    if (readyState) {
      fake.readyState = readyState;
    }

    return fake;
  };
}


sinon.stub(OdoObjectFit, 'cover');

describe('The OdoBackgroundVideo Component', function bgVideo() {
  this.timeout(4000);

  let el;
  let instance;

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id) {
    fixture.load(`${id}.html`);
    el = fixture.el.firstElementChild;

    if (!OdoVideo.support) {
      const sources = el.getElementsByTagName('source');
      for (let i = 0; i < sources.length; i++) {
        sources[i].type = sources[i].getAttribute('type');
      }
    }

    instance = new OdoBackgroundVideo(el);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    el = null;
    instance = null;
    fixture.cleanup();
  }

  describe('basic fixture - no video element', () => {
    const { autoplay } = OdoVideo;

    beforeEach(() => {
      OdoVideo.autoplay = {
        then() {},
      };

      createFixture('no-video');
    });

    afterEach(() => {
      OdoVideo.autoplay = autoplay;
      removeFixture();
    });

    it('will initialize and show fallback image', () => {
      const loaded = document.createEvent('Event');
      loaded.initEvent('load', true, true);
      const readySpy = sinon.spy(instance, '_ready');

      // if, on page load, there's not enough metadata to play
      instance._odoImageElement.querySelector('img').dispatchEvent(loaded);
      expect(readySpy).to.not.equal(null);
    });

    it('can get the inner media element', () => {
      const img = instance._odoImageElement.querySelector('img');
      expect(instance.mediaElement).to.equal(img);
    });
  });

  describe('basic fixture - no autoplay', () => {
    const { autoplay } = OdoVideo;

    beforeEach(() => {
      OdoVideo.autoplay = Promise.resolve(false);
      createFixture('base');
    });

    afterEach(() => {
      OdoVideo.autoplay = autoplay;
    });

    it('will use the fallback experience', (done) => {
      const stub = sinon.stub(instance, '_cannotAutoplay');
      // Timeout for promise to execute.
      setTimeout(() => {
        expect(stub.callCount).to.equal(1);
        done();
      }, 0);
    });
  });

  describe('basic fixture - with video element', () => {
    beforeEach((done) => {
      createFixture('base');
      setTimeout(done, 0);
    });

    afterEach(() => {
      removeFixture();
    });

    // Assert OdoObjectFit is called
    it('will initialize', () => {
      expect(instance.videoElement).to.not.equal(null);
      expect(instance.videoElement.classList.contains('hidden')).to.be.false;
      expect(OdoObjectFit.cover.calledWith(instance.mediaElement)).to.be.true;
    });

    it('will return a promise on loadedmetadata or error', () => {
      const readySpy = sinon.spy(instance, '_ready');
      const loadedmetadata = document.createEvent('Event');
      loadedmetadata.initEvent('loadedmetadata', true, true);

      instance._video.videoEl.dispatchEvent(loadedmetadata);
      expect(readySpy.called).to.be.true;
    });

    it('will play the background video', () => {
      const playSpy = sinon.spy(instance._video.videoEl, 'play');
      instance._play();
      expect(playSpy.called).to.be.true;
    });

    it('will pause the background video', () => {
      const pauseSpy = sinon.spy(instance._video.videoEl, 'pause');
      instance._pause();
      expect(pauseSpy.called).to.be.true;
    });

    it('will restart the background video', () => {
      instance._video.isPlaying = false;
      instance._showFirstFrame();
      expect(instance._video.getVideoElement().currentTime).to.equal(0);
    });

    it('will not set the current frame if the video is already playing', () => {
      instance._video.isPlaying = true;
      const stub = sinon.stub(instance._video, 'getVideoElement');
      instance._showFirstFrame();
      expect(stub.callCount).to.equal(0);
    });

    it('will resize the background video', () => {
      const video = instance._video.getVideoElement();
      instance._handleResize();
      expect(OdoObjectFit.cover.calledWith(video)).to.be.true;
    });

    it('getter videoElement will return video element', () => {
      const element = instance.videoElement;
      expect(element).to.equal(instance._odoVideoElement);
    });

    it('getter imageElement will return image element', () => {
      const element = instance.imageElement;
      expect(element).to.equal(instance._odoImageElement);
    });
  });
});
