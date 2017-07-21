const OdoHelpers = window.OdoHelpers;
const OdoDraggable = window.OdoDraggable;

const x = new OdoDraggable(document.getElementById('draggable-x'), {
  axis: 'x',
});

const y = new OdoDraggable(document.getElementById('draggable-y'), {
  axis: 'y',
});

const xy = new OdoDraggable(document.getElementById('draggable-xy'), {
  axis: 'xy',
});

const throwable = new OdoDraggable(document.getElementById('draggable-throw-me'), {
  axis: 'xy',
  isThrowable: true,
});

window.x = x;
window.y = y;
window.xy = xy;
window.throwable = throwable;

const select = selector => document.querySelector(selector);

function setThrowableLimits() {
  const element = throwable.element;
  const parent = element.parentNode;
  const draggableWidth = element.offsetWidth;
  const draggableHeight = element.offsetHeight;
  const containerWidth = parent.offsetWidth;
  const containerHeight = parent.offsetHeight;

  const left = 0;
  const top = 0;
  const width = containerWidth - draggableWidth;
  const height = containerHeight - draggableHeight;
  const rect = new OdoHelpers.math.Rect(left, top, width, height);

  // Set a boundary for the draggable so that it won't be thrown outside of its parent.
  throwable.setLimits(rect);
}

setThrowableLimits();

const freescroll = new OdoDraggable(document.getElementById('draggable-carousel'), {
  axis: 'x',
  isThrowable: true,
});

// Do something when the throw settles.
freescroll.on(OdoDraggable.EventType.SETTLE, () => {
  console.log('Settled');
});

function setFreescrollLimits() {
  const element = freescroll.element;
  const parent = element.parentNode;
  const draggableWidth = element.offsetWidth;
  const containerWidth = parent.offsetWidth;

  const left = -draggableWidth + containerWidth;
  const top = 0;
  const width = -left;
  const height = 0;
  const rect = new OdoHelpers.math.Rect(left, top, width, height);

  // Set a boundary for the draggable so that it won't be thrown outside of its parent.
  freescroll.setLimits(rect);
}

setFreescrollLimits();

x.on(OdoDraggable.EventType.END, (pointerEvent) => {
  console.log('Finished drag:', pointerEvent);
});

(function () {
  const math = OdoHelpers.math;
  const limitToggle = select('#limit-toggle');
  const container = select('.container');
  let hasLimits = false;

  function addLimits() {
    const draggableWidth = x.element.offsetWidth;
    const containerWidth = container.offsetWidth;

    const left = (containerWidth - draggableWidth) / -2;
    const top = 0;
    const width = containerWidth - draggableWidth;
    const height = 0;
    const rect = new math.Rect(left, top, width, height);
    x.setLimits(rect);
    limitToggle.classList.remove('limitless');
    hasLimits = true;
  }

  function removeLimits() {
    const rect = new math.Rect(NaN, NaN, NaN, NaN);
    x.setLimits(rect);
    limitToggle.classList.add('limitless');
    hasLimits = false;
  }

  limitToggle.addEventListener('click', () => {
    if (hasLimits) {
      removeLimits();
    } else {
      addLimits();
    }
  });

  // Update limits on resize.
  window.addEventListener('resize', () => {
    if (hasLimits) {
      addLimits();
    }

    setThrowableLimits();
    setFreescrollLimits();
  });
}());

(function () {
  const Defaults = OdoDraggable.Defaults;
  const current = Object.assign({}, freescroll.options);

  function update() {
    freescroll.options = current;
  }

  function toDefaults() {
    current.throwFriction = Defaults.throwFriction;
    current.amplifier = Defaults.amplifier;
    current.velocityStop = Defaults.velocityStop;
    select('#throw-friction').value = current.throwFriction;
    select('#amplifier').value = current.amplifier;
    select('#velocity-stop').value = current.velocityStop;
    update();
  }

  select('#throw-friction').addEventListener('change', function () {
    current.throwFriction = this.value;
    update();
  });

  select('#amplifier').addEventListener('change', function () {
    current.amplifier = this.value;
    update();
  });

  select('#velocity-stop').addEventListener('change', function () {
    current.velocityStop = this.value;
    update();
  });

  select('#back-to-defaults').addEventListener('click', toDefaults);
}());
