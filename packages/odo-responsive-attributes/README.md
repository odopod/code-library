# Odo Responsive Attributes

Parse data attributes with respect to their breakpoints.

## Install

```shell
npm install @odopod/odo-responsive-attributes --save
```

## Quick Start

```js
import OdoResponsiveAttributes from '@odopod/odo-responsive-attributes';

clamper = new OdoResponsiveAttributes(document.getElementById('clamper'));
console.log(clamper.values); // Object with `xs`, `sm`, `md`, and `lg` keys.
console.log(clamper.currentValue); // Value based on the current breakpoint.
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: https://code.odopod.com/odo-responsive/
