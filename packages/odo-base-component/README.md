# Odo Base Component

> Base component for odo components. Includes media query listeners and exports base globals

## Install

```shell
npm install @odopod/odo-base-component --save
```

## Quick Start

```js
import OdoBaseComponent from '@odopod/odo-base-component';

class CoolModule extends OdoBaseComponent {
  constructor(element) {
    // Add media query listeners for this component.
    super(element, true);

    // Optionally call the listener on init.
    this.onMediaQueryChange();
  }

  /**
   * Do something when the breakpoint switches.
   */
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
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: http://code.odopod.com/odo-base-component/
