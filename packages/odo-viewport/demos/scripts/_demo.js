const Viewport = window.OdoViewport;

Viewport.add({
  element: document.getElementById('title'),
  threshold: -500,
  enter() {
    this.setAttribute('in-view', true);
  },

  exit() {
    this.removeAttribute('in-view');
  },
});

Viewport.add({
  element: document.getElementById('demo-enter'),
  enter() {
    this.className += ' is-in-view';
  },
});

const enterExitId = Viewport.add({
  element: document.getElementById('demo-enter-exit'),
  threshold: 400,
  enter() {
    this.setAttribute('in-view', true);
  },

  exit() {
    this.removeAttribute('in-view');
  },
});

Viewport.add({
  element: document.getElementById('demo-enter-exit-full'),
  threshold: '25%',
  enter() {
    this.setAttribute('in-view', true);
  },

  exit() {
    this.removeAttribute('in-view');
  },
});

Viewport.add({
  element: document.getElementById('demo-threshold-50'),
  threshold: 50,
  enter() {
    this.setAttribute('in-view', true);
  },

  exit() {
    this.removeAttribute('in-view');
  },
});

Viewport.add({
  element: document.getElementById('demo-threshold-percent'),
  threshold: '50%',
  enter() {
    this.setAttribute('in-view', true);
  },

  exit() {
    this.removeAttribute('in-view');
  },
});

Viewport.add({
  element: document.getElementById('demo-threshold-negative'),
  threshold: -300,
  enter() {
    this.setAttribute('in-view', true);
  },

  exit() {
    this.removeAttribute('in-view');
  },
});

// Make a simple carousel where each slide is a viewport item.
let currentIndex = 0;
const carouselElement = document.querySelector('.fake-carousel__element');
const nextButton = document.querySelector('.fake-carousel__next');
const prevButton = document.querySelector('.fake-carousel__previous');
nextButton.addEventListener('click', () => {
  if (currentIndex === 3) {
    return;
  }

  currentIndex += 1;
  const percent = currentIndex * -5;
  carouselElement.style.transform = 'translateX(' + percent + '%)';
});

prevButton.addEventListener('click', () => {
  if (currentIndex === 0) {
    return;
  }

  currentIndex -= 1;
  const percent = currentIndex * -5;
  carouselElement.style.transform = 'translateX(' + percent + '%)';
});

document.querySelector('.fake-carousel__update').addEventListener('click', () => {
  Viewport.update();
});

const viewportDemosInCarousel = Array.from(document.querySelectorAll('.fake-carousel .viewport-demo-element'));
viewportDemosInCarousel.forEach((element) => {
  Viewport.add({
    element,
    enter() {
      this.setAttribute('in-view', true);
    },

    exit() {
      this.removeAttribute('in-view');
    },
  });
});

// Prism highlighting causes the code blocks to get bigger. After it finishes,
// tell the Viewport that offsets need to be updated.
setTimeout(() => {
  Viewport.update();
  setTimeout(() => {
    Viewport.update();
  }, 1000);
}, 1000);

document.getElementById('ruler-toggle').addEventListener('click', () => {
  document.getElementsByClassName('ruler')[0].classList.toggle('ruler--full');
}, false);
