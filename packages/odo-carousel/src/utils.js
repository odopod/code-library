
export function getTranslate(str) {
  const array = str.match(/(-?[\d.]+)/g);
  return {
    x: parseFloat(array[4]),
    y: parseFloat(array[5]),
  };
}

let count = 0;
export function uniqueId() {
  count += 1;
  return `odo-carousel${count}`;
}

/**
 * Find every element within the parent which is focusable via tabbing and
 * enable/disable it. Ideally, some property could be set on the parent
 * element itself to prevent tabbing into it. visibility:hidden accomplishes
 * this, but there can be slides in view which are not the current slide.
 * @param {Element} parent Ancestor element to disable tabbing into.
 * @param {boolean} canFocus Whether to enable or disable focusability.
 */
export function toggleFocusability(parent, canFocus) {
  const focusableElements = 'a[href],button,details,iframe,input,textarea,select,*[tabindex]';
  const elements = Array.from(parent.querySelectorAll(focusableElements));

  // Test the parent element itself. Odo Helpers polyfills `matches`.
  if (parent.matches(focusableElements)) {
    elements.push(parent);
  }

  for (let i = elements.length - 1; i >= 0; i--) {
    if (canFocus) {
      // Prefer resetting the tabIndex property by using removeAttribute to lets
      // the browser decide if it should go back to 0 (like if it was a button)
      // or to -1 if it wasn't originally focusable.
      elements[i].removeAttribute('tabindex');
    } else {
      elements[i].tabIndex = -1;
    }
  }
}
