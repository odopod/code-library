
// With .Selectors
class Module {
  constructor(element, options) {
    this.element = element;
    this.options = options;
  }

  dispose() {
    this.element = null;
  }
}

Module.ClassName = {
  BASE: 'sample-module',
};

Module.Selectors = {
  BASE: '.sample-module',
};

// With .ClassName
class ModuleClassName {
  constructor(element, options) {
    this.element = element;
    this.options = options;
  }
}

ModuleClassName.ClassName = {
  BASE: 'classname-module',
};

// With .Classes
class ModuleClasses {
  constructor(element, options) {
    this.element = element;
    this.options = options;
  }
}

ModuleClasses.Classes = {
  BASE: 'classes-module',
};

// Without any defined base class.
class ModuleEmpty {
  constructor(element, options) {
    this.element = element;
    this.options = options;
  }
}

// An object instead of a class.
const ModuleObject = {
  init(element, options) {
    this.element = element;
    this.options = options;
  },
};

/*
export {
  Module,
  ModuleClassName,
  ModuleClasses,
  ModuleEmpty,
  ModuleObject,
};
*/
