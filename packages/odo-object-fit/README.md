# Odo Object Fit

> Fits media elements (img, video). It polyfills CSS' object-fit: cover; If the browser supports object-fit, it will not run. The media element should have full width and height as well as the object-fit property.

## Install

```shell
npm install @odopod/odo-object-fit --save
```

## Quick Start

```css
.my-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

```js
import OdoObjectFit from '@odopod/odo-object-fit';

// Cover a single element.
OdoObjectFit.cover(myElement);

// Cover multiple media elements.
OdoObjectFit.cover([myElement, thatOtherElement]);
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: http://code.odopod.com/odo-object-fit/
