/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const sinon = window.sinon;

const OdoObjectFit = window.OdoObjectFit;

describe('The OdoObjectFit Component', () => {
  let parent;
  let element;
  let instance;
  const supported = OdoObjectFit.SUPPORTED;

  beforeEach(() => {
    parent = document.createElement('div');
    parent.style.width = '800px';
    parent.style.height = '600px';
    element = document.createElement('img');
    element.src = 'https://placehold.it/10x10';
    parent.appendChild(element);
    OdoObjectFit.SUPPORTED = false;
    document.body.appendChild(parent);
  });

  afterEach(() => {
    OdoObjectFit.SUPPORTED = supported;
    document.body.removeChild(parent);
  });

  describe('static methods', () => {
    it('will fail silently if given no elements to fit', () => {
      expect(() => {
        OdoObjectFit.cover();
      }).to.not.throw(Error);

      expect(() => {
        OdoObjectFit.cover(null);
      }).to.not.throw(Error);

      expect(() => {
        OdoObjectFit.contain([]);
      }).to.not.throw(Error);
    });

    it('will not return an instance using the static methods', () => {
      expect(OdoObjectFit.cover(element)).to.be.undefined;
      expect(OdoObjectFit.cover([element])).to.be.undefined;
    });
  });

  describe('instance', () => {
    it('will get the correct media ratio for images and videos', () => {
      instance = new OdoObjectFit(element, OdoObjectFit.Style.COVER);

      instance.element = {
        naturalWidth: 800,
        naturalHeight: 400,
      };
      expect(instance._getMediaRatio()).to.equal(2);

      instance._isVideo = true;
      instance.element = {
        videoWidth: 4,
        videoHeight: 3,
      };
      expect(instance._getMediaRatio()).to.equal(4 / 3);

      instance.element = element;
    });

    it('knows when a media element is already loaded', () => {
      const listenStub = sinon.stub(OdoObjectFit.prototype, '_listenForMediaLoad');

      // Create instance.
      instance = new OdoObjectFit(element, OdoObjectFit.Style.COVER);

      expect(instance._isMediaLoaded({
        naturalWidth: 0,
        complete: false,
        readyState: 0,
        src: '',
      })).to.equal(false);

      // ready state
      expect(instance._isMediaLoaded({
        naturalWidth: 0,
        complete: false,
        readyState: 1,
        src: '',
      })).to.equal(true);

      // natural width
      expect(instance._isMediaLoaded({
        naturalWidth: 50,
        complete: false,
        readyState: 0,
        src: '',
      })).to.equal(true);

      // complete and has source
      expect(instance._isMediaLoaded({
        naturalWidth: 0,
        complete: true,
        readyState: 0,
        src: 'https://www.google.com/logo.jpg',
      })).to.equal(true);

      listenStub.restore();
    });

    it('will not wait for the metadata to load if it has already loaded', () => {
      // Stub it so it does nothing when called from the constructor.
      const listenStub = sinon.stub(OdoObjectFit.prototype, '_listenForMediaLoad');
      const loadedStub = sinon.stub(OdoObjectFit.prototype, '_handleMediaLoaded');
      const isLoaded = sinon.stub(OdoObjectFit.prototype, '_isMediaLoaded').returns(false);
      const addListener = sinon.spy();

      // Create instance.
      instance = new OdoObjectFit(element, OdoObjectFit.Style.COVER);

      // Restore method.
      listenStub.restore();

      // Override element properties.
      instance.element = {
        addEventListener: addListener,
      };

      instance._isVideo = true;

      instance._listenForMediaLoad();
      expect(addListener.callCount).to.equal(1);
      expect(loadedStub.callCount).to.equal(0);

      isLoaded.returns(true);
      instance._listenForMediaLoad();
      expect(addListener.callCount).to.equal(1);
      expect(loadedStub.callCount).to.equal(1);

      instance._listenForMediaLoad();
      expect(addListener.callCount).to.equal(1);
      expect(loadedStub.callCount).to.equal(2);

      loadedStub.restore();
      isLoaded.restore();
    });

    it('can set the correct dimensions to cover its parent', () => {
      // Waits for load event on proxied image.
      instance = new OdoObjectFit(element, OdoObjectFit.Style.COVER);

      // The placeholder is a 10x10 image.
      sinon.stub(instance, '_getMediaRatio').returns(1);

      // Pretend it loaded.
      instance._handleMediaLoaded();

      expect(element.style.width).to.equal('800px');
      expect(element.style.height).to.equal('800px');
      expect(element.style.marginLeft).to.equal('0px');
      expect(element.style.marginTop).to.equal('-100px');
    });

    it('can set the correct dimensions to be contained within its parent', () => {
      // Waits for load event on proxied image.
      instance = new OdoObjectFit(element, OdoObjectFit.Style.CONTAIN);

      // The placeholder is a 10x10 image.
      sinon.stub(instance, '_getMediaRatio').returns(1);

      // Pretend it loaded.
      instance._handleMediaLoaded();

      expect(element.style.width).to.equal('600px');
      expect(element.style.height).to.equal('600px');
      expect(element.style.marginLeft).to.equal('100px');
      expect(element.style.marginTop).to.equal('0px');
    });

    it('will get the fit size', () => {
      instance = new OdoObjectFit(element, OdoObjectFit.Style.COVER);

      instance.style = OdoObjectFit.Style.COVER;
      instance._mediaRatio = 0.75;
      expect(instance._getFitSize(1000, 500)).to.deep.equal({
        width: 1000,
        height: 1333,
      });
      expect(instance._getFitSize(1000, 1000)).to.deep.equal({
        width: 1000,
        height: 1333,
      });
      expect(instance._getFitSize(500, 1000)).to.deep.equal({
        width: 750,
        height: 1000,
      });

      instance.style = OdoObjectFit.Style.CONTAIN;
      instance._mediaRatio = 1.5;
      expect(instance._getFitSize(1000, 500)).to.deep.equal({
        width: 750,
        height: 500,
      });
      expect(instance._getFitSize(1000, 1000)).to.deep.equal({
        width: 1000,
        height: 667,
      });
      expect(instance._getFitSize(500, 1000)).to.deep.equal({
        width: 500,
        height: 333,
      });

      // Pretend it loaded.
      instance._handleMediaLoaded();
    });
  });
});
