function test(support) {
  // If the test has already passed, return a resolved promise.
  if (test.HAS_LOCAL_STORAGE && window.localStorage.getItem('odovideoautoplay') === 'true') {
    return Promise.resolve(true);
  }

  // Retrieve the number of autoplay test attempts. Max is 3.
  const tries = test.HAS_LOCAL_STORAGE && parseInt(window.localStorage.getItem('odovideoautoplaytries'), 10) || 0;
  if (tries > 2) {
    return Promise.resolve(false);
  }

  /* istanbul ignore next */
  return new Promise((resolve) => {
    let timeout;

    // Chrome can handle 300ms. IE11 requires at least 900 to avoid failing consistenly.
    const waitTime = 1000;
    const elem = document.createElement('video');

    const complete = (bool) => {
      if (test.HAS_LOCAL_STORAGE) {
        window.localStorage.setItem('odovideoautoplay', bool);
        window.localStorage.setItem('odovideoautoplaytries', tries + 1);
      }

      resolve(bool);
    };

    const testAutoplay = (arg) => {
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
    setTimeout(() => {
      elem.addEventListener('playing', testAutoplay);
      timeout = setTimeout(testAutoplay, waitTime);
    }, 0);
  });
}

// Support: Safari private browsing.
test.HAS_LOCAL_STORAGE = (() => {
  try {
    const testKey = 'test';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) /* istanbul ignore next */ {
    return false;
  }
})();

export default test;
