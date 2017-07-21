/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const browser = window.OdoHelpers.browser;

describe('The browser class', function bowser() {
  this.timeout(5000);

  const androidString = 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';
  const galaxyExhibit = 'Mozilla/5.0 (Linux; U; Android 2.3.6; en-us; SGH-T679 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1';
  const chromeAndroid = 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 5 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.99 Mobile Safari/537.36';

  const ios8String = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4';
  const ios812String = 'Mozilla/5.0 (iPad; CPU OS 8_1_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) GSA/5.1.42378 Mobile/12B440 Safari/600.1.4';
  const iphoneString = 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';
  const ipadString = 'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';
  const ipodString = 'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; ja-jp) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5';
  const chromeIOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/43.0.2357.61 Mobile/12H143 Safari/600.1.4 (000980)';

  const safari9 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/601.7.8';
  const chromeDesktop = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2046.3 Safari/537.36';
  const operaDesktop = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36 OPR/22.0.1471.50';
  const ie9 = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)';
  const ie10 = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)';
  const win8ie11 = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; Tablet PC 2.0; rv:11.0) like Gecko';
  const win10ie11 = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; rv:11.0) like Gecko';
  const edge12 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10166';
  const edge14 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393';

  it('can detect Android OS.', () => {
    expect(browser.isAndroidOS(androidString)).to.equal(true);
    expect(browser.isAndroidOS(galaxyExhibit)).to.equal(true);
    expect(browser.isAndroidOS(chromeAndroid)).to.equal(true);
    expect(browser.isAndroidOS(ipadString)).to.equal(false);
    expect(browser.isAndroidOS(win8ie11)).to.equal(false);
    expect(browser.isAndroidOS(edge12)).to.equal(false);
    expect(browser.isAndroidOS(edge14)).to.equal(false);
    expect(browser.isAndroidOS(safari9)).to.equal(false);
  });

  it('can detect stock Android browser', () => {
    expect(browser.isNativeAndroid(galaxyExhibit)).to.equal(true);
    expect(browser.isNativeAndroid(chromeAndroid)).to.equal(false);
    expect(browser.isNativeAndroid(chromeDesktop)).to.equal(false);
    expect(browser.isNativeAndroid(iphoneString)).to.equal(false);
    expect(browser.isNativeAndroid(edge12)).to.equal(false);
    expect(browser.isNativeAndroid(edge14)).to.equal(false);
    expect(browser.isNativeAndroid(safari9)).to.equal(false);
  });

  it('can detect iOS.', () => {
    expect(browser.isIOS(ipadString)).to.equal(true);
    expect(browser.isIOS(iphoneString)).to.equal(true);
    expect(browser.isIOS(ipodString)).to.equal(true);
    expect(browser.isIOS(ios8String)).to.equal(true);
    expect(browser.isIOS(chromeIOS)).to.equal(true);
    expect(browser.isIOS(androidString)).to.equal(false);
    expect(browser.isIOS(galaxyExhibit)).to.equal(false);
    expect(browser.isIOS(win8ie11)).to.equal(false);
    expect(browser.isIOS(edge12)).to.equal(false);
    expect(browser.isIOS(edge14)).to.equal(false);
    expect(browser.isIOS(safari9)).to.equal(false);
  });

  it('can retrieve the iOS version number', () => {
    expect(browser.getIOSVersion(ipodString)).to.equal(433);
    expect(browser.getIOSVersion(iphoneString)).to.equal(500);
    expect(browser.getIOSVersion(ios8String)).to.equal(800);
    expect(browser.getIOSVersion(ios812String)).to.equal(812);
    expect(browser.getIOSVersion(chromeIOS)).to.equal(840);
  });

  it('can sniff which browsers have scroll events.', () => {
    expect(browser.hasScrollEvents(ios8String)).to.equal(true);

    // As of July 2015, Chrome on iOS 8 still doesn't support scroll events,
    // but we don't have a test for it.
    expect(browser.hasScrollEvents(chromeIOS)).to.equal(true);

    expect(browser.hasScrollEvents(chromeDesktop)).to.equal(true);
    expect(browser.hasScrollEvents(safari9)).to.equal(true);
    expect(browser.hasScrollEvents(chromeAndroid)).to.equal(true);
    expect(browser.hasScrollEvents(win8ie11)).to.equal(true);
    expect(browser.hasScrollEvents(edge12)).to.equal(true);
    expect(browser.hasScrollEvents(ipadString)).to.equal(false);
    expect(browser.hasScrollEvents(iphoneString)).to.equal(false);
    expect(browser.hasScrollEvents(ipodString)).to.equal(false);
    expect(browser.hasScrollEvents(androidString)).to.equal(false);
  });

  it('can detect the Google Chrome browser.', () => {
    expect(browser.isChrome(chromeAndroid)).to.equal(true);
    expect(browser.isChrome(chromeDesktop)).to.equal(true);
    expect(browser.isChrome(operaDesktop)).to.equal(true);
    expect(browser.isChrome(edge12)).to.equal(false);
    expect(browser.isChrome(edge14)).to.equal(false);
    expect(browser.isChrome(win8ie11)).to.equal(false);
    expect(browser.isChrome(ipadString)).to.equal(false);
    expect(browser.isChrome(androidString)).to.equal(false);
    expect(browser.isChrome(galaxyExhibit)).to.equal(false);
    expect(browser.isChrome(safari9)).to.equal(false);
  });

  it('can detect edge', () => {
    expect(browser.isEdge(edge12)).to.equal(true);
    expect(browser.isEdge(edge14)).to.equal(true);
    expect(browser.isEdge(chromeAndroid)).to.equal(false);
    expect(browser.isEdge(chromeDesktop)).to.equal(false);
    expect(browser.isEdge(ie9)).to.equal(false);
    expect(browser.isEdge(ie10)).to.equal(false);
    expect(browser.isEdge(win8ie11)).to.equal(false);
    expect(browser.isEdge(win10ie11)).to.equal(false);
    expect(browser.isEdge(ios8String)).to.equal(false);
    expect(browser.isEdge(safari9)).to.equal(false);
  });

  it('can detect internet explorer', () => {
    expect(browser.isIE(ie9)).to.equal(true);
    expect(browser.isIE(ie10)).to.equal(true);
    expect(browser.isIE(win8ie11)).to.equal(true);
    expect(browser.isIE(win10ie11)).to.equal(true);
    expect(browser.isIE(edge12)).to.equal(false);
    expect(browser.isIE(edge14)).to.equal(false);
    expect(browser.isIE(chromeAndroid)).to.equal(false);
    expect(browser.isIE(chromeDesktop)).to.equal(false);
    expect(browser.isIE(ios8String)).to.equal(false);
    expect(browser.isIE(safari9)).to.equal(false);
  });

  describe('Browser hash', () => {
    it('can set the hash in window.location', () => {
      const dummyHash = '#weeeee';
      browser.setHash(dummyHash);
      expect(window.location.hash).to.equal(dummyHash);

      // testing that an error will be thrown if hash is not a string
      const throwError = () => browser.setHash(5);

      expect(throwError).to.throw(Error);

      // testing if the window will scroll when element exist in DOM
      const reset = '';
      browser.setHash(reset);
    });
  });

  describe('Browser history - without replaceState', () => {
    let history;

    beforeEach(() => {
      history = Object.getPrototypeOf(window.history);
      Object.setPrototypeOf(window.history, {});
    });

    afterEach(() => {
      Object.setPrototypeOf(window.history, history);
    });

    it('browser.replaceWithHash() will fallback to browser.setHash()', () => {
      const historySpy = sinon.spy(browser, 'setHash');
      browser.replaceWithHash('whopps');
      expect(historySpy.calledOnce).to.be.true;
    });
  });

  describe('Browser history - with replaceState', () => {
    it('will replace state in history', () => {
      // testing that an error will be thrown if hash is not a string
      const throwError = () => browser.setHash(5);

      expect(throwError).to.throw(Error);

      // testing successful entry into replaceState
      const testHashOne = '#this';
      browser.replaceWithHash(testHashOne);
      expect(window.location.hash).to.equal(testHashOne);

      // testing resetting hash
      const testHashTwo = '';
      browser.replaceWithHash(testHashTwo);
      expect(window.location.hash).to.equal(testHashTwo);
    });
  });
});
