# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## Carousel [2.1.3] - 2018-6-11

### Fixed

* When clicking through fading carousel faster than their transition speed, the `odo-carousel__slide--behind` class was never removed from the slide.

## Device [1.3.0] - 2018-6-7

### Added

* Test for `passive` property in event listener options. Use `OdoDevice.HAS_PASSIVE_LISTENERS` to check if you can use the third argument of `addEventListener` as an object. Needed for newer versions of iOS and Chrome which make `touchstart` and `touchmove` events on the document passive by default.

## Dialog [2.0.2] - 2018-6-7

### Fixed

* Use the new `OdoDevice.HAS_PASSIVE_LISTENERS` in `ScrollFix` to prevent scrolling the page behind the dialog in iOS 11.3+ again.

## Sassplate [2.0.1] - 2018-6-7

### Fixed

* Add `min-width`, `max-width`, `min-height`, `max-height`, `letter-spacing` to numeric props.

### Added

* `!default` flag to component framework variables so they can be overriden by the consumer.

## Carousel [2.1.2] Draggable [1.2.2] Dropdown [2.1.1] Dual-viewer [1.1.3] Expandable [0.2.2] Helpers [2.0.2] On-swipe [1.1.2] Pointer [1.2.1] Reveal [2.0.2] Tabs [2.0.2] Tap [1.1.2] - 2018-6-7

Bumped because `OdoDevice` is a dependency.

## Expandable [0.2.1] - 2018-5-5

### Fixed

* All click events on the entire page were having their default prevented. Now `preventDefault()` is only used when the expandable is going to be toggled.

## Expandable [0.2.0] - 2018-5-1
### Added
* `update()` method to which will update the scroll-to offsets for expandable accordions #20.

### Fixed
* Issue #19 where the scroll-to behavior was scrolling to the wrong position under some conditions.

### Removed
* `data-expandable-target` has been replaced with `id`. Always give the target/content an id attribute.
* `aria-describedby` on the trigger. This isn't necessary when the trigger has content within in.

### Changed
* Triggers are automatically given an `id` if they do not have one so that the `aria-labelledby` attribute on the target/content can reference the correct element.
* `expandableItem.isOpen` changed from a getter which checked the existence of a class name to a boolean which is set on `open()` and `close()`.

## Draggable [1.2.1], Carousel [2.1.1], Dual Viewer [1.1.2] - 2018-4-28
### Fixed
* Incorrect draggable event property calculations related to the axis (`didMoveOnAxis`, `isDirectionOnAxis`). This caused the carousel to not navigate after dragging.

