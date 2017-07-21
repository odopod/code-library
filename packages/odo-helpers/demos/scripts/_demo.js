/* eslint-disable no-console */

const OdoDevice = window.OdoDevice;
const OdoHelpers = window.OdoHelpers;
const animation = OdoHelpers.animation;
const dom = OdoHelpers.dom;
const style = OdoHelpers.style;
const Timer = OdoHelpers.Timer;
const browser = OdoHelpers.browser;

// Transition end.
let transitionEndCount = 0;
let transitionId = null;
const block = document.getElementById('animate-my-left');
const output = document.getElementById('left-output');

document.getElementById('left-animator').addEventListener('click', () => {
  animation.cancelTransitionEnd(transitionId);
  output.textContent = 'waiting for transition: ' + transitionEndCount;
  block.classList.toggle('active');

  transitionId = animation.onTransitionEnd(block, () => {
    transitionEndCount += 1;
    output.textContent = 'transition ended: ' + transitionEndCount;
  });
});

// Animation end.
document.getElementById('spin-it').addEventListener('click', () => {
  const block = document.querySelector('.my-keyframes');
  block.classList.add('spinning', 'spun');
  animation.onAnimationEnd(block, () => {
    block.classList.remove('spinning');
  });
});

// Fade in/out element
let fadeId = null;
document.getElementById('fade-it').addEventListener('click', () => {
  animation.cancelTransitionEnd(fadeId);
  fadeId = animation.fadeOutElement(document.getElementById('darth-fader'), function x() {
    console.log('Faded out.', this.hello);
  }, { hello: 'world' }, true);
});

document.getElementById('show-it').addEventListener('click', () => {
  animation.cancelTransitionEnd(fadeId);
  fadeId = animation.fadeInElement(document.getElementById('darth-fader'), function x() {
    console.log('Faded In.', this.hello);
  }, { hello: 'universe' }, true);
});

// ScrollTo and scrollToTop
document.getElementById('started-from-the-bottom').addEventListener('click', () => {
  const bottom = document.body.offsetHeight - window.innerHeight;
  const duration = 600;
  const easing = k => -k * (k - 2);

  animation.scrollTo(bottom, duration, () => {
    console.log('done!');
  }, easing);
});

document.getElementById('take-me-to-the-top').addEventListener('click', () => {
  animation.scrollToTop();
});

// Stepper
(function a() {
  const stepBlock = document.getElementById('yolo');
  const stepOutput = document.getElementById('stepper-output');

  const parentWidth = stepBlock.parentNode.offsetWidth;
  const parentHeight = stepBlock.parentNode.offsetHeight;
  const radius = parentWidth / 2;
  const center = {
    x: radius,
    y: parentHeight / 2,
  };
  let stepper;

  const eachStep = (value, percent) => {
    const radians = (value + 180) * (Math.PI / 180);
    let x = center.x + radius * Math.cos(radians);
    let y = center.y + radius * Math.sin(radians);

    if (percent === 1 || percent === 0) {
      x = Math.round(x);
      y = Math.round(y);
    }

    stepBlock.style[OdoDevice.Dom.TRANSFORM] = 'translate(' + x + 'px,' + y + 'px)';

    // Update display.
    stepOutput.innerHTML = value.toFixed(0) + '/180<br>' + Math.round(percent * 100) + '%';
  };

  eachStep(0, 0);

  document.getElementById('step-it').addEventListener('click', () => {
    // Stop any previous steppers from finishing.
    if (stepper) {
      stepper.cancel();
    }

    stepper = new animation.Stepper({
      start: 0,
      end: 180,
      duration: 500,
      context: { taco: 'Tuesday' },
      step: eachStep,
      easing(k) {
        return -(--k * k * k * k - 1); // eslint-disable-line no-plusplus, no-param-reassign
      },
    });

    stepper.onfinish = () => {
      stepOutput.innerHTML += '<br>Done!';
    };
  });
}());

(function a() {
  const element = document.getElementById('get-me');
  const output = document.getElementById('its-raining');

  const echo = (str) => {
    output.innerHTML = JSON.stringify(str, null, ' ');
  };

  document.getElementById('get-margins').addEventListener('click', () => {
    echo(style.getMarginBox(element));
  });

  document.getElementById('get-paddings').addEventListener('click', () => {
    echo(style.getPaddingBox(element));
  });

  document.getElementById('get-size').addEventListener('click', () => {
    echo(style.getSize(element));
  });
}());

(function a() {
  const wrapper = document.getElementById('get-elements-wrapper');
  const output = document.getElementById('output-elements-size');

  document.getElementById('get-elements-size').addEventListener('click', () => {
    const width = style.getElementsSize(dom.getChildren(wrapper), 'width');
    output.textContent = width + ' pixels';
  });
}());

(function a() {
  document.getElementById('force-redraw').addEventListener('click', style.forceRedraw);
}());

