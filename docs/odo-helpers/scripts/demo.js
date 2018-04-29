(function () {
  'use strict';

  /* eslint-disable no-console */

  var _window = window,
      OdoDevice = _window.OdoDevice,
      OdoHelpers = _window.OdoHelpers;

  // Transition end.

  var transitionEndCount = 0;
  var transitionId = null;
  var block = document.getElementById('animate-my-left');
  var output = document.getElementById('left-output');

  document.getElementById('left-animator').addEventListener('click', function () {
    OdoHelpers.cancelTransitionEnd(transitionId);
    output.textContent = 'waiting for transition: ' + transitionEndCount;
    block.classList.toggle('active');

    transitionId = OdoHelpers.onTransitionEnd(block, function () {
      transitionEndCount += 1;
      output.textContent = 'transition ended: ' + transitionEndCount;
    });
  });

  // Animation end.
  document.getElementById('spin-it').addEventListener('click', function () {
    var block = document.querySelector('.my-keyframes');
    block.classList.add('spinning', 'spun');
    OdoHelpers.onAnimationEnd(block, function () {
      block.classList.remove('spinning');
    });
  });

  // Fade in/out element
  var fadeId = null;
  document.getElementById('fade-it').addEventListener('click', function () {
    OdoHelpers.cancelTransitionEnd(fadeId);
    fadeId = OdoHelpers.fadeOutElement(document.getElementById('darth-fader'), function x() {
      console.log('Faded out.', this.hello);
    }, { hello: 'world' }, true);
  });

  document.getElementById('show-it').addEventListener('click', function () {
    OdoHelpers.cancelTransitionEnd(fadeId);
    fadeId = OdoHelpers.fadeInElement(document.getElementById('darth-fader'), function x() {
      console.log('Faded In.', this.hello);
    }, { hello: 'universe' }, true);
  });

  // ScrollTo and scrollToTop
  document.getElementById('started-from-the-bottom').addEventListener('click', function () {
    var bottom = document.body.offsetHeight - window.innerHeight;
    var duration = 600;
    var easing = function easing(k) {
      return -k * (k - 2);
    };

    OdoHelpers.scrollTo(bottom, duration, function () {
      console.log('done!');
    }, easing);
  });

  document.getElementById('take-me-to-the-top').addEventListener('click', function () {
    OdoHelpers.scrollToTop();
  });

  // Stepper
  (function a() {
    var stepBlock = document.getElementById('yolo');
    var stepOutput = document.getElementById('stepper-output');

    var parentWidth = stepBlock.parentNode.offsetWidth;
    var parentHeight = stepBlock.parentNode.offsetHeight;
    var radius = parentWidth / 2;
    var center = {
      x: radius,
      y: parentHeight / 2
    };
    var stepper = void 0;

    var eachStep = function eachStep(value, percent) {
      var radians = (value + 180) * (Math.PI / 180);
      var x = center.x + radius * Math.cos(radians);
      var y = center.y + radius * Math.sin(radians);

      if (percent === 1 || percent === 0) {
        x = Math.round(x);
        y = Math.round(y);
      }

      stepBlock.style[OdoDevice.Dom.TRANSFORM] = 'translate(' + x + 'px,' + y + 'px)';

      // Update display.
      stepOutput.innerHTML = value.toFixed(0) + '/180<br>' + Math.round(percent * 100) + '%';
    };

    eachStep(0, 0);

    document.getElementById('step-it').addEventListener('click', function () {
      // Stop any previous steppers from finishing.
      if (stepper) {
        stepper.cancel();
      }

      stepper = new OdoHelpers.Stepper({
        start: 0,
        end: 180,
        duration: 500,
        context: { taco: 'Tuesday' },
        step: eachStep,
        easing: function easing(k) {
          return -(--k * k * k * k - 1); // eslint-disable-line no-plusplus, no-param-reassign
        }
      });

      stepper.onfinish = function () {
        stepOutput.innerHTML += '<br>Done!';
      };
    });
  })();

  (function a() {
    var element = document.getElementById('get-me');
    var output = document.getElementById('its-raining');

    var echo = function echo(str) {
      output.innerHTML = JSON.stringify(str, null, ' ');
    };

    document.getElementById('get-margins').addEventListener('click', function () {
      echo(OdoHelpers.getMarginBox(element));
    });

    document.getElementById('get-paddings').addEventListener('click', function () {
      echo(OdoHelpers.getPaddingBox(element));
    });

    document.getElementById('get-size').addEventListener('click', function () {
      echo(OdoHelpers.getSize(element));
    });
  })();

  (function a() {
    var wrapper = document.getElementById('get-elements-wrapper');
    var output = document.getElementById('output-elements-size');

    document.getElementById('get-elements-size').addEventListener('click', function () {
      var width = OdoHelpers.getElementsSize(Array.from(wrapper.children), 'width');
      output.textContent = width + ' pixels';
    });
  })();

  (function a() {
    document.getElementById('force-redraw').addEventListener('click', OdoHelpers.forceRedraw);
  })();

  (function a() {
    var checkbox = document.getElementById('should-i-do-it');
    var block = document.getElementById('blocktacular');

    document.getElementById('lets-get-ready-to-rumble').addEventListener('click', function () {
      block.classList.add('faded');

      if (checkbox.checked) {
        OdoHelpers.causeLayout(block);
      }

      block.classList.add('active');

      setTimeout(function () {
        block.classList.remove('faded', 'active');
      }, 500);
    });
  })();

  (function a() {
    document.getElementById('even-the-heights').addEventListener('click', function () {
      var tallest = OdoHelpers.evenHeights(document.querySelectorAll('#first-row .product__title'));
      console.log(tallest); // 34 ish
    });

    document.getElementById('even-them-all').addEventListener('click', function () {
      var groups = [document.querySelectorAll('#second-row .product__title'), document.querySelectorAll('#second-row .product')];
      var tallestArray = OdoHelpers.evenHeights(groups);
      console.log(tallestArray); // [34, 140] ish
    });
  })();

  (function a() {
    var timer = new OdoHelpers.Timer(function () {
      document.getElementById('timer-block').style.backgroundColor = 'hsl(' + Math.round(Math.random() * 360) + ',58%,50%)';

      if (!timer.isContinuous) {
        document.getElementById('is-timer-running').textContent = 'Timer stopped';
      }
    }, 400, false);

    timer.start();

    document.getElementById('pause-timer').addEventListener('click', function () {
      timer.pause();
      document.getElementById('is-timer-running').textContent = 'Timer stopped';
    });

    document.getElementById('resume-timer').addEventListener('click', function () {
      timer.resume();
      document.getElementById('is-timer-running').textContent = 'Timer running.';
    });

    document.getElementById('continuous-timer').addEventListener('change', function listener() {
      timer.isContinuous = this.checked;
    });
  })();

  // DOM events
  (function a() {
    var date = new Date().getTime();
    var end = void 0;

    OdoHelpers.domReady.then(function () {
      end = new Date().getTime() - date;
      document.getElementById('dom-ready-text').textContent = end + ' ms';
      document.getElementById('dom-ready').classList.add('block--fired');
    });

    OdoHelpers.domLoaded.then(function () {
      end = new Date().getTime() - date;
      document.getElementById('dom-loaded-text').textContent = end + ' ms';
      document.getElementById('dom-loaded').classList.add('block--fired');
    });
  })();

  (function a() {
    console.log('transition end event name: ' + OdoHelpers.events.TRANSITIONEND);
    console.log('animation end event name : ' + OdoHelpers.events.ANIMATIONEND);
    console.log('pointer move event name  : ' + OdoHelpers.events.POINTERMOVE);
  })();

  (function a() {
    var isAndroidOS = document.querySelector('.js-is-android-os');
    var isIOS = document.querySelector('.js-is-ios');
    var hasScrollEvents = document.querySelector('.js-has-scroll-events');
    var getIOSVersion = document.querySelector('.js-get-ios-version');
    var isChrome = document.querySelector('.js-is-chrome');
    var isEdge = document.querySelector('.js-is-edge');
    var isIE = document.querySelector('.js-is-ie');
    var isNativeAndroid = document.querySelector('.js-is-native-android');
    var input = document.querySelector('.js-user-agent');
    var list = document.querySelector('.js-user-agent-list');
    var hash = document.getElementById('hash-click');
    var replace = document.getElementById('replace-hash-click');

    input.value = navigator.userAgent;

    var update = function x() {
      var ua = input.value;
      isAndroidOS.classList.toggle('true', OdoHelpers.isAndroidOS(ua));
      isAndroidOS.classList.toggle('false', !OdoHelpers.isAndroidOS(ua));
      isIOS.classList.toggle('true', OdoHelpers.isIOS(ua));
      isIOS.classList.toggle('false', !OdoHelpers.isIOS(ua));
      hasScrollEvents.classList.toggle('true', OdoHelpers.hasScrollEvents(ua));
      hasScrollEvents.classList.toggle('false', !OdoHelpers.hasScrollEvents(ua));
      isChrome.classList.toggle('true', OdoHelpers.isChrome(ua));
      isChrome.classList.toggle('false', !OdoHelpers.isChrome(ua));
      isEdge.classList.toggle('true', OdoHelpers.isEdge(ua));
      isEdge.classList.toggle('false', !OdoHelpers.isEdge(ua));
      isIE.classList.toggle('true', OdoHelpers.isIE(ua));
      isIE.classList.toggle('false', !OdoHelpers.isIE(ua));
      isNativeAndroid.classList.toggle('true', OdoHelpers.isNativeAndroid(ua));
      isNativeAndroid.classList.toggle('false', !OdoHelpers.isNativeAndroid(ua));

      if (OdoHelpers.isIOS(ua)) {
        getIOSVersion.textContent = OdoHelpers.getIOSVersion(ua);
      } else {
        getIOSVersion.textContent = 'N/A';
      }
    };

    hash.addEventListener('click', function () {
      OdoHelpers.setHash('#awwyiss');
    });

    replace.addEventListener('click', function () {
      OdoHelpers.replaceWithHash('#awwyissssss');
    });

    input.addEventListener('change keydown', function () {
      setTimeout(update, 10);
    });

    list.addEventListener('change', function () {
      input.value = list.value;
      update();
    });

    // Set the first option to this browser's ua.
    list.querySelector('option').value = navigator.userAgent;

    update();
  })();

}());
