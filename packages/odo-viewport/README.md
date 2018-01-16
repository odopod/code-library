# Odo Viewport

> Viewport enter and exit monitoring for elements.

## Install

```shell
npm install @odopod/odo-viewport --save
```

## Quick Start

```js
import OdoViewport from '@odopod/odo-viewport';

OdoViewport.add({
  element: document.getElementById('demo-enter-exit'),
  enter: function () {
    this.setAttribute('in-view', true);
  },
  exit: function () {
    this.removeAttribute('in-view');
  }
});
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: http://code.odopod.com/odo-viewport/
