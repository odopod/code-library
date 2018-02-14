(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@odopod/odo-helpers'), require('@odopod/odo-window-events')) :
	typeof define === 'function' && define.amd ? define(['exports', '@odopod/odo-helpers', '@odopod/odo-window-events'], factory) :
	(factory((global.OdoExpandable = {}),global.OdoHelpers,global.OdoWindowEvents));
}(this, (function (exports,odoHelpers,OdoWindowEvents) { 'use strict';

OdoWindowEvents = OdoWindowEvents && OdoWindowEvents.hasOwnProperty('default') ? OdoWindowEvents['default'] : OdoWindowEvents;

var Settings = {
  ClassName: {
    TRIGGER_OPEN: 'odo-expandable__trigger--open',
    TARGET_OPEN: 'odo-expandable__target--open'
  },
  Attribute: {
    TRIGGER: 'data-expandable-trigger',
    TARGET: 'data-expandable-target',
    GROUP: 'data-expandable-group'
  },
  Defaults: {
    groupedItem: false
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









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

/**
 * @fileoverview An basic, expandable component that has both a trigger
 * and a target to open.
 *
 * @author Matt Zaso
 */
var ExpandableItem = function () {
  function ExpandableItem(id) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, ExpandableItem);

    /** @type {string} */
    this.id = id;

    /**
     * Override any defaults with the given options.
     * @type {Object}
     */
    this.options = Object.assign({}, Settings.Defaults, options);

    /** @type {Element} */
    this.trigger = document.body.querySelector('[' + Settings.Attribute.TRIGGER + '="' + id + '"]');

    /** @type {Element} */
    this.target = document.body.querySelector('[' + Settings.Attribute.TARGET + '="' + id + '"]');

    this._setA11yAttributes();

    if (!this.options.groupedItem) {
      this._onTriggerClick = this._triggerClickHandler.bind(this);
      document.body.addEventListener('click', this._onTriggerClick);
    }
  }

  /**
   * Handler for clicks on the trigger.
   * @param {Event} evt Event object.
   * @private
   */


  ExpandableItem.prototype._triggerClickHandler = function _triggerClickHandler(evt) {
    evt.preventDefault();
    var closest = evt.target.closest('[' + Settings.Attribute.TRIGGER + ']');

    if (closest === this.trigger) {
      this.toggle();
    }
  };

  /**
   * Sets the appropriate ARIA attributes for a11y.
   * @private
   */


  ExpandableItem.prototype._setA11yAttributes = function _setA11yAttributes() {
    var elementId = 'expandable-' + this.id;

    this.trigger.setAttribute('aria-describedby', elementId);
    this.target.setAttribute('id', elementId);
    this.trigger.setAttribute('aria-expanded', this.isOpen.toString());
    this.trigger.setAttribute('aria-controls', elementId);
    this.target.setAttribute('aria-labelledby', elementId);
    this.target.setAttribute('aria-hidden', (!this.isOpen).toString());
  };

  /**
   * Removes the ARIA attributes assigned on instantiation.
   * @private
   */


  ExpandableItem.prototype._removeA11yAttributes = function _removeA11yAttributes() {
    this.trigger.removeAttribute('aria-describedby');
    this.target.removeAttribute('id');
    this.trigger.removeAttribute('aria-expanded');
    this.target.removeAttribute('aria-labelledby');
    this.target.removeAttribute('aria-hidden');
  };

  /**
   * Toggles the expandable's state (open/closed).
   */


  ExpandableItem.prototype.toggle = function toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  };

  /**
   * Opens the expandable.
   */


  ExpandableItem.prototype.open = function open() {
    this.target.classList.add(Settings.ClassName.TARGET_OPEN);
    this.trigger.classList.add(Settings.ClassName.TRIGGER_OPEN);
    this.trigger.setAttribute('aria-expanded', 'true');
    this.target.setAttribute('aria-hidden', 'false');
  };

  /**
   * Closes the expandable.
   */


  ExpandableItem.prototype.close = function close() {
    this.target.classList.remove(Settings.ClassName.TARGET_OPEN);
    this.trigger.classList.remove(Settings.ClassName.TRIGGER_OPEN);
    this.trigger.setAttribute('aria-expanded', 'false');
    this.target.setAttribute('aria-hidden', 'true');
  };

  /**
   * Dispose this instance and its handlers.
   */
  ExpandableItem.prototype.dispose = function dispose() {
    if (!this.options.groupedItem) {
      document.body.removeEventListener('click', this._onTriggerClick);
    }

    this._removeA11yAttributes();
  };

  createClass(ExpandableItem, [{
    key: 'isOpen',
    get: function get$$1() {
      return this.target.classList.contains(Settings.ClassName.TARGET_OPEN);
    }
  }]);
  return ExpandableItem;
}();

Object.assign(ExpandableItem, Settings);

/**
 * @fileoverview A wrapper for multiple Expandable elements that will
 * allow them to operate coherently in an accordion type fashion.
 *
 * @author Matt Zaso
 */
var ExpandableGroup = function () {
  function ExpandableGroup(elements) {
    classCallCheck(this, ExpandableGroup);

    /** @type {Array.<!Element>} */
    this._elements = elements;

    /**
     * @type {Array.<!ExpandableItem>}
     * @protected
     */
    this.expandables = elements.map(function (trigger) {
      return new ExpandableItem(trigger.getAttribute(Settings.Attribute.TRIGGER), { groupedItem: true });
    });

    this._onClick = this._onClickHandler.bind(this);
    document.body.addEventListener('click', this._onClick);
  }

  /**
   * Handler for clicks on the trigger.
   * @param {MouseEvent} evt Event object.
   * @private
   */


  ExpandableGroup.prototype._onClickHandler = function _onClickHandler(evt) {
    evt.preventDefault();
    var closest = evt.target.closest('[' + Settings.Attribute.TRIGGER + ']');

    if (this._elements.includes(closest)) {
      this.toggleVisibility(closest.getAttribute(Settings.Attribute.TRIGGER));
    }
  };

  /**
   * Will iterate over all grouped items and toggle the selected one while collapsing all others.
   * @param {number} selectedId The ID of the selected target to expand.
   * @private
   */


  ExpandableGroup.prototype.toggleVisibility = function toggleVisibility(selectedId) {
    this.expandables.forEach(function (expandable) {
      if (expandable.id === selectedId) {
        expandable.toggle();
      } else {
        expandable.close();
      }
    });
  };

  /**
   * Dispose this instance and its handlers. Will also dispose all child
   * instances.
   * @public
   */


  ExpandableGroup.prototype.dispose = function dispose() {
    document.body.removeEventListener('click', this._onTriggerClick);
    this.expandables.forEach(function (item) {
      return item.dispose();
    });
  };

  return ExpandableGroup;
}();

Object.assign(ExpandableGroup, Settings);

/**
 * @fileoverview A subclass of ExpandableGroup which includes some additional
 * features like scrolling and collapsing animations.
 *
 * @author Matt Zaso
 */
var ExpandableAccordion = function (_ExpandableGroup) {
  inherits(ExpandableAccordion, _ExpandableGroup);

  function ExpandableAccordion(elements) {
    classCallCheck(this, ExpandableAccordion);

    /**
     * @type {{item: number, offset: number}} Object A map of the expandable offsets.
     */
    var _this = possibleConstructorReturn(this, _ExpandableGroup.call(this, elements));

    _this._expandableOffsets = null;

    _this._saveOffsets();

    // Set the initial value of each element based on its state.
    _this.expandables.forEach(function (item) {
      return _this._setHeight(item, item.isOpen);
    });

    // A resize handler for when the DOM updates.
    _this._resizeId = OdoWindowEvents.onResize(_this._handleResize.bind(_this));
    return _this;
  }

  /**
   * Called by OdoWindowEvents when the browser is resized. Allows us to update
   * our saved offsets and animate to their new positions.
   *
   * @private
   */


  ExpandableAccordion.prototype._handleResize = function _handleResize() {
    var _this2 = this;

    this._saveOffsets();
    this.expandables.forEach(function (item) {
      return _this2._setHeight(item, item.isOpen);
    });
  };

  /**
   * When an item is clicked, we animate the accordion.
   *
   * @override
   */


  ExpandableAccordion.prototype.toggleVisibility = function toggleVisibility(selectedId) {
    var _this3 = this;

    this._scrollToSelected(selectedId);
    this.expandables.forEach(function (item) {
      return _this3._animateHeight(item, item.id === selectedId);
    });
    _ExpandableGroup.prototype.toggleVisibility.call(this, selectedId);
  };

  /**
   * On load and any other time the DOM updates, this function will save the offsets
   * of each accordion item into an object so we don't have to read the DOM every time.
   *
   * @private
   */


  ExpandableAccordion.prototype._saveOffsets = function _saveOffsets() {
    var scrollY = window.pageYOffset;
    var containerOffset = scrollY + this.expandables[0].trigger.getBoundingClientRect().top;
    this._expandableOffsets = this.expandables.map(function (el, i) {
      var offset = containerOffset + i * el.target.firstElementChild.offsetHeight;
      return { id: el.id, offset: offset };
    });
  };

  /**
   * When called we will check the accordion's position in the viewport and scroll
   * the user into view if needed.
   *
   * @param {number} targetId The id of the ExpandableItem that was clicked.
   * @private
   */


  ExpandableAccordion.prototype._scrollToSelected = function _scrollToSelected(targetId) {
    var viewportTop = window.pageYOffset;
    var viewportBottom = viewportTop + window.innerHeight;
    var item = this._expandableOffsets.find(function (item) {
      return item.id === targetId;
    });
    var itemOffset = item.offset;
    var isOutOfView = itemOffset < viewportTop || itemOffset > viewportBottom;
    if (isOutOfView) {
      odoHelpers.scrollTo(itemOffset, 300);
    }
  };

  /**
   * Sets the height of a given Expandable item.
   *
   * @param {Expandable} expandable The Expandable instance to modify.
   * @param {boolean} setToOpen Whether we setting the Expandable to it's open state.
   */


  ExpandableAccordion.prototype._setHeight = function _setHeight(expandable, setToOpen) {
    var contentHeight = setToOpen ? expandable.target.firstElementChild.offsetHeight : 0;
    expandable.target.style.height = contentHeight + 'px';
  };

  /**
   * Called if we need to alter the Expandable state. Only does so if either the same
   * Expandable that is open is clicked or another one was clicked and this one needs
   * to be closed.
   *
   * @param {Expandable} expandable The expandable to test and potentially alter.
   * @param {boolean} isTarget Whether or not the current expandable was the one clicked.
   */


  ExpandableAccordion.prototype._animateHeight = function _animateHeight(expandable, isTarget) {
    if (isTarget || expandable.isOpen) {
      this._setHeight(expandable, !expandable.isOpen);
    }
  };

  /**
   * Remove the resize handler and dispose.
   *
   * @override
   */


  ExpandableAccordion.prototype.dispose = function dispose() {
    _ExpandableGroup.prototype.dispose.call(this);
    OdoWindowEvents.remove(this._resizeId);
  };

  return ExpandableAccordion;
}(ExpandableGroup);

Object.assign(ExpandableAccordion, Settings);

function initializeAll() {
  var elements = Array.from(document.querySelectorAll('[' + Settings.Attribute.TRIGGER + ']'));

  var single = [];
  var groups = [];
  var groupIds = [];

  elements.forEach(function (item) {
    var groupId = item.getAttribute(Settings.Attribute.GROUP);
    if (groupId) {
      if (!groupIds.includes(groupId)) {
        groups.push(elements.filter(function (el) {
          return el.getAttribute(Settings.Attribute.GROUP) === groupId;
        }));
        groupIds.push(groupId);
      }
    } else {
      single.push(item);
    }
  });

  var singleInstances = single.map(function (trigger) {
    return new ExpandableItem(trigger.getAttribute(Settings.Attribute.TRIGGER));
  });
  var groupInstances = groups.map(function (grouping) {
    if (grouping.some(function (item) {
      return item.hasAttribute('data-expandable-animated');
    })) {
      return new ExpandableAccordion(grouping);
    }
    return new ExpandableGroup(grouping);
  });

  return singleInstances.concat(groupInstances);
}

exports.initializeAll = initializeAll;
exports.Settings = Settings;
exports.ExpandableItem = ExpandableItem;
exports.ExpandableGroup = ExpandableGroup;
exports.ExpandableAccordion = ExpandableAccordion;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=odo-expandable.js.map
