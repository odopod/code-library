# Odo Sassplate

> Delete-key friendly SCSS boilerplate.

## Install

1. Install the package.

  ```shell
  npm install @odopod/odo-sassplate --save
  ```

2. Copy `styles.scss` to your scss directory in your project (probably somewhere like `src/css/`).
3. Change all the `@import`s to reference the files in `node_modules`, similar to how `normalize.css` is used.
4. Install the [node-sass-json-importer](https://github.com/Updater/node-sass-json-importer) and **integrate it** into your build.

  ```
  npm install node-sass-json-importer --save-dev
  ```

At this point, you should be able to compile your SCSS without any issues.

## Setup

1. You will want your own project variables, typography, and ui components, so copy `extensions/variables.json`, `extensions/type-definitions.json`, and `extensions/component-definitions.json` into your source CSS.
2. Copy the `_imports.scss` file from Sassplate into your source CSS.
3. Edit your new `_imports.scss` to make sure the `@import` paths are correct.
4. Update the path for `_imports.scss` in your new `styles.scss` to reference the new file.
5. Make a change in one of the `.json` files and recompile your CSS. You should see the change.

## Customization

To make changes to styles from the Sassplate, you can add styles which override the existing ones, or replace the `.scss` file with your own copy.

All variables in `extensions/_variables.scss` are declared with [`!default`](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#variable_defaults_), meaning it will assign the variable if it is not already assigned. This allows you to overwrite the variables without duplicating the file.

## Mixins

Sassplate adds mixins as well. For details and method signatures, check out [`_mixins.scss`](extensions/_mixins.scss). Here's a list of them:

* breakpoint
* breakpoints
* augment-hit-area
* keep-aspect
* aspect
* no-aspect
* fill-parent
* reset-fill-parent
* clearfix
* text-overflow
* font-smooth
* layer-promote
* background-cover
* size
* table-center-wrap
* table-center

## Writing CSS with JSON

The basic structure for each json file looks like this:

```json
{
  "scss-variable-name": {
    "Group Name in Style Guide": {
      "selector": {
        "property": "value"
      }
    }
  }
}
```

The above JSON would generate the following CSS:

```css
.selector {
  property: value;
}
```

### Special Properties

Some properties are treated differently than others.

#### Numeric Properties

Properties which expect a length (like `width`, `padding-top`, etc.) will append `px` if the unit is left off.

#### Color Properties

Properties which expect a color (like `color`, `border-color`, etc.) will use the `get-color` function to find the color you have defined in `variables.json` `colors` property.

#### Element States

For `focus`, `hover`, and `active` states, supply a new object with those styles:

```json
"btn": {
  "focus": {
    "outline-color": "blue"
  },
  "hover": {
    "color": "white",
    "background-color": "blue"
  },
  "active": {
    "background-color": "mediumseagreen"
  }
}
```

```css
.btn:focus {
  outline-color: #1b9ec6;
}

.btn:hover {
  color: white;
  background-color: #1b9ec6;
}

.btn:active {
  background-color: mediumseagreen;
}
```

#### `docs-demo`

To display a demo of your component in Odo Style Guide, use the `docs-demo` property.

```json
"btn": {
  "docs-demo": {
    "demo-markup": "'<button class=\"btn\">Sign In</button>'",
    "dark-background": true
  }
}
```

Other boolean options you may add to `docs-demo` are `text-center`, `dark-background`, or `light-background`.

#### `breakpoints`

To style the selector at breakpoints, add the `breakpoints` property.

```json
"type-title-1": {
  "font-size": 30,

  "breakpoints": {
    "sm": {
      "font-size": 40
    },
    "md": {
      "font-size": 50
    }
  }
}
```

```css
.type-title-1 {
  font-size: 30px;
}

@media (min-width: 768px) {
  .type-title-1 {
    font-size: 40px;
  }
}

@media (min-width: 1024px) {
  .type-title-1 {
    font-size: 50px;
  }
}
```


#### `children`

Target children of the current selector with `children`. Notice the selector is wrapped in single quotes so that it remains a valid string when converted to SCSS.

```json
"btn": {
  "children": {
    "'.btn__text'": {
      "display": "inline-block",
      "vertical-align": "middle"
    }
  }
}
```

```css
.btn .btn__text {
  display: inline-block;
  vertical-align: middle;
}
```

#### `qualifiers`

Qualifiers are for overriding properties based on a class on the <html> element.

```json
"btn": {
  "qualifiers": {
    "en": {
      "line-height": 1.5,
    },
    "zh": {
      "color": "mediumseagreen"
    }
  }
}
```

```css
.en .btn {
  line-height: 1.5;
}

.zh .btn {
  color: mediumseagreen;
}
```

#### `modifiers`

Modifiers are variants of a class, with only a few attributes that are different. For example, a `.btn` with an icon in it might need styles applied to the icon within it.

```json
"btn": {
  "color": "blue",

  "modifiers": {

    "icon": {
      "padding-right": 12,

      "children": {
        "'.icon'": {
          "margin-right": 8
        }
      }
    }
  }
}
```

```css
.btn {
  color: #1b9ec6;
}

.btn--icon {
  padding-right: 12px;
}

.btn--icon .icon {
  margin-right: 8px;
}
```
#### `raw`

Allow any selector to be appended to the main selector.

```json
"btn": {
  "raw": {
    "'::after'": {
      "content": "'Sassplate'"
    }
  }
}
```

```css
.btn::after {
  content: "Sassplate";
}
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: http://code.odopod.com/odo-sassplate/
