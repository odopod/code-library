(function () {
  'use strict';

  var OdoCarousel = window.OdoCarousel;

  var regular = new OdoCarousel(document.getElementById('regular'));

  regular.on(OdoCarousel.EventType.SLIDE_END, function (evt) {
    console.log(evt); // eslint-disable-line no-console
  });

  var looped = new OdoCarousel(document.getElementById('looped'), {
    isLooped: true
  });

  var enabled = true;
  document.getElementById('enabler').addEventListener('click', function () {
    if (enabled) {
      looped.isEnabled = false;
      document.getElementById('enabler').textContent = 'Enable';
    } else {
      looped.isEnabled = true;
      document.getElementById('enabler').textContent = 'Disable';
    }

    enabled = !enabled;
  });

  var jumped = new OdoCarousel(document.getElementById('jumped'), {
    isLooped: true,
    isJumped: true,
    pagination: true,
    easing: 'ease'
  });

  var vertical = new OdoCarousel(document.getElementById('vertical'), {
    isVertical: true,
    isLooped: true,
    animationSpeed: 500,
    pagination: true,
    template: {
      paddleNextInner: '<svg viewBox="0 0 24 24"><path d="M7.4 8.3L6 9.7l6 6 6-6-1.4-1.4-4.6 4.6z"></path></svg>',
      paddlePrevInner: '<svg viewBox="0 0 24 24"><path d="M16.6 15.7l1.4-1.4-6-6-6 6 1.4 1.4 4.6-4.6 4.6 4.6z"/></svg>'
    },
    getNavPaddleHtml: function getNavPaddleHtml() {
      return '';
    },
    getPaginationHtml: function getPaginationHtml(instance) {
      var totalSlides = instance.getSlides().length;

      var previousPaddle = OdoCarousel.template(instance.options.template.paddlePrev, {
        paddleInner: instance.options.template.paddlePrevInner
      });
      var nextPaddle = OdoCarousel.template(instance.options.template.paddleNext, {
        paddleInner: instance.options.template.paddleNextInner
      });

      var dotsHtml = '';
      for (var i = 0; i < totalSlides; i++) {
        dotsHtml += OdoCarousel.template(instance.options.template.paginationDot, {
          index: i,
          index1: i + 1,
          slideId: instance.getSlide(i).id
        });
      }

      var open = '<nav role="tablist" class="' + OdoCarousel.Classes.PAGINATION + ' ' + OdoCarousel.Classes.PADDLES + '">';
      var close = '</nav>';

      return open + previousPaddle + dotsHtml + nextPaddle + close;
    }
  });

  var neighbors = new OdoCarousel(document.getElementById('neighbors'), {
    isLooped: true,
    neighborCount: 4
  });

  var centered = new OdoCarousel(document.getElementById('centered-demo'), {
    isCentered: true
  });

  var bidirectional = new OdoCarousel(document.getElementById('bidirectional'), {
    isLooped: true,
    pagination: true
  });

  var slideshow = new OdoCarousel(document.getElementById('slideshow'), {
    slideshowSpeed: 1500,
    animationSpeed: 600
  });

  var slideChildren = new OdoCarousel(document.getElementById('slide-children'), {
    startIndex: 1,
    template: {
      paddleNextInner: '<div style="width:100%;height:100%;background-color:rgba(0, 0, 0, 0.5);border-radius:50%;"></div>',
      paddlePrevInner: '<div style="width:100%;height:100%;background-color:rgba(0, 0, 0, 0.5);border-radius:50%;"></div>'
    }
  });

  var slideChildrenVertical = new OdoCarousel(document.getElementById('slide-children-vertical'), {
    isVertical: true
  });

  // Slideshow buttons.
  document.querySelector('#pause').addEventListener('click', function () {
    slideshow.pauseSlideshow();
  });

  document.querySelector('#play').addEventListener('click', function () {
    slideshow.startSlideshow();
  });

  var darthFader = new OdoCarousel(document.getElementById('darth-fader'), {
    isFade: true,
    isLooped: true
  });

  window.regular = regular;
  window.looped = looped;
  window.jumped = jumped;
  window.vertical = vertical;
  window.neighbors = neighbors;
  window.centered = centered;
  window.bidirectional = bidirectional;
  window.slideChildren = slideChildren;
  window.slideChildrenVertical = slideChildrenVertical;
  window.darthFader = darthFader;

}());
