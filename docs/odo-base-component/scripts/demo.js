(function () {
'use strict';

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

var OdoBaseComponent = window.OdoBaseComponent;

// Redefine breakpoints:
// OdoBaseComponent.defineBreakpoints([760, 992, 1200]);

var CoolModule = function (_OdoBaseComponent) {
  inherits(CoolModule, _OdoBaseComponent);

  function CoolModule(element) {
    classCallCheck(this, CoolModule);

    var _this = possibleConstructorReturn(this, _OdoBaseComponent.call(this, element, true));

    _this.onMediaQueryChange();
    return _this;
  }

  CoolModule.prototype.onMediaQueryChange = function onMediaQueryChange() {
    this.element.className = '';

    if (this.breakpoint.matches('xs') || this.breakpoint.matches('sm')) {
      this.element.classList.add('xs-or-sm');
    } else {
      this.element.classList.add('md-or-lg');
    }

    this.element.classList.add('cool--' + OdoBaseComponent.breakpoint.current);
  };

  return CoolModule;
}(OdoBaseComponent);

var cool = new CoolModule(document.body);

// Find the page title by class:
var title = cool.getElementByClass('page-title');
console.log(title.textContent);

}());
