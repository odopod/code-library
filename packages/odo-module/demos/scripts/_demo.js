const OdoModule = window.OdoModule;

class BaseComponent {
  constructor(element) {
    this.element = element;
  }

  getAllByClass(className) {
    return Array.from(this.element.getElementsByClassName(className));
  }
}

class CoolModule extends BaseComponent {
  constructor(element) {
    super(element);
    console.log(this.getChildren()); // eslint-disable-line
  }

  getChildren() {
    return this.getAllByClass(CoolModule.Classes.CHILD);
  }
}

CoolModule.Classes = {
  BASE: 'cool-module',
  CHILD: 'cool-module__child',
};

OdoModule.register(CoolModule);
CoolModule.initializeAll();

window.BaseComponent = BaseComponent;
window.CoolModule = CoolModule;
