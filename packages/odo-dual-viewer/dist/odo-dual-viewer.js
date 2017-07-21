(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('tiny-emitter'), require('@odopod/odo-helpers'), require('@odopod/odo-draggable'), require('@odopod/odo-window-events'), require('@odopod/odo-object-fit')) :
	typeof define === 'function' && define.amd ? define(['tiny-emitter', '@odopod/odo-helpers', '@odopod/odo-draggable', '@odopod/odo-window-events', '@odopod/odo-object-fit'], factory) :
	(global.OdoDualViewer = factory(global.TinyEmitter,global.OdoHelpers,global.OdoDraggable,global.OdoWindowEvents,global.OdoObjectFit));
}(this, (function (TinyEmitter,_odopod_odoHelpers,OdoDraggable,OdoWindowEvents,OdoObjectFit) { 'use strict';

TinyEmitter = TinyEmitter && TinyEmitter.hasOwnProperty('default') ? TinyEmitter['default'] : TinyEmitter;
OdoDraggable = OdoDraggable && OdoDraggable.hasOwnProperty('default') ? OdoDraggable['default'] : OdoDraggable;
OdoWindowEvents = OdoWindowEvents && OdoWindowEvents.hasOwnProperty('default') ? OdoWindowEvents['default'] : OdoWindowEvents;
OdoObjectFit = OdoObjectFit && OdoObjectFit.hasOwnProperty('default') ? OdoObjectFit['default'] : OdoObjectFit;

var settings = {
  Position: {
    START: 0,
    CENTER: 1,
    END: 2,
    BETWEEN: 3
  },

  ClassName: {
    VERTICAL: 'odo-dual-viewer--vertical',
    INNER: 'odo-dual-viewer__inner',
    SCRUBBER_CONTAINER: 'odo-dual-viewer__scrubber-bounds',
    SCRUBBER: 'odo-dual-viewer__scrubber',
    OVERLAY: 'odo-dual-viewer__overlay',
    UNDERLAY: 'odo-dual-viewer__underlay',
    MEDIA: 'odo-dual-viewer__media',

    // States
    GRABBING: 'grabbing',
    CENTERED: 'is-centered',
    START: 'is-start',
    END: 'is-end'
  },

  EventType: {
    CAME_TO_REST: 'ododualviewer:handlecametorest'
  },

  Defaults: {
    startPosition: 0.5,
    isVertical: false,
    animationDuration: 300,
    verticalSafeZone: 0.1,
    hasZones: true,
    zones: [0.33, 0.33, 0.66, 0.66]
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var DualViewer = function (_TinyEmitter) {
  inherits(DualViewer, _TinyEmitter);

  /**
   * Component which has a draggable element in the middle which reveals one or
   * the other sides as the user drags.
   *
   * @constructor
   */
  function DualViewer(el, opts) {
    classCallCheck(this, DualViewer);

    var _this = possibleConstructorReturn(this, _TinyEmitter.call(this));

    _this.element = el;

    _this.options = Object.assign({}, DualViewer.Defaults, opts);

    _this._isVertical = _this.options.isVertical;

    /** @private {Element} */
    _this._scrubberEl = null;

    /** @private {Element} */
    _this._overlayEl = null;

    /** @private {Element} */
    _this._underlayEl = null;

    /** @private {Element} */
    _this._overlayObjectEl = null;

    /**
     * Dragger component
     * @type {OdoDraggable}
     * @private
     */
    _this._draggable = null;

    /**
     * Boundary for the scrubber.
     * @type {Rect}
     * @private
     */
    _this._scrubberLimits = null;

    /**
     * The axis to drag depends on the carousel direction.
     * @type {OdoPointer.Axis}
     * @private
     */
    _this._dragAxis = _this._isVertical ? 'y' : 'x';

    /**
     * Height or width.
     * @type {string}
     * @private
     */
    _this._dimensionAttr = _this._isVertical ? 'height' : 'width';

    /**
     * Previous percentage revealed. Needed for window resizes to reset back to
     * correct position.
     * @type {number}
     * @private
     */
    _this._previousPercent = _this.options.startPosition;

    /**
     * Current position of the dual viewer.
     * @type {number}
     * @private
     */
    _this._position = DualViewer.Position.CENTER;

    /** @private {boolean} */
    _this._isResting = true;

    _this.decorate();
    return _this;
  }

  /**
   * Scope the query to the main element.
   * @param {string} className Class name of the desired element.
   * @return {?Element} The element or null if not found.
   */


  DualViewer.prototype.getElementByClass = function getElementByClass(className) {
    return this.element.querySelector('.' + className);
  };

  /**
   * Scope the query to the main element.
   * @param {string} className Class name of the desired elements.
   * @return {NodeList} An array like object of elements.
   */


  DualViewer.prototype.getElementsByClass = function getElementsByClass(className) {
    return this.element.querySelectorAll('.' + className);
  };

  DualViewer.prototype.decorate = function decorate() {
    this._scrubberEl = this.getElementByClass(DualViewer.ClassName.SCRUBBER);
    this._overlayEl = this.getElementByClass(DualViewer.ClassName.OVERLAY);
    this._underlayEl = this.getElementByClass(DualViewer.ClassName.UNDERLAY);

    this._overlayObjectEl = this._overlayEl.firstElementChild;

    this._draggable = new OdoDraggable(this._scrubberEl, {
      axis: this._dragAxis
    });

    // Add vertical class if it's vertical and the is-centered class.
    this.element.classList.toggle(DualViewer.ClassName.VERTICAL, this._isVertical);
    this.element.classList.add(DualViewer.ClassName.CENTERED);

    this._setupHandlers();

    this._saveContainerSize();
    this._saveScrubberLimits();

    OdoObjectFit.cover(this.getElementsByClass(DualViewer.ClassName.MEDIA));

    this._draggable.setLimits(this._scrubberLimits);

    this.setPosition(this.options.startPosition);
  };

  DualViewer.prototype._setupHandlers = function _setupHandlers() {
    this._resizeId = OdoWindowEvents.onResize(this.reset.bind(this));
    this._onMove = this._handleDragMove.bind(this);
    this._onEnd = this._handleDragEnd.bind(this);

    this._draggable.on(OdoDraggable.EventType.MOVE, this._onMove);
    this._draggable.on(OdoDraggable.EventType.END, this._onEnd);
  };

  /**
   * Sets the containing box for the scrubber to stay within.
   * @private
   */


  DualViewer.prototype._saveScrubberLimits = function _saveScrubberLimits() {
    var limits = void 0;

    if (this._isVertical) {
      var top = this._containerHeight * this.options.verticalSafeZone;
      var height = this._containerHeight * (1 - this.options.verticalSafeZone * 2);
      limits = new _odopod_odoHelpers.math.Rect(0, top, this._containerWidth, height);
    } else {
      var containingEl = this.getElementByClass(DualViewer.ClassName.SCRUBBER_CONTAINER);
      var mainRect = this.element.getBoundingClientRect();
      var containingRect = containingEl.getBoundingClientRect();

      limits = new _odopod_odoHelpers.math.Rect(Math.round(containingRect.left - mainRect.left), containingEl.offsetTop, containingEl.offsetWidth, this._containerHeight);
    }

    this._scrubberLimits = limits;
  };

  /**
   * Returns the dual viewer's current position.
   * @return {number} Position number. Look at the DualViewer.
   *   Position enum for reference.
   */


  DualViewer.prototype.getPosition = function getPosition() {
    return this._position;
  };

  /**
   * Set the position of the scrubber and the amount revealed.
   * @param {number} position Percentage to be revealed. A number between zero and one.
   */


  DualViewer.prototype.setPosition = function setPosition(position) {
    // Draggable clamps this based on the axis.
    this._draggable.setPosition(position * 100, position * 100);
    this._reveal(position);
  };

  /**
   * Clamps a percentage value to the boundaries of the scrubber.
   * @param  {number} percent Number between zero and one.
   * @return {number} Clamped percentage between the left and right boundaries if
   *     the dual viewer is horizontal, or the top and bottom boundaries if the
   *     dual viewer is vertical.
   * @private
   */


  DualViewer.prototype._getLimitedPercent = function _getLimitedPercent(percent) {
    var rect = this._scrubberLimits;
    var min = void 0;
    var max = void 0;

    if (this._isVertical) {
      min = rect.top / this._containerHeight;
      max = (rect.top + rect.height) / this._containerHeight;
    } else {
      min = rect.left / this._containerWidth;
      max = (rect.left + rect.width) / this._containerWidth;
    }

    return _odopod_odoHelpers.math.clamp(percent, min, max);
  };

  /**
   * Caches the main element's dimensions.
   * @private
   */


  DualViewer.prototype._saveContainerSize = function _saveContainerSize() {
    this._containerWidth = this.element.offsetWidth;
    this._containerHeight = this.element.offsetHeight;
  };

  /**
   * Toggle state classes.
   * @private
   */


  DualViewer.prototype._removeStateClasses = function _removeStateClasses() {
    this.element.classList.remove(DualViewer.ClassName.START, DualViewer.ClassName.END, DualViewer.ClassName.CENTERED);

    this._isResting = false;
  };

  /**
   * Reveals or covers up the second object.
   * @param {number} percent Number between zero and one.
   * @private
   */


  DualViewer.prototype._reveal = function _reveal(percent) {
    this._overlayEl.style[this._dimensionAttr] = percent * 100 + '%';
    this._overlayObjectEl.style[this._dimensionAttr] = 100 / percent + '%';
  };

  /**
   * Resets the scrubber position, scrubber limits, draggable position, and amount
   * revealed based new width/height measurements and the previous position of the
   * scrubber.
   */


  DualViewer.prototype.reset = function reset() {
    this._saveContainerSize();
    this._saveScrubberLimits();

    OdoObjectFit.cover(this.getElementsByClass(DualViewer.ClassName.MEDIA));

    this._draggable.setLimits(this._scrubberLimits);

    var percent = this._previousPercent * 100;
    this._draggable.setPosition(percent, percent);

    this._reveal(this._getLimitedPercent(this._previousPercent));
  };

  /**
   * Dragged.
   * @param {Event} evt Custom event object.
   * @private
   */


  DualViewer.prototype._handleDragMove = function _handleDragMove(evt) {
    if (this._isResting) {
      this._removeStateClasses();
      this._position = DualViewer.Position.BETWEEN;
    }

    var percentRevealed = evt.position.percent[this._dragAxis] / 100;

    // Save value because if the window is resized, the scrubber will be way off.
    this._previousPercent = percentRevealed;

    this._reveal(percentRevealed);
  };

  /**
   * Dragging ended.
   *
   * Default zones shown below.
   * L = lower zone.
   * M = middle zone.
   * U = upper zone.
   *
   * +-------------------------------------+
   * |          |   |       |   |          |
   * |          |   |       |   |          |
   * |    L     |   |   M   |   |     U    |
   * |          |   |       |   |          |
   * |          |   |       |   |          |
   * +-------------------------------------+
   *         |          |         |
   *        0.25       0.5       0.75
   *
   * @param {Event} evt Custom event object.
   * @private
   */


  DualViewer.prototype._handleDragEnd = function _handleDragEnd(evt) {
    if (!this.options.hasZones) {
      return;
    }

    // Percentage revealed.
    var revealed = evt.position.percent[this._dragAxis] / 100;
    this._position = this._getZone(revealed);

    var percent = null;
    switch (this._position) {
      case DualViewer.Position.START:
        percent = 0;
        break;
      case DualViewer.Position.CENTER:
        percent = 0.5;
        break;
      case DualViewer.Position.END:
        percent = 1;
        break;
      // no default
    }

    if (percent !== null) {
      this.animateTo(percent);
    }
  };

  DualViewer.prototype._getZone = function _getZone(revealed) {
    if (revealed > 0 && revealed < this.options.zones[0]) {
      return DualViewer.Position.START;
    }

    if (revealed < 1 && revealed > this.options.zones[3]) {
      return DualViewer.Position.END;
    }

    if (revealed >= this.options.zones[1] && revealed <= this.options.zones[2]) {
      return DualViewer.Position.CENTER;
    }

    return DualViewer.Position.BETWEEN;
  };

  /**
   * Animate the dual viewer to a percentage.
   * @param {number} toPercent Percent to animate to. It will get clamped to the
   *     scrubber's limits. This is a number between zero and one.
   */


  DualViewer.prototype.animateTo = function animateTo(toPercent) {
    // Clamp to boundaries.
    var percent = this._getLimitedPercent(toPercent);

    // Don't animate if the handle isn't going anywhere.
    if (percent === this._previousPercent) {
      return;
    }

    this._position = this._getZone(percent);

    this._removeStateClasses();

    var stepper = new _odopod_odoHelpers.animation.Stepper({
      start: this._previousPercent,
      end: percent,
      duration: this.options.animationDuration,
      step: this._animateStep,
      context: this
    });

    stepper.onfinish = this._didComeToRest;
  };

  /**
   * The tick function. Sets the handle and revealer.
   * @param {number} position Applied percentage added to the starting point.
   * @private
   */


  DualViewer.prototype._animateStep = function _animateStep(position) {
    // Move handle.
    this._draggable.setPosition(position * 100, position * 100);

    // Move reveals.
    this._reveal(position);
  };

  /**
   * Dual Viewer animation came to rest. Toggle classes and states.
   * @private
   */


  DualViewer.prototype._didComeToRest = function _didComeToRest() {
    this._previousPercent = this._draggable.getPosition(true)[this._dragAxis] / 100;
    this._isResting = true;

    this.element.classList.toggle(DualViewer.ClassName.START, this._position === DualViewer.Position.START);
    this.element.classList.toggle(DualViewer.ClassName.END, this._position === DualViewer.Position.END);
    this.element.classList.toggle(DualViewer.ClassName.CENTERED, this._position === DualViewer.Position.CENTER);

    // Emit event.
    this.emit(DualViewer.EventType.CAME_TO_REST, {
      position: this.getPosition()
    });
  };

  /**
   * Reset the style attribute for the properties we might have manipulated.
   */


  DualViewer.prototype.dispose = function dispose() {
    OdoWindowEvents.remove(this._resizeId);

    this._draggable.off(OdoDraggable.EventType.MOVE, this._onMove);
    this._draggable.off(OdoDraggable.EventType.END, this._onEnd);

    this._draggable.dispose();

    this.element.classList.remove(DualViewer.ClassName.CENTERED, DualViewer.ClassName.VERTICAL);

    this.element = null;
    this._scrubberEl = null;
    this._overlayObjectEl = null;
    this._overlayEl = null;
    this._underlayEl = null;
  };

  return DualViewer;
}(TinyEmitter);

Object.assign(DualViewer, settings);

return DualViewer;

})));
//# sourceMappingURL=odo-dual-viewer.js.map
