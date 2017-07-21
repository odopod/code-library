let count = 0;
export default function setUniqueId(element) {
  if (!element.id) {
    count += 1;
    element.id = `odo-hotspots${count}`;
  }
}
