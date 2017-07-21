export default {

  /**
   * Event types emitted by the carousel.
   * @enum {string}
   */
  EventType: {
    WILL_NAVIGATE: 'odocarousel:willnavigate',
    SLIDE_START: 'odocarousel:slidestart',
    SLIDE_END: 'odocarousel:slideend',
  },

  /** @enum {string} */
  Classes: {
    BASE: 'odo-carousel',
    FADE: 'odo-carousel--fade',
    VERTICAL: 'odo-carousel--vertical',
    WRAPPER: 'odo-carousel__wrapper',
    CAROUSEL_ELEMENT: 'odo-carousel__element',

    SLIDE: 'odo-carousel__slide',
    ACTIVE_SLIDE: 'odo-carousel__slide--active',
    PREVIOUS_SLIDE: 'odo-carousel__slide--previous',
    PAST_SLIDE: 'odo-carousel__slide--past',
    NEXT_SLIDE: 'odo-carousel__slide--next',
    FUTURE_SLIDE: 'odo-carousel__slide--future',

    VISIBLE: 'odo-carousel__slide--visible',
    BEHIND: 'odo-carousel__slide--behind',

    PAGINATION: 'odo-carousel__pagination',
    PAGINATION_DOT: 'odo-carousel__pagination-dot',
    PAGINATION_DOT_SELECTED: 'is-selected',

    PADDLES: 'odo-carousel__nav-paddles',
    PADDLE: 'odo-carousel__nav-paddle',
    PADDLE_NEXT: 'odo-carousel__nav-next',
    PADDLE_PREV: 'odo-carousel__nav-prev',
    PADDLE_DISABLED: 'is-disabled',

    SLIDE_CHILD: 'odo-carousel__slide-child',
  },

  Defaults: {
    startIndex: 0,
    isVertical: false,
    isLooped: false,
    isJumped: false,
    isFade: false,
    isCentered: false,
    neighborCount: 1,
    slideshowSpeed: 1000,
    animationSpeed: 400,
    crossfadeAmount: 0.875,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    pagination: false,
    getNavPaddleHtml: null,
    getPaginationHtml: null,
    template: {
      paddles: '<nav class="odo-carousel__nav-paddles">{{ prev }}{{ next }}</nav>',
      paddleNext: '<a href="javascript:void(0)" role="button" aria-label="next slide" class="odo-carousel__nav-paddle odo-carousel__nav-next">{{ paddleInner }}</a>',
      paddlePrev: '<a href="javascript:void(0)" role="button" aria-label="previous slide" class="odo-carousel__nav-paddle odo-carousel__nav-prev">{{ paddleInner }}</a>',
      paddleNextInner: '<svg viewBox="75.4 27 461.2 738"><path d="M167.7 27l368.9 369-368.9 369-92.3-92.3 276.7-276.7-276.7-276.7z"/></svg>',
      paddlePrevInner: '<svg viewBox="75.396 26.994 461.208 738.012"><path d="M444.336 765.006l-368.94-369.006 368.94-369.006 92.268 92.268-276.738 276.738 276.738 276.738z"/></svg>',
      pagination: '<nav class="odo-carousel__pagination" role="tablist">{{ dots }}</nav>',
      paginationDot: '<a href="javascript:void(0)" role="tab" aria-label="Go to slide {{ index1 }}" aria-controls="{{ slideId }}" aria-selected="false" class="odo-carousel__pagination-dot" data-index="{{ index }}"></a>',
      paginationDotSecondary: '<a href="javascript:void(0)" role="tab" aria-label="Go to slide {{ index1 }}" aria-controls="{{ slideId }}" aria-selected="false" class="odo-carousel__pagination-dot" data-index="{{ index }}" data-secondary-index="{{ secondaryIndex }}" aria-hidden="{{ hidden }}"></a>',
    },
  },

  TRANSITION_END_WAIT: 32,
};
