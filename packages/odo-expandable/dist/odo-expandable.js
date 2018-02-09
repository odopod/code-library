(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OdoExpandable = factory());
}(this, (function () { 'use strict';

var Settings = {
  ClassName: {
    TRIGGER_OPEN: 'expandable__trigger--open',
    TARGET_OPEN: 'expandable__target--open'
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
 * @fileoverview
 *
 * @author Matt Zaso
 */
var ExpandableGroup = function () {
  function ExpandableGroup(elements) {
    classCallCheck(this, ExpandableGroup);

    this._elements = elements;

    this._expandables = elements.map(function (trigger) {
      return new Expandable(trigger.getAttribute(Settings.Attribute.TRIGGER), { groupedItem: true });
    });

    this._bindListeners();
  }

  /**
   * Binds the listeners to the body to handle click events.
   * @private
   */


  ExpandableGroup.prototype._bindListeners = function _bindListeners() {
    this._onClick = this._onClickHandler.bind(this);
    document.body.addEventListener('click', this._onClick);
  };

  /**
   * Handler for clicks on the trigger.
   * @param {Event} evt Event object.
   * @private
   */


  ExpandableGroup.prototype._onClickHandler = function _onClickHandler(evt) {
    evt.preventDefault();
    var closest = evt.target.closest('[' + Settings.Attribute.TRIGGER + ']');

    if (closest !== null && this._elements.includes(closest)) {
      this._toggleGroupVisibility(closest.getAttribute(Settings.Attribute.TRIGGER));
    }
  };

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
   * Dispose this instance and its handlers.
   */


  ExpandableGroup.prototype.dispose = function dispose() {
    document.body.removeEventListener('click', this._onTriggerClick);
    this._expandables.forEach(function (item) {
      return item.dispose();
    });
  };

  return ExpandableGroup;
}();

/**
 * @fileoverview An basic, expandable component that has both a trigger
 * and a target to open.
 *
 * @author Matt Zaso
 */
var Expandable = function () {
  function Expandable(id) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Expandable);

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

    this._setARIAAttributes();

    this._bindListeners();
  }

  /**
   * Binds the listeners to the body to handle click events.
   * @private
   */


  Expandable.prototype._bindListeners = function _bindListeners() {
    if (!this.options.groupedItem) {
      this._onTriggerClick = this._triggerClickHandler.bind(this);
      document.body.addEventListener('click', this._onTriggerClick);
    }
  };

  /**
   * Handler for clicks on the trigger.
   * @param {Event} evt Event object.
   * @private
   */


  Expandable.prototype._triggerClickHandler = function _triggerClickHandler(evt) {
    evt.preventDefault();
    var closest = evt.target.closest('[' + Settings.Attribute.TRIGGER + ']');

    if (closest !== null && closest === this._trigger) {
      this.toggle();
    }
  };

  /**
   * Sets the appropriate ARIA attributes for a11y.
   * @private
   */


  Expandable.prototype._setARIAAttributes = function _setARIAAttributes() {
    var elementId = 'expandable-' + this.id;

    this._trigger.setAttribute('aria-describedby', elementId);

    this._target.setAttribute('id', elementId);
    this._target.setAttribute('role', 'region');
    this._target.setAttribute('aria-expanded', 'true');
  };

  /**
   * Removes the ARIA attributes assigned on instantiation.
   * @private
   */


  Expandable.prototype._removeARIAAttributes = function _removeARIAAttributes() {
    this._trigger.removeAttribute('aria-describedby');
    this._target.removeAttribute('id');
    this._target.removeAttribute('role');
    this._target.removeAttribute('aria-expanded');
  };

  /**
   * Toggles the expandable's state (open/closed).
   */


  Expandable.prototype.toggle = function toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  };

  /**
   * Opens the expandable.
   */


  Expandable.prototype.open = function open() {
    this._target.classList.add(Settings.ClassName.TARGET_OPEN);
    this._trigger.classList.add(Settings.ClassName.TRIGGER_OPEN);
    this._target.setAttribute('aria-expanded', 'true');
  };

  /**
   * Closes the expandable.
   */


  Expandable.prototype.close = function close() {
    this._target.classList.remove(Settings.ClassName.TARGET_OPEN);
    this._trigger.classList.remove(Settings.ClassName.TRIGGER_OPEN);
    this._target.setAttribute('aria-expanded', 'false');
  };

  /**
   * Dispose this instance and its handlers.
   */
  Expandable.prototype.dispose = function dispose() {
    if (!this.options.groupedItem) {
      document.body.removeEventListener('click', this._onTriggerClick);
    }

    this._removeARIAAttributes();
  };

  /**
   * Instantiates all instances of the expandable.
   * @public
   */


  Expandable.initializeAll = function initializeAll() {
    var elements = Array.from(document.querySelectorAll('[' + Settings.Attribute.TRIGGER + ']'));

    var single = [];
    var groups = [];
    var groupIds = [];

    elements.forEach(function (item) {
      if (item.getAttribute(Settings.Attribute.GROUP)) {
        var groupId = item.getAttribute(Settings.Attribute.GROUP);
        if (groupIds.indexOf(groupId) < 0) {
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
      return new Expandable(trigger.getAttribute(Settings.Attribute.TRIGGER));
    });
    var groupInstances = groups.map(function (grouping) {
      return new ExpandableGroup(grouping);
    });

    return singleInstances.concat(groupInstances);
  };

  createClass(Expandable, [{
    key: 'isOpen',
    get: function get$$1() {
      return this._target.classList.contains(Settings.ClassName.TARGET_OPEN);
    }
  }]);
  return Expandable;
}();

Object.assign(Expandable, Settings);

return Expandable;

})));
//# sourceMappingURL=odo-expandable.js.map
