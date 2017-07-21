const OdoBaseComponent = window.OdoBaseComponent;

// Redefine breakpoints:
// OdoBaseComponent.defineBreakpoints([760, 992, 1200]);

class CoolModule extends OdoBaseComponent {
  constructor(element) {
    super(element, true);
    this.onMediaQueryChange();
  }

  onMediaQueryChange() {
    this.element.className = '';

    if (this.breakpoint.matches('xs') || this.breakpoint.matches('sm')) {
      this.element.classList.add('xs-or-sm');
    } else {
      this.element.classList.add('md-or-lg');
    }

    this.element.classList.add('cool--' + OdoBaseComponent.breakpoint.current);
  }
}

const cool = new CoolModule(document.body);

// Find the page title by class:
const title = cool.getElementByClass('page-title');
console.log(title.textContent);