(function a() {
  const checkbox = document.getElementById('should-i-do-it');
  const block = document.getElementById('blocktacular');

  document.getElementById('lets-get-ready-to-rumble').addEventListener('click', () => {
    block.classList.add('faded');

    if (checkbox.checked) {
      style.causeLayout(block);
    }

    block.classList.add('active');

    setTimeout(() => {
      block.classList.remove('faded', 'active');
    }, 500);
  });
}());

(function a() {
  document.getElementById('even-the-heights').addEventListener('click', () => {
    const tallest = style.evenHeights(document.querySelectorAll('#first-row .product__title'));
    console.log(tallest); // 34 ish
  });

  document.getElementById('even-them-all').addEventListener('click', () => {
    const groups = [
      document.querySelectorAll('#second-row .product__title'),
      document.querySelectorAll('#second-row .product'),
    ];
    const tallestArray = style.evenHeights(groups);
    console.log(tallestArray); // [34, 140] ish
  });
}());

(function a() {
  const timer = new Timer(() => {
    document.getElementById('timer-block').style.backgroundColor = 'hsl(' + Math.round(Math.random() * 360) + ',58%,50%)';

    if (!timer.isContinuous) {
      document.getElementById('is-timer-running').textContent = 'Timer stopped';
    }
  }, 400, false);

  timer.start();

  document.getElementById('pause-timer').addEventListener('click', () => {
    timer.pause();
    document.getElementById('is-timer-running').textContent = 'Timer stopped';
  });

  document.getElementById('resume-timer').addEventListener('click', () => {
    timer.resume();
    document.getElementById('is-timer-running').textContent = 'Timer running.';
  });

  document.getElementById('continuous-timer').addEventListener('change', function listener() {
    timer.isContinuous = this.checked;
  });
}());

// DOM events
(function a() {
  const date = new Date().getTime();
  let end;

  dom.ready.then(() => {
    end = new Date().getTime() - date;
    document.getElementById('dom-ready-text').textContent = end + ' ms';
    document.getElementById('dom-ready').classList.add('block--fired');
  });

  dom.loaded.then(() => {
    end = new Date().getTime() - date;
    document.getElementById('dom-loaded-text').textContent = end + ' ms';
    document.getElementById('dom-loaded').classList.add('block--fired');
  });
}());

(function a() {
  const Events = window.OdoHelpers.events;
  console.log('transition end event name: ' + Events.TRANSITIONEND);
  console.log('animation end event name : ' + Events.ANIMATIONEND);
  console.log('pointer move event name  : ' + Events.POINTERMOVE);
}());

(function a() {
  const isAndroidOS = document.querySelector('.js-is-android-os');
  const isIOS = document.querySelector('.js-is-ios');
  const hasScrollEvents = document.querySelector('.js-has-scroll-events');
  const getIOSVersion = document.querySelector('.js-get-ios-version');
  const isChrome = document.querySelector('.js-is-chrome');
  const isEdge = document.querySelector('.js-is-edge');
  const isIE = document.querySelector('.js-is-ie');
  const isNativeAndroid = document.querySelector('.js-is-native-android');
  const input = document.querySelector('.js-user-agent');
  const list = document.querySelector('.js-user-agent-list');
  const hash = document.getElementById('hash-click');
  const replace = document.getElementById('replace-hash-click');

  input.value = navigator.userAgent;

  const update = function x() {
    const ua = input.value;
    isAndroidOS.classList.toggle('true', browser.isAndroidOS(ua));
    isAndroidOS.classList.toggle('false', !browser.isAndroidOS(ua));
    isIOS.classList.toggle('true', browser.isIOS(ua));
    isIOS.classList.toggle('false', !browser.isIOS(ua));
    hasScrollEvents.classList.toggle('true', browser.hasScrollEvents(ua));
    hasScrollEvents.classList.toggle('false', !browser.hasScrollEvents(ua));
    isChrome.classList.toggle('true', browser.isChrome(ua));
    isChrome.classList.toggle('false', !browser.isChrome(ua));
    isEdge.classList.toggle('true', browser.isEdge(ua));
    isEdge.classList.toggle('false', !browser.isEdge(ua));
    isIE.classList.toggle('true', browser.isIE(ua));
    isIE.classList.toggle('false', !browser.isIE(ua));
    isNativeAndroid.classList.toggle('true', browser.isNativeAndroid(ua));
    isNativeAndroid.classList.toggle('false', !browser.isNativeAndroid(ua));

    if (browser.isIOS(ua)) {
      getIOSVersion.textContent = browser.getIOSVersion(ua);
    } else {
      getIOSVersion.textContent = 'N/A';
    }
  };

  hash.addEventListener('click', () => {
    browser.setHash('#awwyiss');
  });

  replace.addEventListener('click', () => {
    browser.replaceWithHash('#awwyissssss');
  });

  input.addEventListener('change keydown', () => {
    setTimeout(update, 10);
  });

  list.addEventListener('change', () => {
    input.value = list.value;
    update();
  });

  // Set the first option to this browser's ua.
  list.querySelector('option').value = navigator.userAgent;

  update();
}());
