(function () {
  'use strict';

  var Viewport = window.OdoViewport;

  Viewport.add({
    element: document.getElementById('title'),
    threshold: -500,
    enter: function enter() {
      this.setAttribute('in-view', true);
    },
    exit: function exit() {
      this.removeAttribute('in-view');
    }
  });

  Viewport.add({
    element: document.getElementById('demo-enter'),
    enter: function enter() {
      this.className += ' is-in-view';
    }
  });

  var enterExitId = Viewport.add({
    element: document.getElementById('demo-enter-exit'),
    threshold: 400,
    enter: function enter() {
      this.setAttribute('in-view', true);
    },
    exit: function exit() {
      this.removeAttribute('in-view');
    }
  });

  Viewport.add({
    element: document.getElementById('demo-enter-exit-full'),
    threshold: '25%',
    enter: function enter() {
      this.setAttribute('in-view', true);
    },
    exit: function exit() {
      this.removeAttribute('in-view');
    }
  });

  Viewport.add({
    element: document.getElementById('demo-threshold-50'),
    threshold: 50,
    enter: function enter() {
      this.setAttribute('in-view', true);
    },
    exit: function exit() {
      this.removeAttribute('in-view');
    }
  });

  Viewport.add({
    element: document.getElementById('demo-threshold-percent'),
    threshold: '50%',
    enter: function enter() {
      this.setAttribute('in-view', true);
    },
    exit: function exit() {
      this.removeAttribute('in-view');
    }
  });

  Viewport.add({
    element: document.getElementById('demo-threshold-negative'),
    threshold: -300,
    enter: function enter() {
      this.setAttribute('in-view', true);
    },
    exit: function exit() {
      this.removeAttribute('in-view');
    }
  });

  // Make a simple carousel where each slide is a viewport item.
  var currentIndex = 0;
  var carouselElement = document.querySelector('.fake-carousel__element');
  var nextButton = document.querySelector('.fake-carousel__next');
  var prevButton = document.querySelector('.fake-carousel__previous');
  nextButton.addEventListener('click', function () {
    if (currentIndex === 3) {
      return;
    }

    currentIndex += 1;
    var percent = currentIndex * -5;
    carouselElement.style.transform = 'translateX(' + percent + '%)';
  });

  prevButton.addEventListener('click', function () {
    if (currentIndex === 0) {
      return;
    }

    currentIndex -= 1;
    var percent = currentIndex * -5;
    carouselElement.style.transform = 'translateX(' + percent + '%)';
  });

  document.querySelector('.fake-carousel__update').addEventListener('click', function () {
    Viewport.update();
  });

  var viewportDemosInCarousel = Array.from(document.querySelectorAll('.fake-carousel .viewport-demo-element'));
  viewportDemosInCarousel.forEach(function (element) {
    Viewport.add({
      element: element,
      enter: function enter() {
        this.setAttribute('in-view', true);
      },
      exit: function exit() {
        this.removeAttribute('in-view');
      }
    });
  });

  // Prism highlighting causes the code blocks to get bigger. After it finishes,
  // tell the Viewport that offsets need to be updated.
  setTimeout(function () {
    Viewport.update();
    setTimeout(function () {
      Viewport.update();
    }, 1000);
  }, 1000);

  document.getElementById('ruler-toggle').addEventListener('click', function () {
    document.getElementsByClassName('ruler')[0].classList.toggle('ruler--full');
  }, false);

}());
