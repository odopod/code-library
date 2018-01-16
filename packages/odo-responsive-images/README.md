# Odo Responsive Images

> Native responsive images with deferred loading.

## Install

```shell
npm install @odopod/odo-responsive-images --save
```

## Quick Start

```html
<div class="odo-responsive-img">
  <!--[if IE 9]><video style="display: none;"><![endif]-->
  <source srcset="https://source.unsplash.com/category/buildings/800x400" media="(min-width: 992px)">
  <source srcset="https://source.unsplash.com/category/technology/600x300" media="(min-width: 768px)">
  <source srcset="https://source.unsplash.com/category/nature/400x200">
  <!--[if IE 9]></video><![endif]-->
  <img alt="picture 1 description">
  <noscript>
    <img src="https://source.unsplash.com/category/nature/400x200" alt="picture 1 description">
  </noscript>
</div>
```

## [Documentation][permalink]

Visit the [Odo component directory][permalink] for demos, code examples, and documentation.

[permalink]: http://code.odopod.com/odo-responsive-images/
