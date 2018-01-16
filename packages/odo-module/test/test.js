/* global describe, it, beforeEach, afterEach,
Module, ModuleClassName, ModuleClasses, ModuleEmpty, ModuleObject */
/* eslint-disable no-unused-expressions */

/*
import {
  Module,
  ModuleClassName,
  ModuleClasses,
  ModuleEmpty,
  ModuleObject,
} from './_modules';
*/

const expect = window.chai.expect;
const sinon = window.sinon;
const OdoModule = window.OdoModule;

describe('The OdoModule Component', () => {
  function createContainer() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    return container;
  }

  function createElement(classes, container) {
    const element = document.createElement('div');
    const context = container || document.body;

    element.classList.add(Module.ClassName.BASE);

    if (classes) {
      if (Array.isArray(classes)) {
        classes.forEach((c) => {
          element.classList.add(c);
        });
      } else {
        element.classList.add(classes);
      }
    }

    context.appendChild(element);

    return element;
  }

  function removeElement(element) {
    element.parentNode.removeChild(element);
  }

  describe('module registration', () => {
    it('will register a module with Selectors property', () => {
      expect(() => {
        OdoModule.register(Module);
      }).to.not.throw();
    });

    it('will register a module with ClassName property', () => {
      expect(() => {
        OdoModule.register(ModuleClassName);
      }).to.not.throw();
    });

    it('will register a module with Classes property', () => {
      expect(() => {
        OdoModule.register(ModuleClasses);
      }).to.not.throw();
    });

    it('should throw when registering the same module more than once', () => {
      expect(() => {
        OdoModule.register(Module);
      }).to.throw(TypeError);
    });

    it('should throw when there is no selector', () => {
      expect(() => {
        OdoModule.register(ModuleEmpty);
      }).to.throw(TypeError);
    });

    it('can register with an explicit selector', () => {
      expect(() => {
        OdoModule.register(ModuleEmpty, '.odo');
      }).to.not.throw(TypeError);
    });

    it('can unregister', () => {
      expect(() => {
        OdoModule.unregister(ModuleEmpty, '.odo');
      }).to.not.throw(TypeError);
    });

    it('can register a plain object', () => {
      expect(() => {
        OdoModule.register(ModuleObject, '.module-object');
      }).to.not.throw();
    });

    it('will throw when registering non-objects and non-functions', () => {
      expect(() => {
        OdoModule.register(['bar'], '.foo');
      }).to.throw(TypeError);

      expect(() => {
        OdoModule.register(null, '.foo');
      }).to.throw(TypeError);

      expect(() => {
        OdoModule.register(undefined, '.foo');
      }).to.throw(TypeError);

      expect(() => {
        OdoModule.register(new Date(), '.foo');
      }).to.throw(TypeError);
    });
  });

  describe('methods and properties', () => {
    it('should contain the getInstance static method', () => {
      expect(Module.getInstance).to.exist;
      expect(Module.getInstance).to.be.a('function');
    });

    it('should contain the deleteInstance static method', () => {
      expect(Module.deleteInstance).to.exist;
      expect(Module.deleteInstance).to.be.a('function');
    });

    it('should contain the initialize static method', () => {
      expect(Module.initialize).to.exist;
      expect(Module.initialize).to.be.a('function');
    });

    it('should contain the initializeAll static method', () => {
      expect(Module.initializeAll).to.exist;
      expect(Module.initializeAll).to.be.a('function');
      expect(ModuleObject.initializeAll).to.exist;
      expect(ModuleObject.initializeAll).to.be.a('function');
    });
  });

  describe('initialize', () => {
    it('should throw if no element is specified', () => {
      expect(() => {
        Module.initialize();
      }).to.throw(TypeError);
    });

    it('should initialize a module instance from a given element', () => {
      const element = createElement();
      const instances = Module.initialize(element);
      const instance = instances.get(element);

      expect(instances.has(element)).to.be.true;
      expect(instance).to.be.an.instanceof(Module);
      expect(Module.Instances.has(element)).to.be.true;
      Module.deleteInstance(element);
      removeElement(element);
    });

    it('should initialize a module instance from a given element with custom options', () => {
      const element = createElement();
      const options = { foo: 'bar' };
      const instances = Module.initialize(element, options);
      const instance = instances.get(element);

      expect(instance.options).to.be.an('object');
      expect(instance.options).to.have.property('foo').and.equal(options.foo);

      Module.disposeAll();
      removeElement(element);
    });

    it('should initialize an array of elements', () => {
      const elementOne = createElement();
      const elementTwo = createElement();
      const instances = Module.initialize([elementOne, elementTwo]);

      expect(instances.size).to.equal(2);

      Module.disposeAll();
      removeElement(elementOne);
      removeElement(elementTwo);
    });

    it('should initialize a NodeList of elements', () => {
      const elementOne = createElement('test1');
      const elementTwo = createElement('test1');

      const instances = Module.initialize(document.querySelectorAll('.test1'));

      expect(instances.size).to.equal(2);

      Module.disposeAll();
      removeElement(elementOne);
      removeElement(elementTwo);
    });

    it('should throw if attempting to initialize a non-element', () => {
      expect(() => {
        Module.initialize({});
      }).to.throw(TypeError);
    });

    it('should throw if attempting to initialize an element more than once', () => {
      const element = createElement();
      const instances = Module.initialize([element, element]);

      expect(instances.size).to.equal(1);

      Module.disposeAll();
      removeElement(element);
    });
  });

  describe('initializeAll', () => {
    it('should initialize modules for matching elements within a given context', () => {
      const context = createContainer();

      createElement([], context);
      createElement([], context);

      const instances = Module.initializeAll(context);

      expect(instances.size).to.equal(2);

      Module.disposeAll(context);
      removeElement(context);
    });

    it('should ignore modules that have already been initialized', () => {
      const element = createElement();
      const instances = Module.initializeAll();

      expect(instances.size).to.equal(1);
      expect(instances.has(element)).to.be.true;

      Module.disposeAll();
      removeElement(element);
    });
  });

  describe('initializeWhenIdle', () => {
    it('should initialize modules when the browser has a moment', () => {
      const element = createElement();
      return Module.initializeWhenIdle().then((instances) => {
        expect(instances.size).to.equal(1);
        expect(instances.has(element)).to.be.true;

        Module.disposeAll();
        removeElement(element);
      });
    });
  });

  describe('disposeAll', () => {
    it('calls deleteInstance for each element', () => {
      const stub = sinon.stub(Module, 'deleteInstance');

      const context = createContainer();
      createElement([], context);
      createElement([], context);
      createElement([], context);

      expect(stub.callCount).to.equal(0);
      Module.disposeAll(context);
      expect(stub.callCount).to.equal(3);

      stub.restore();
      removeElement(context);
    });
  });

  describe('getInstance', () => {
    it('should get the instance for an element', () => {
      const element = createElement();
      const instances = Module.initialize(element);
      const instance = Module.getInstance(element);

      expect(instances.get(element)).to.equal(instance);
    });

    it('should return undefined if the module has not been initialized', () => {
      const element = createElement();

      expect(Module.getInstance(element)).to.equal(undefined);
    });
  });

  describe('deleteInstance', () => {
    it('should delete the instance for an element', () => {
      const element = createElement();
      const element2 = createElement();
      const instances = Module.initialize(element);
      const instances2 = ModuleClassName.initialize(element2);

      expect(Module.getInstance(element)).to.equal(instances.get(element));
      expect(Module.deleteInstance(element)).to.equal(true);
      expect(Module.getInstance(element)).to.equal(undefined);

      // ModuleClassName doesn't have a `dispose` method.
      expect(ModuleClassName.getInstance(element2)).to.equal(instances2.get(element2));
      expect(ModuleClassName.deleteInstance(element2)).to.equal(true);
      expect(ModuleClassName.getInstance(element2)).to.equal(undefined);
    });

    it('should return false if the instance has not been initialized', () => {
      const element = createElement();

      expect(Module.deleteInstance(element)).to.equal(false);
    });
  });
});
