import Settings from './settings';
import ExpandableGroup from './expandable-group';
import ExpandableItem from './expandable-item';
import ExpandableAccordion from './expandable-accordion';

/**
 * Instantiates all instances of the expandable. Groups are instantiated separate from
 * Expandables and require different parameters. This helper chunks out and groups the
 * grouped expandables before instantiating all of them.
 *
 * @return {Array.<Expandable, ExpandableGroup>} all instances of both types.
 * @public
 */
export function initializeAll() {
  const elements = Array.from(document.querySelectorAll(`[${Settings.Attribute.TRIGGER}]`));

  const single = [];
  const groups = [];
  const groupIds = [];

  elements.forEach((item) => {
    const groupId = item.getAttribute(Settings.Attribute.GROUP);
    if (groupId) {
      if (!groupIds.includes(groupId)) {
        groups.push(elements.filter(el => el.getAttribute(Settings.Attribute.GROUP) === groupId));
        groupIds.push(groupId);
      }
    } else {
      single.push(item);
    }
  });

  const singleInstances =
    single.map(trigger => new ExpandableItem(trigger.getAttribute(Settings.Attribute.TRIGGER)));
  const groupInstances = groups.map((grouping) => {
    if (grouping[0].hasAttribute('data-expandable-animated')) {
      return new ExpandableAccordion(grouping);
    }
    return new ExpandableGroup(grouping);
  });

  return singleInstances.concat(groupInstances);
}

export { default as Settings } from './settings';
export { default as ExpandableItem } from './expandable-item';
export { default as ExpandableGroup } from './expandable-group';
export { default as ExpandableAccordion } from './expandable-accordion';
