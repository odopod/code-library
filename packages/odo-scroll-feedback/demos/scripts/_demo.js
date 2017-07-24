const OdoScrollFeedback = window.OdoScrollFeedback;

const scrollFeedback = new OdoScrollFeedback(document.body, {
  ignore: '.js-free-scroll',
});

let isScrolling = false;

// Animate scrolling the page - without jQuery. Code adapted from DualViewer's stepper.js
const scrollToIndex = (index) => {
  const duration = 400;
  const start = window.pageYOffset;
  const end = index * window.innerHeight;
  const amount = end - start;
  const startTime = +new Date();

  const easing = k => (-0.5 * (Math.cos(Math.PI * k) - 1));

  const step = (value/* , percent*/) => {
    window.scrollTo(0, value);
  };

  const complete = () => {
    isScrolling = false;
  };

  const looper = () => {
    const now = +new Date();
    const remainingTime = startTime + duration - now;
    let percent = 1 - (remainingTime / duration || 0);

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
    step(start + (amount * percent), percent);

    // Request animation frame.
    requestAnimationFrame(looper);
  };

  isScrolling = true;
  requestAnimationFrame(looper);
};

scrollFeedback.on(OdoScrollFeedback.Events.NAVIGATE, (data) => {
  if (isScrolling) {
    return;
  }

  const currentSection = Math.round(window.pageYOffset / window.innerHeight);

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

document.getElementById('to-footer').addEventListener('click', (event) => {
  event.preventDefault();
  scrollToIndex(Math.ceil(document.documentElement.offsetHeight / window.innerHeight));
}, false);


// Color compliments. Attempts to color them randomly, but differently.
const compliments = Array.from(document.querySelectorAll('.compliment'));
const hues = [];
const MIN_DIFFERENCE = 40;
const MAX_TRIES = 10;

// Returns the hue with the smallest difference.
const getHueDifference = value => hues.reduce((min, hue) => {
  const diff = Math.abs(hue - value);
  if (diff < min) {
    return diff;
  }
  return min;
}, Infinity);

const getHue = (count = 0) => {
  const hue = Math.round(Math.random() * 360);

  // If the difference is too small and the count has not exceed the max times,
  // try another hue.
  if (getHueDifference(hue) < MIN_DIFFERENCE && count < MAX_TRIES) {
    return getHue(count + 1);
  }
  hues.push(hue);
  return hue;
};

compliments.forEach((element) => {
  element.style.backgroundColor = 'hsl(' + getHue() + ', 58%, 50%)';
});


// Fix iOS `vh` units. The `vh` unit in iOS 8 is always relative to the visual
// viewport **when the toolbars are minimized**. What's worse is that scrolling the
// page programmatically does not always minimize the toolbars!
// This is an ugly solution because it changes the size of page but not the scroll
// position.
// http://stackoverflow.com/questions/24889100/ios-8-removed-minimal-ui-viewport-property-are-there-other-soft-fullscreen
function buggyfillVh() {
  const windowHeight = window.innerHeight;
  Array.from(document.querySelectorAll('.section')).forEach((element) => {
    element.style.height = windowHeight + 'px';
  });
}

buggyfillVh();
window.addEventListener('resize', buggyfillVh);

let isPaused = false;
document.getElementById('pause-toggle').addEventListener('click', () => {
  if (isPaused) {
    document.getElementById('pause-toggle').textContent = 'Pause';
    scrollFeedback.resume();
  } else {
    document.getElementById('pause-toggle').textContent = 'Resume';
    scrollFeedback.pause();
  }

  isPaused = !isPaused;
});
