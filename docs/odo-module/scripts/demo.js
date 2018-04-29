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

  var OdoModule = window.OdoModule;

  var BaseComponent = function () {
    function BaseComponent(element) {
      classCallCheck(this, BaseComponent);

      this.element = element;
    }

    BaseComponent.prototype.getAllByClass = function getAllByClass(className) {
      return Array.from(this.element.getElementsByClassName(className));
    };

    return BaseComponent;
  }();

  var CoolModule = function (_BaseComponent) {
    inherits(CoolModule, _BaseComponent);

    function CoolModule(element) {
      classCallCheck(this, CoolModule);

      var _this = possibleConstructorReturn(this, _BaseComponent.call(this, element));

      console.log(_this.getChildren()); // eslint-disable-line
      return _this;
    }

    CoolModule.prototype.getChildren = function getChildren() {
      return this.getAllByClass(CoolModule.Classes.CHILD);
    };

    return CoolModule;
  }(BaseComponent);

  CoolModule.Classes = {
    BASE: 'cool-module',
    CHILD: 'cool-module__child'
  };

  OdoModule.register(CoolModule);
  CoolModule.initializeAll();

  window.BaseComponent = BaseComponent;
  window.CoolModule = CoolModule;

}());
