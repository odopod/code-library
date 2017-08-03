/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const sinon = window.sinon;
const fixture = window.fixture;

const OdoShare = window.OdoShare;

function eventFire(el, etype) {
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    const evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

function encode(input) {
  return encodeURIComponent(input);
}

function implode(input, doEncode = false) {
  if (typeof input === 'string') {
    return doEncode ? encode(input) : input;
  }
  const joined = input.join(',');
  return doEncode ? encode(joined) : joined;
}

fixture.setBase('fixtures');

describe('The OdoShare Component', () => {
  let open;
  let navigate;
  beforeEach(() => {
    open = sinon.stub(OdoShare, '_open').returns('odo-share-fake-window');
    navigate = sinon.stub(OdoShare, '_navigate');
  });

  afterEach(() => {
    open.restore();
    navigate.restore();
  });

  it('will find 1 share button', () => {
    expect(OdoShare.shares).to.have.length(0);
    fixture.load('basic.html');
    OdoShare._registerShareButtons();
    expect(OdoShare.shares).to.have.length(1);
  });

  describe('Share buttons', () => {
    let element;

    beforeEach(() => {
      element = document.createElement('a');
      element.className = 'odo-share';
      element.setAttribute('data-service', 'twitter');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
      OdoShare.dispose(element);
    });

    it('should share when clicked', () => {
      const spy = sinon.spy();
      OdoShare.add({
        element,
        after(output, windowObject) {
          spy();
          expect(windowObject).to.equal('odo-share-fake-window');
        },
      });

      eventFire(element, 'click');
      expect(spy.callCount).to.equal(1);
    });

    it('should check the element for data attributes', () => {
      const spy = sinon.spy();
      element.setAttribute('data-via', 'Odopod');

      OdoShare.add({
        element,
        after(output, windowObject) {
          spy();
          expect(windowObject).to.equal('odo-share-fake-window');
          expect(output.url).to.contain('via=' + encode('Odopod'));
        },
      });

      eventFire(element, 'click');
      expect(spy.callCount).to.equal(1);
    });
  });

  describe('Static Methods', () => {
    describe('add', () => {
      let element;

      beforeEach(() => {
        element = document.createElement('a');
        element.className = 'odo-share';
        element.setAttribute('data-service', 'twitter');
        document.body.appendChild(element);
      });

      afterEach(() => {
        document.body.removeChild(element);
        OdoShare.dispose(element);
      });

      it('should not add to internal share cache if argument is empty', () => {
        const numBefore = OdoShare.shares.length;
        const numAdded = OdoShare.add().length;

        expect(OdoShare.shares).to.have.length(numBefore + numAdded);
      });

      it('should not add to internal share cache if element is not specified', () => {
        const numBefore = OdoShare.shares.length;
        const numAdded = OdoShare.add({}).length;

        expect(OdoShare.shares).to.have.length(numBefore + numAdded);
      });

      it('should add the element to the internal share cache (element)', () => {
        const numBefore = OdoShare.shares.length;
        const numAdded = OdoShare.add(element).length;

        expect(OdoShare.shares).to.have.length(numBefore + numAdded);
      });

      it('should add the element to the internal share cache (object)', () => {
        const numBefore = OdoShare.shares.length;
        const numAdded = OdoShare.add({
          element,
        }).length;

        expect(OdoShare.shares).to.have.length(numBefore + numAdded);
      });

      it('should add multiple elements to the internal share cache (object)', () => {
        const numBefore = OdoShare.shares.length;
        const numAdded = OdoShare.add([{
          element,
        }, {
          element,
        }]).length;

        expect(numAdded).to.equal(2);
        expect(OdoShare.shares).to.have.length(numBefore + numAdded);
      });

      it('should add multiple elements to the internal share cache (element)', () => {
        const numBefore = OdoShare.shares.length;
        const numAdded = OdoShare.add([element, element]).length;

        expect(numAdded).to.equal(2);
        expect(OdoShare.shares).to.have.length(numBefore + numAdded);
      });

      it('should add multiple elements to the internal share cache (mixed)', () => {
        const numBefore = OdoShare.shares.length;
        const numAdded = OdoShare.add([{
          element,
        }, element]).length;

        expect(numAdded).to.equal(2);
        expect(OdoShare.shares).to.have.length(numBefore + numAdded);
      });
    });

    describe('share', () => {
      it('should share the current page by default', (done) => {
        OdoShare.share({
          service: 'twitter',
          after(output) {
            expect(output.params.url).to.equal(encode(window.location.href));
            done();
          },
        });
      });

      it('should default to `default` param value if defined in the schema', (done) => {
        const defaultLang = OdoShare.services.twitter.params.lang.default;
        const langParse = OdoShare.services.twitter.params.lang.parse;

        OdoShare.share({
          service: 'twitter',
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.url).to.contain('lang=' + langParse(defaultLang));
            done();
          },
        });
      });

      it('should not use default params if they are defined in the input', (done) => {
        const defaultLang = OdoShare.services.twitter.params.lang.default;
        const langParse = OdoShare.services.twitter.params.lang.parse;

        const data = {
          language: 'fr',
        };

        OdoShare.share({
          service: 'twitter',
          data,
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.url).to.not.contain('lang=' + langParse(defaultLang));
            expect(output.url).to.contain('lang=' + langParse(data.language));
            done();
          },
        });
      });

      it('should fail if no service is defined', () => {
        const didShare = OdoShare.share({
          data: {
            url: 'http://odopod.com/',
          },
        });

        expect(didShare).to.be.false;
      });

      it('should allow the user to abort sharing', () => {
        OdoShare.share({
          service: 'twitter',
          data: { url: 'https://github.com' },
          before() { return false; },
          after() { expect(false).to.equal(true); },
        });
      });

      it('should allow the user to alter the input in the `before method`', () => {
        OdoShare.share({
          service: 'twitter',
          data: {
            url: 'http://odopod.com/',
          },

          before(/* output */) {
            return {
              data: {
                url: 'http://www.odopod.com/',
              },
            };
          },

          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.params.url).to.equal(encode('http://www.odopod.com/'));
          },
        });
      });

      it('should allow the user to alter the data asynchronously in the `before method`', (done) => {
        OdoShare.share({
          service: 'twitter',
          data: {
            url: 'http://odopod.com/',
          },
          before(/* output */) {
            return Promise.resolve({
              url: 'http://www.odopod.com/',
            });
          },

          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.params.url).to.equal(encode('http://www.odopod.com/'));
            done();
          },
        });
      });
    });
  });

  describe('Services', () => {
    describe('Facebook', () => {
      it('should share succesfully', () => {
        const didShare = OdoShare.share({
          service: 'facebook',
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
          },
        });

        expect(didShare).to.be.true;
      });
    });

    describe('Twitter', () => {
      it('should handle hashtags as an array', () => {
        const data = {
          hashtags: ['foo', 'bar'],
        };

        OdoShare.share({
          service: 'twitter',
          data,
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.params.hashtags).to.equal(implode(data.hashtags, true));
          },
        });
      });

      it('should handle hashtags as a string', () => {
        const data = {
          hashtags: 'foo',
        };

        OdoShare.share({
          service: 'twitter',
          data,
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.params.hashtags).to.equal(encode(data.hashtags));
          },
        });
      });

      it('should strip "#"\'s from hashtags (string)', () => {
        const data = {
          hashtags: '#foo',
        };

        OdoShare.share({
          service: 'twitter',
          data,
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.params.hashtags).to.equal(encode('foo'));
          },
        });
      });

      it('should strip "#"\'s from hashtags (array)', () => {
        const data = {
          hashtags: ['#foo', '#bar'],
        };

        OdoShare.share({
          service: 'twitter',
          data,
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.params.hashtags).to.equal(implode(['foo', 'bar'], true));
          },
        });
      });

      it('should handle "via" and "recommend" without "@"', () => {
        const viaParse = OdoShare.services.twitter.params.via.parse;
        const relatedParse = OdoShare.services.twitter.params.related.parse;

        const data = {
          via: 'Odopod',
          recommend: 'Odopod',
        };

        OdoShare.share({
          service: 'twitter',
          data,
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.queryString).to.contain('via=' + viaParse(data.via));
            expect(output.queryString).to.contain('related=' + relatedParse(data.recommend));
          },
        });
      });

      it('should handle "via" and "recommend" with "@"', () => {
        const viaParse = OdoShare.services.twitter.params.via.parse;
        const relatedParse = OdoShare.services.twitter.params.related.parse;

        const data = {
          via: '@Odopod',
          recommend: '@Odopod',
        };

        OdoShare.share({
          service: 'twitter',
          data,
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.queryString).to.contain('via=' + viaParse(data.via));
            expect(output.queryString).to.contain('related=' + relatedParse(data.recommend));
          },
        });
      });

      it('should handle "recommend" as array', () => {
        const relatedParse = OdoShare.services.twitter.params.related.parse;

        const data = {
          recommend: ['@Odopod', '@odopod'],
        };

        OdoShare.share({
          service: 'twitter',
          data,
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
            expect(output.queryString).to.contain('related=' + relatedParse(data.recommend));
          },
        });
      });
    });

    describe('Google Plus', () => {
      it('should share succesfully', () => {
        const didShare = OdoShare.share({
          service: 'googleplus',
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
          },
        });

        expect(didShare).to.be.true;
      });
    });

    describe('Tumblr', () => {
      it('should share succesfully', () => {
        const didShare = OdoShare.share({
          service: 'tumblr',
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
          },
        });

        expect(didShare).to.be.true;
      });
    });

    describe('LinkedIn', () => {
      it('should share succesfully', () => {
        const didShare = OdoShare.share({
          service: 'linkedin',
          after(output, windowObject) {
            expect(windowObject).to.equal('odo-share-fake-window');
          },
        });

        expect(didShare).to.be.true;
      });
    });

    describe('Email', () => {
      it('should share via email', () => {
        OdoShare.share({
          service: 'email',
          after(output, windowObject) {
            expect(output.url).to.contain('mailto:');
            expect(windowObject).to.equal(undefined);
          },
        });
      });

      it('should share to a single recipient', () => {
        OdoShare.share({
          service: 'email',
          data: { to: 'foo@odopod.com' },
          after(output) {
            expect(output.url).to.contain('mailto:' + encode('foo@odopod.com'));
          },
        });
      });

      it('should share to multiple recipients', () => {
        const recipients = ['foo@odopod.com', 'bar@odopod.com'];

        OdoShare.share({
          service: 'email',
          data: {
            to: recipients,
          },
          after(output) {
            expect(output.url).to.contain('mailto:' + implode(recipients, true));
          },
        });
      });

      it('should cc to a single recipient', () => {
        const address = 'foo@odopod.com';
        OdoShare.share({
          service: 'email',
          data: {
            cc: address,
          },
          after(output) {
            expect(output.url).to.contain('cc=' + encode(address));
          },
        });
      });

      it('should cc to multiple recipients', () => {
        const recipients = ['foo@odopod.com', 'bar@odopod.com'];
        OdoShare.share({
          service: 'email',
          data: {
            cc: recipients,
          },
          after(output) {
            expect(output.url).to.contain('cc=' + implode(recipients, true));
          },
        });
      });

      it('should contain a subject', () => {
        OdoShare.share({
          service: 'email',
          data: {
            subject: 'cool title',
          },
          after(output) {
            expect(output.url).to.contain('subject=' + encode('cool title'));
          },
        });
      });

      it('should contain a body', () => {
        OdoShare.share({
          service: 'email',
          data: {
            body: window.location.href,
          },
          after(output) {
            expect(output.url).to.contain('body=' + encode(window.location.href));
          },
        });
      });
    });
  });
});
