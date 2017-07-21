# Odo Tap

> A service to interpret taps on elements. Useful for delegated clicks on the document or body because iOS is buggy with delegated clicks on "non-clickable" elements.

## Install

```shell
npm install @odopod/odo-tap --save
```

## Quick Start

```js
import OdoTap from '@odopod/odo-tap';

const tapId = OdoTap.addListener(document.getElementById('thing-to-tap'), function () {
  console.log('tapped');
});
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: https://odopod.github.io/odo/odo-tap/
