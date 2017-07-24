# Odo On Swipe

Provide event hook for swipes on an element.

## Install

```shell
npm install @odopod/odo-on-swipe --save
```

## Quick Start

```js
import OdoOnSwipe from '@odopod/odo-on-swipe';

const element = document.getElementById('foo');
const instance = new OdoOnSwipe(element, swiped(event) {
  element.textContent = 'Swiped ' + event.direction;
});
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: https://code.odopod.com/odo-on-swipe/
