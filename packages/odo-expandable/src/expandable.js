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

  const singleInstances = [];
  const groupInstances = [];
  const groupIds = [];

  elements.forEach((item) => {
    const groupId = item.getAttribute(Settings.Attribute.GROUP);
    if (groupId) {
      if (!groupIds.includes(groupId)) {
        const group = elements.filter(el => el.getAttribute(Settings.Attribute.GROUP) === groupId);
        const isAnimated = group.some(el => el.hasAttribute(Settings.Attribute.ANIMATED));
        groupInstances.push(isAnimated ?
          new ExpandableAccordion(group) :
          new ExpandableGroup(group));
        groupIds.push(groupId);
      }
    } else {
      singleInstances.push(new ExpandableItem(item.getAttribute(Settings.Attribute.TRIGGER)));
    }
  });

  return singleInstances.concat(groupInstances);
}

export { default as Settings } from './settings';
export { default as ExpandableItem } from './expandable-item';
export { default as ExpandableGroup } from './expandable-group';
export { default as ExpandableAccordion } from './expandable-accordion';
