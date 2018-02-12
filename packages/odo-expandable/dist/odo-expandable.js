(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.OdoExpandable = {})));
}(this, (function (exports) { 'use strict';

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
    this._trigger = document.body.querySelector('[' + Settings.Attribute.TRIGGER + '="' + id + '"]');

    /** @type {Element} */
    this._target = document.body.querySelector('[' + Settings.Attribute.TARGET + '="' + id + '"]');

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

    if (closest === this._trigger) {
      this.toggle();
    }
  };

  /**
   * Sets the appropriate ARIA attributes for a11y.
   * @private
   */


  ExpandableItem.prototype._setA11yAttributes = function _setA11yAttributes() {
    var elementId = 'expandable-' + this.id;

    this._trigger.setAttribute('aria-describedby', elementId);
    this._target.setAttribute('id', elementId);
    this._trigger.setAttribute('aria-expanded', this.isOpen.toString());
    this._trigger.setAttribute('aria-controls', elementId);
    this._target.setAttribute('aria-labelledby', elementId);
    this._target.setAttribute('aria-hidden', (!this.isOpen).toString());
  };

  /**
   * Removes the ARIA attributes assigned on instantiation.
   * @private
   */


  ExpandableItem.prototype._removeA11yAttributes = function _removeA11yAttributes() {
    this._trigger.removeAttribute('aria-describedby');
    this._target.removeAttribute('id');
    this._trigger.removeAttribute('aria-expanded');
    this._target.removeAttribute('aria-labelledby');
    this._target.removeAttribute('aria-hidden');
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
    this._target.classList.add(Settings.ClassName.TARGET_OPEN);
    this._trigger.classList.add(Settings.ClassName.TRIGGER_OPEN);
    this._trigger.setAttribute('aria-expanded', 'true');
    this._target.setAttribute('aria-hidden', 'false');
  };

  /**
   * Closes the expandable.
   */


  ExpandableItem.prototype.close = function close() {
    this._target.classList.remove(Settings.ClassName.TARGET_OPEN);
    this._trigger.classList.remove(Settings.ClassName.TRIGGER_OPEN);
    this._trigger.setAttribute('aria-expanded', 'false');
    this._target.setAttribute('aria-hidden', 'true');
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

  /**
   * Instantiates a single instance of the Expandable Item.
   *
   * @param {Element} element Either a trigger or target.
   * @return {ExpandableItem} the instance of the Expandable Item.
   * @public
   */


  ExpandableItem.initialize = function initialize(element) {
    var triggerId = element.getAttribute(Settings.Attribute.TRIGGER);
    var targetId = element.getAttribute(Settings.Attribute.TARGET);
    var id = targetId || triggerId;

    return new ExpandableItem(id);
  };

  createClass(ExpandableItem, [{
    key: 'isOpen',
    get: function get$$1() {
      return this._target.classList.contains(Settings.ClassName.TARGET_OPEN);
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

    /** @type {Array.<!ExpandableItem>} */
    this._expandables = elements.map(function (trigger) {
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
      this._toggleGroupVisibility(closest.getAttribute(Settings.Attribute.TRIGGER));
    }
  };

  /**
   * Will iterate over all grouped items and toggle the selected one while collapsing all others.
   * @param {number} selectedId The ID of the selected target to expand.
   * @private
   */


  ExpandableGroup.prototype._toggleGroupVisibility = function _toggleGroupVisibility(selectedId) {
    this._expandables.forEach(function (expandable) {
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
    this._expandables.forEach(function (item) {
      return item.dispose();
    });
  };

  /**
   * Instantiates a single instance of the Expandable Group.
   *
   * @param {Array.<Element>} elements An array of the elements in the group.
   * @return {ExpandableItem} the instance of the Expandable Item.
   * @public
   */


  ExpandableGroup.initialize = function initialize(elements) {
    return new ExpandableGroup(elements);
  };

  return ExpandableGroup;
}();

Object.assign(ExpandableGroup, Settings);

function initializeAll() {
  var elements = Array.from(document.querySelectorAll('[' + Settings.Attribute.TRIGGER + ']'));

  var single = [];
  var groups = [];
  var groupIds = [];

  elements.forEach(function (item) {
    var groupId = item.getAttribute(Settings.Attribute.GROUP);
    if (groupId) {
      if (groupIds.includes(groupId)) {
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
    return new ExpandableGroup(grouping);
  });

  return singleInstances.concat(groupInstances);
}

exports.initializeAll = initializeAll;
exports.ExpandableItem = ExpandableItem;
exports.ExpandableGroup = ExpandableGroup;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=odo-expandable.js.map
