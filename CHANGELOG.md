# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
