# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
