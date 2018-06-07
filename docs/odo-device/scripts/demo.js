(function () {
  'use strict';

  var Device = window.OdoDevice;
  console.log(Device);

  function quote(result) {
    if (typeof result === 'string') {
      return '\'' + result + '\'';
    }

    return result;
  }

  function setText(id, text) {
    document.getElementById(id).textContent = text;
  }

  setText('has-transitions', Device.HAS_TRANSITIONS);
  setText('has-animations', Device.HAS_CSS_ANIMATIONS);
  setText('has-transforms', Device.HAS_TRANSFORMS);
  setText('can-transition-transforms', Device.CAN_TRANSITION_TRANSFORMS);
  setText('has-touch-events', Device.HAS_TOUCH_EVENTS);
  setText('has-pointer-events', Device.HAS_POINTER_EVENTS);
  setText('has-local-storage', Device.HAS_LOCAL_STORAGE);
  setText('has-passive-listeners', Device.HAS_PASSIVE_LISTENERS);

  setText('dom-animation', quote(Device.Dom.ANIMATION));
  setText('dom-animationDuration', quote(Device.Dom.ANIMATION_DURATION));
  setText('dom-transform', quote(Device.Dom.TRANSFORM));
  setText('dom-transition', quote(Device.Dom.TRANSITION));
  setText('dom-transitionProperty', quote(Device.Dom.TRANSITION_PROPERTY));
  setText('dom-transitionDuration', quote(Device.Dom.TRANSITION_DURATION));
  setText('dom-transitionTimingFunction', quote(Device.Dom.TRANSITION_TIMING_FUNCTION));
  setText('dom-transitionDelay', quote(Device.Dom.TRANSITION_DELAY));

  setText('css-animation', Device.Css.ANIMATION);
  setText('css-animationDuration', Device.Css.ANIMATION_DURATION);
  setText('css-transform', Device.Css.TRANSFORM);
  setText('css-transition', Device.Css.TRANSITION);
  setText('css-transitionProperty', Device.Css.TRANSITION_PROPERTY);
  setText('css-transitionDuration', Device.Css.TRANSITION_DURATION);
  setText('css-transitionTimingFunction', Device.Css.TRANSITION_TIMING_FUNCTION);
  setText('css-transitionDelay', Device.Css.TRANSITION_DELAY);

}());
