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
var OdoResponsiveAttributes = window.OdoResponsiveAttributes;

var classy = new OdoResponsiveAttributes(document.getElementById('classy'), 'class-name');
var classy2 = new OdoResponsiveAttributes(document.getElementById('classy2'));
var defaultValue = new OdoResponsiveAttributes(document.getElementById('default-value'));

console.log('values:', classy.values, 'currentValue:', classy.currentValue);
console.log('values:', classy2.values, 'currentValue:', classy2.currentValue);
console.log('values:', defaultValue.values, 'currentValue:', defaultValue.currentValue);

window.addEventListener('resize', function () {
  classy.update();
  classy2.update();
  defaultValue.update();
});

var Clamper = function (_OdoBaseComponent) {
  inherits(Clamper, _OdoBaseComponent);

  function Clamper(element) {
    classCallCheck(this, Clamper);

    var _this = possibleConstructorReturn(this, _OdoBaseComponent.call(this, element, true));

    _this.attributes = new OdoResponsiveAttributes(element, 'clamp');
    _this.doClamp(_this.attributes.currentValue);
    return _this;
  }

  Clamper.prototype.onMediaQueryChange = function onMediaQueryChange() {
    var linesToClamp = this.attributes.update().currentValue;
    this.doClamp(linesToClamp);
  };

  Clamper.prototype.doClamp = function doClamp(linesToClamp) {
    console.log('lines to clamp:', linesToClamp);
  };

  Clamper.prototype.dispose = function dispose() {
    this.attributes.dispose();
    _OdoBaseComponent.prototype.dispose.call(this);
  };

  return Clamper;
}(OdoBaseComponent);

window.clamper = new Clamper(document.getElementById('clamper'));

}());
