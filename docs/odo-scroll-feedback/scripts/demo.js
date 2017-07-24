(function () {
'use strict';

var OdoScrollFeedback = window.OdoScrollFeedback;

var scrollFeedback = new OdoScrollFeedback(document.body, {
  ignore: '.js-free-scroll'
});

var isScrolling = false;

// Animate scrolling the page - without jQuery. Code adapted from DualViewer's stepper.js
var scrollToIndex = function scrollToIndex(index) {
  var duration = 400;
  var start = window.pageYOffset;
  var end = index * window.innerHeight;
  var amount = end - start;
  var startTime = +new Date();

  var easing = function easing(k) {
    return -0.5 * (Math.cos(Math.PI * k) - 1);
  };

  var step = function step(value /* , percent*/) {
    window.scrollTo(0, value);
  };

  var complete = function complete() {
    isScrolling = false;
  };

  var looper = function looper() {
    var now = +new Date();
    var remainingTime = startTime + duration - now;
    var percent = 1 - (remainingTime / duration || 0);

    // Abort if already past 100%.
    if (percent >= 1) {
      // Make sure it always finishes with 1.
      step(end, 1);
      complete();
      return;
    }

    // Apply easing.
    percent = easing(percent);

    // Tick.
    step(start + amount * percent, percent);

    // Request animation frame.
    requestAnimationFrame(looper);
  };

  isScrolling = true;
  requestAnimationFrame(looper);
};

scrollFeedback.on(OdoScrollFeedback.Events.NAVIGATE, function (data) {
  if (isScrolling) {
    return;
  }

  var currentSection = Math.round(window.pageYOffset / window.innerHeight);

  switch (data.direction) {
    case OdoScrollFeedback.Direction.NEXT:
      scrollToIndex(currentSection + 1);
      break;
    case OdoScrollFeedback.Direction.PREVIOUS:
      scrollToIndex(currentSection - 1);
      break;
    case OdoScrollFeedback.Direction.START:
      scrollToIndex(0);
      break;
    case OdoScrollFeedback.Direction.END:
      scrollToIndex(Math.ceil(document.documentElement.offsetHeight / window.innerHeight));
      break;
    // no default
  }
});

document.getElementById('to-footer').addEventListener('click', function (event) {
  event.preventDefault();
  scrollToIndex(Math.ceil(document.documentElement.offsetHeight / window.innerHeight));
}, false);

// Color compliments. Attempts to color them randomly, but differently.
var compliments = Array.from(document.querySelectorAll('.compliment'));
var hues = [];
var MIN_DIFFERENCE = 40;
var MAX_TRIES = 10;

// Returns the hue with the smallest difference.
var getHueDifference = function getHueDifference(value) {
  return hues.reduce(function (min, hue) {
    var diff = Math.abs(hue - value);
    if (diff < min) {
      return diff;
    }
    return min;
  }, Infinity);
};

var getHue = function getHue() {
  var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  var hue = Math.round(Math.random() * 360);

  // If the difference is too small and the count has not exceed the max times,
  // try another hue.
  if (getHueDifference(hue) < MIN_DIFFERENCE && count < MAX_TRIES) {
    return getHue(count + 1);
  }
  hues.push(hue);
  return hue;
};

compliments.forEach(function (element) {
  element.style.backgroundColor = 'hsl(' + getHue() + ', 58%, 50%)';
});

// Fix iOS `vh` units. The `vh` unit in iOS 8 is always relative to the visual
// viewport **when the toolbars are minimized**. What's worse is that scrolling the
// page programmatically does not always minimize the toolbars!
// This is an ugly solution because it changes the size of page but not the scroll
// position.
// http://stackoverflow.com/questions/24889100/ios-8-removed-minimal-ui-viewport-property-are-there-other-soft-fullscreen
function buggyfillVh() {
  var windowHeight = window.innerHeight;
  Array.from(document.querySelectorAll('.section')).forEach(function (element) {
    element.style.height = windowHeight + 'px';
  });
}

buggyfillVh();
window.addEventListener('resize', buggyfillVh);

var isPaused = false;
document.getElementById('pause-toggle').addEventListener('click', function () {
  if (isPaused) {
    document.getElementById('pause-toggle').textContent = 'Pause';
    scrollFeedback.resume();
  } else {
    document.getElementById('pause-toggle').textContent = 'Resume';
    scrollFeedback.pause();
  }

  isPaused = !isPaused;
});

}());
