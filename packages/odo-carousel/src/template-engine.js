/**
 * A simple string replacement template with double curly braces. You can use
 * nested objects and functions too.
 *
 * @example
 * // "Today is Thursday"
 * template("Today is {{ day }}", {
 *   day: 'Thursday',
 * });
 *
 * // "Today is Friday"
 * template("Today is {{ month.day }}", {
 *   month: {
 *     day: 'Friday',
 *   },
 * });
 *
 * // "Today is Saturday"
 * template("Today is {{ day }}", {
 *   today: 'Saturday',
 *   day() {
 *     return this.today;
 *   },
 * });
 *
 * @param {string} str Template.
 * @param {object} data Data object with keys which match your template.
 * @return {string}
 */
export default function template(str, data) {
  // A modified version of Malsup's template method for Cycle.
  // https://github.com/malsup/cycle2/blob/master/src/jquery.cycle2.tmpl.js

  // Regex which matches {{cool}} or {{ cool }} where `cool` is what should
  // be replaced.
  return str.replace(/{{\s?((.)?.*?)\s?}}/g, (match, str) => {
    const names = str.split('.');
    let obj = data;
    let property;

    // If the name has dots in it, "person.name", loop through each one.
    if (names.length > 1) {
      property = obj;
      for (let i = 0; i < names.length; i++) {
        obj = property;
        property = property[names[i]] || str;
      }

    // Otherwise, it's a simple assignment from the data object.
    } else {
      property = obj[str];
    }

    // If they passed a function, use that.
    if (typeof property === 'function') {
      return property.call(obj);
    }

    // Return the string if it exists.
    if (property !== undefined && property !== null && property !== str) {
      return property;
    }

    // Otherwise, return the original string.
    return str;
  });
}
