(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@odopod/odo-pointer')) :
	typeof define === 'function' && define.amd ? define(['@odopod/odo-pointer'], factory) :
	(global.OdoOnSwipe = factory(global.OdoPointer));
}(this, (function (OdoPointer) { 'use strict';

OdoPointer = OdoPointer && OdoPointer.hasOwnProperty('default') ? OdoPointer['default'] : OdoPointer;

var babelHelpers = {};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









babelHelpers;

var OnSwipe = function () {
  /**
   * Provides a callback for swipe events.
   * @param {Element} element Element to watch for swipes.
   * @param {function(PointerEvent)} fn Callback when swiped.
   * @param {OdoPointer.Axis} [axis] Optional axis. Defaults to 'x'.
   * @constructor
   */
  function OnSwipe(element, fn) {
    var axis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : OdoPointer.Axis.X;
    classCallCheck(this, OnSwipe);

    this.fn = fn;

    this.pointer = new OdoPointer(element, {
      axis: axis
    });

    this._onEnd = this._handlePointerEnd.bind(this);

    this.pointer.on(OdoPointer.EventType.END, this._onEnd);
  }

  /**
   * Received the pointer end event.
   * @param {PointerEvent} pointerEvent Pointer event object.
   */


  OnSwipe.prototype._handlePointerEnd = function _handlePointerEnd(pointerEvent) {
    if (this.pointer.hasVelocity(pointerEvent.velocity)) {
      this.fn(pointerEvent);
    }
  };

  /** Cleanup this component. */


  OnSwipe.prototype.dispose = function dispose() {
    this.pointer.off(OdoPointer.EventType.END, this._onEnd);
    this.pointer.dispose();
    this._onEnd = null;
    this.fn = null;
  };

  return OnSwipe;
}();

return OnSwipe;

})));
//# sourceMappingURL=odo-on-swipe.js.map