## Video [1.2.2] - 2018-02-28
### Fixed
* Update autoplay test so that iOS 11 passes [stricter requirements](https://webkit.org/blog/6784/new-video-policies-for-ios/).
* Update base64 encoded video string to be shorter.

## Background Video [1.1.2] - 2018-02-28
### Fixed
* Update `OdoVideo` dependency.

## Affix [1.2.0], Device [1.2.0], Draggable [1.2.0], Dropdown [2.1.0], Responsive Images [1.2.0], Scroll Animation [1.2.0], Scroll Feedback [1.2.0], Sticky Headers [1.2.0], Window Events [1.2.0] - 2018-02-23
### Added
* `index.d.ts` type definitions.

### Changed
* JSDoc updates/fixes

## Background Video [1.1.1], Dual-viewer [1.1.1], Expandable [0.1.1], Helpers [2.0.1], Hotspots [1.2.1], Module [1.2.1], Object-fit [1.1.1], On-swipe [1.1.1], Responsive Attributes [1.1.1], Responsive Classes [1.1.1], Reveal [2.0.1], Share [1.1.1], Tabs [2.0.1], Tap [1.1.1], Video [1.2.1], Viewport [1.1.1] - 2018-02-23
### Changed
* JSDoc updates/fixes

## Base Component [1.2.1], Dialog [2.0.1] - 2018-02-23
### Changed
* JSDoc updates/fixes
* Type definitions updates.

## Carousel [2.1.0] - 2018-02-23
### Added
* `index.d.ts` type definitions.
* Export `CarouselEvent` from `OdoCarousel` (`OdoCarousel.CarouselEvent`).

### Changed
* JSDoc updates/fixes

## Pointer [1.2.0] - 2018-02-23
### Added
* `index.d.ts` type definitions.

### Changed
* JSDoc updates/fixes

### Removed
* Remove private `axis` property. Use `options.axis` instead.

## Expandable [0.1.0] - 2018-02-14
### Added
* New OdoExpandable (accordion) component.

```html
<button data-expandable-trigger="demo-expand-1">Trigger</button>
<div data-expandable-target="demo-expand-1">Target</div>
```

## All - 2018-02-12
### Added
* New ES builds. Every package now has a `"module"` field in its `package.json` and a `dist/odo-{component}.esm.js` file which includes the original `import` and `export` to allow tree shaking in bundlers.
* `"sideEffects": false` to `package.json`. `responsive-classes` and `share` have `"sideEffects": true`.

## Helpers [2.0.0] - 2018-02-12
### Removed
* Polyfills (`Element#closest` `Element#matches`, `requestAnimationFrame`).
* `animation.fadeElement` is now private.
* `array.getLongestString`. Not used in anything we (odopod) do.
* `device.getTranslate`.
* `dom.getFirstElementChild`. Use `element.firstElementChild` instead.
* `dom.getChildren`. Use `Array.from(element.children)` instead.
* `math.getAugmentedRect`. The `Rect` class now includes `right` and `bottom` (getter) properties.
* `style.getWindowHeight`. Was only an alias for `window.innerHeight`.

### Changed
* Helpers are no longer prefixed to a category object. Every helper is exported from the main entry point. This is a huge win for bundlers which can determine which exports are unused and remove them. To use `onTransitionEnd`, for example, you now need to import it like this:
  ```js
  import { onTransitionEnd } from '@odopod/odo-helpers';
  ```
* All function names remain the same except:
  * `animation.Stepper` => `Stepper`
  * `animation.Classes` => `animationClasses`
  * `array.remove` => `pull`
  * `string.random` => `randomString`

## Sassplate [2.0.0] - 2018-02-12
### Changed
* `.odo-responsive-img--cover` => `.image-cover`
* `.responsive-image-cover` => `.background-image-cover`

### Removed
* `.ghost-center-wrap`, `.ghost-center`. Use flexbox.
* `.table-center-wrap`, `.table-center`. Use flexbox.
* `outline:0` on `.unstyled-button:focus`.

## Responsive classes [1.1.0] - 2018-02-12
### Fixed
* Error when `data-class.xs` was not defined. `data-class.xs` is now optional.

## Carousel [2.0.0] - 2018-02-12
### Removed
* No longer includes `Element#closest` polyfill.

## Dialog [2.0.0] - 2018-02-12
### Removed
* No longer includes `Element#closest` polyfill.

## Dropdown [2.0.0] - 2018-02-12
### Removed
* No longer includes `Element#closest` polyfill.

## Reveal [2.0.0] - 2018-02-12
### Removed
* No longer includes `Element#closest` polyfill.

## Tabs [2.0.0] - 2018-02-12
### Removed
* No longer includes `Element#closest` polyfill.

## Dialog [1.2.0] - 2018-01-18
### Added
* Allow dialogs to open other dialogs. Dialog inception! You were able to do this before, but it didn't work well.

## Module [1.1.0] - 2018-01-16
### Added
* Add `initializeWhenIdle` method to initialize modules in a `requestIdleCallback`.

## All - 2018-01-16
### Fixed
* Fix incorrect repository name in `package.json`.
* Replace `https` links to code.odopod.com in README.md files with `http`. We don't have that set up yet.

## Draggable [1.0.3], Carousel [1.0.3], Dual Viewer [1.0.3] - 2017-12-08
### Fixed
* Toggle `grabbable` class when the draggable instance is enabled/disabled.

## Hotspots [1.1.1] - 2017-11-29
### Fixed
* Call `setPosition()` on the hotspot now that the cached position has been updated.

## Hotspots [1.1.0] - 2017-11-29
### Added
* Allow floats in hotspot positions. e.g. `data-position="10.5,62.2"`.
* Update the parsed hotspot position on `refresh()`.

## Video [1.1.0] - 2017-11-13
### Added
* Add title attributes to play toggle, volume toggle, and fullscreen toggle buttons. You can change the titles by overriding `OdoVideo.ControlsCreator.LABEL`.

## Scroll Feedback [1.0.2] - 2017-11-13
### Fixed
* Fix `disable()` not removing a `touchmove` event listener, preventing touch devices from scrolling the page when they should have been able to.

## Dialog [1.1.2] - 2017-11-13
### Fixed
* Fix type defintions for static methods.

## Carousel [1.0.1] - 2017-09-01
### Fixed
* Handle a case where `getComputedStyle` returns `"none"` when a transform has not yet been applied to the element.

## Dialog [1.1.0] - 2017-08-30
### Added
* The dialog instance now emits `TRIGGER_CLICKED` when an element with the `[data-odo-dialog-open]` attribute is clicked. The first parameter of the event is the trigger element.
    ```js
    defaultDialog.on(OdoDialog.EventType.TRIGGER_CLICKED, function (triggerElement) {
      console.log('dialog about to open because you clicked:', triggerElement);
    });
    ```
* Add an index.d.ts type definitions file for OdoDialog.

### Fixed
* Set height on main element for iOS. `100vh` on the main element makes it taller than it should be when toolbars open.
* Avoid calling `focus()` on SVG elements in browsers which don't support that (IE11-)

## BaseComponent [1.1.0] - 2017-08-25
### Added
* Add an `index.d.ts` type definitions file for `OdoBaseComponent`.

## Sassplate [1.1.0] - 2017-07-27
### Added

* Add support for pseudo classes and elements. You can define them with `':class-name'` or `'::element-name'`. The old way for visited, hover, active, and focus still work as well as others.

  This now works as expected:

  ```json
  {
    "':invalid'": {
      "border-bottom": "1px solid red"
    }
  }
  ```
* Allow recursive usage of modifiers, qualifiers, and raw properties.
* Add tests for the component framework mixins.
