// Until this PR is accepted, SVG elements don't work with that polyfill. This
// is the patched version of `element-closest` package.
// https://github.com/jonathantneal/closest/pull/11
// Support: Edge 14+, Android<=4.4.4
/* istanbul ignore next */
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

// Support: Edge 14+, Android<=4.4.4, Safari<=8, iOS<=8.4
/* istanbul ignore next */
if (!Element.prototype.closest) {
  Element.prototype.closest = function closest(selector) {
    var element = this; // eslint-disable-line

    while (element) {
      if (element.matches(selector)) {
        break;
      }

      element = element.parentNode instanceof Element ? element.parentNode : null;
    }

    return element;
  };
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik MÃ¶ller. fixes from Paul Irish and Tino Zijdel

// MIT license

// Support: IE<=9, Android<=4.3
/* istanbul ignore next */
if (!window.requestAnimationFrame) {
  let lastTime = 0;
  window.requestAnimationFrame = function raf(callback) {
    const currTime = new Date().getTime();
    const timeToCall = Math.max(0, 16 - (currTime - lastTime));
    const id = window.setTimeout(() => {
      callback(currTime + timeToCall);
    }, timeToCall);

    lastTime = currTime + timeToCall;
    return id;
  };
}

/* istanbul ignore next */
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function caf(id) {
    clearTimeout(id);
  };
}
