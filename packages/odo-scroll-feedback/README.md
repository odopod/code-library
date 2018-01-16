# Odo Scroll Feedback

> Based user input from mouse, keyboard, and touch, the `ScrollFeedback` instance will emit navigation events with a `direction` property signifying which way the user should be taken

## Install

```shell
npm install @odopod/odo-scroll-feedback --save
```

## Quick Start

```js
import OdoScrollFeedback from '@odopod/odo-scroll-feedback';

var scrollFeedback = new OdoScrollFeedback(document.body);

scrollFeedback.on(OdoScrollFeedback.Events.NAVIGATE, function(data) {
  switch (data.direction) {
    case OdoScrollFeedback.Direction.NEXT:
      console.log('go to the next state');
      break;
    case OdoScrollFeedback.Direction.PREVIOUS:
      console.log('go to the previous state');
      break;
    case OdoScrollFeedback.Direction.START:
      console.log('home key pressed');
      break;
    case OdoScrollFeedback.Direction.END:
      console.log('end key pressed');
      break;
  }
}, false);
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: http://code.odopod.com/odo-scroll-feedback/
