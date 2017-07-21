const OdoBaseComponent = window.OdoBaseComponent;
const OdoResponsiveAttributes = window.OdoResponsiveAttributes;

const classy = new OdoResponsiveAttributes(document.getElementById('classy'), 'class-name');
const classy2 = new OdoResponsiveAttributes(document.getElementById('classy2'));
const defaultValue = new OdoResponsiveAttributes(document.getElementById('default-value'));

console.log('values:', classy.values, 'currentValue:', classy.currentValue);
console.log('values:', classy2.values, 'currentValue:', classy2.currentValue);
console.log('values:', defaultValue.values, 'currentValue:', defaultValue.currentValue);

window.addEventListener('resize', () => {
  classy.update();
  classy2.update();
  defaultValue.update();
});

class Clamper extends OdoBaseComponent {
  constructor(element) {
    super(element, true);
    this.attributes = new OdoResponsiveAttributes(element, 'clamp');
    this.doClamp(this.attributes.currentValue);
  }

  onMediaQueryChange() {
    const linesToClamp = this.attributes.update().currentValue;
    this.doClamp(linesToClamp);
  }

  doClamp(linesToClamp) {
    console.log('lines to clamp:', linesToClamp);
  }

  dispose() {
    this.attributes.dispose();
    super.dispose();
  }
}

window.clamper = new Clamper(document.getElementById('clamper'));
