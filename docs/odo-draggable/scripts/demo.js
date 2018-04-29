(function () {
  'use strict';

  var _window = window,
      OdoDraggable = _window.OdoDraggable,
      OdoHelpers = _window.OdoHelpers;


  var x = new OdoDraggable(document.getElementById('draggable-x'), {
    axis: 'x'
  });

  var y = new OdoDraggable(document.getElementById('draggable-y'), {
    axis: 'y'
  });

  var xy = new OdoDraggable(document.getElementById('draggable-xy'), {
    axis: 'xy'
  });

  var throwable = new OdoDraggable(document.getElementById('draggable-throw-me'), {
    axis: 'xy',
    isThrowable: true
  });

  window.x = x;
  window.y = y;
  window.xy = xy;
  window.throwable = throwable;

  var select = function select(selector) {
    return document.querySelector(selector);
  };

  function setThrowableLimits() {
    var element = throwable.element;

    var parent = element.parentNode;
    var draggableWidth = element.offsetWidth;
    var draggableHeight = element.offsetHeight;
    var containerWidth = parent.offsetWidth;
    var containerHeight = parent.offsetHeight;

    var left = 0;
    var top = 0;
    var width = containerWidth - draggableWidth;
    var height = containerHeight - draggableHeight;
    var rect = new OdoHelpers.Rect(left, top, width, height);

    // Set a boundary for the draggable so that it won't be thrown outside of its parent.
    throwable.setLimits(rect);
  }

  setThrowableLimits();

  var freescroll = new OdoDraggable(document.getElementById('draggable-carousel'), {
    axis: 'x',
    isThrowable: true
  });

  // Do something when the throw settles.
  freescroll.on(OdoDraggable.EventType.SETTLE, function () {
    console.log('Settled');
  });

  function setFreescrollLimits() {
    var element = freescroll.element;

    var parent = element.parentNode;
    var draggableWidth = element.offsetWidth;
    var containerWidth = parent.offsetWidth;

    var left = -draggableWidth + containerWidth;
    var top = 0;
    var width = -left;
    var height = 0;
    var rect = new OdoHelpers.Rect(left, top, width, height);

    // Set a boundary for the draggable so that it won't be thrown outside of its parent.
    freescroll.setLimits(rect);
  }

  setFreescrollLimits();

  x.on(OdoDraggable.EventType.END, function (pointerEvent) {
    console.log('Finished drag:', pointerEvent);
  });

  {
    var addLimits = function addLimits() {
      var draggableWidth = x.element.offsetWidth;
      var containerWidth = container.offsetWidth;

      var left = (containerWidth - draggableWidth) / -2;
      var top = 0;
      var width = containerWidth - draggableWidth;
      var height = 0;
      var rect = new OdoHelpers.Rect(left, top, width, height);
      x.setLimits(rect);
      limitToggle.classList.remove('limitless');
      hasLimits = true;
    };

    var removeLimits = function removeLimits() {
      var rect = new OdoHelpers.Rect(NaN, NaN, NaN, NaN);
      x.setLimits(rect);
      limitToggle.classList.add('limitless');
      hasLimits = false;
    };

    var limitToggle = select('#limit-toggle');
    var container = select('.container');
    var hasLimits = false;

    limitToggle.addEventListener('click', function () {
      if (hasLimits) {
        removeLimits();
      } else {
        addLimits();
      }
    });

    // Update limits on resize.
    window.addEventListener('resize', function () {
      if (hasLimits) {
        addLimits();
      }

      setThrowableLimits();
      setFreescrollLimits();
    });
  }

  {
    var update = function update() {
      freescroll.options = current;
    };

    var toDefaults = function toDefaults() {
      current.throwFriction = OdoDraggable.Defaults.throwFriction;
      current.amplifier = OdoDraggable.Defaults.amplifier;
      current.velocityStop = OdoDraggable.Defaults.velocityStop;
      select('#throw-friction').value = current.throwFriction;
      select('#amplifier').value = current.amplifier;
      select('#velocity-stop').value = current.velocityStop;
      update();
    };

    var current = Object.assign({}, freescroll.options);

    select('#throw-friction').addEventListener('change', function listener() {
      current.throwFriction = this.value;
      update();
    });

    select('#amplifier').addEventListener('change', function listener() {
      current.amplifier = this.value;
      update();
    });

    select('#velocity-stop').addEventListener('change', function listener() {
      current.velocityStop = this.value;
      update();
    });

    select('#back-to-defaults').addEventListener('click', toDefaults);
  }

}());
