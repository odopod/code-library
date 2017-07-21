const OdoDropdown = window.OdoDropdown;

const example = new OdoDropdown(document.getElementById('demo-1'));
const watcher = document.getElementsByClassName('watcher')[0];

watcher.textContent = example.value;

example.on(OdoDropdown.EventType.CHANGE, (data) => {
  watcher.textContent = data.value;
});

const example2 = new OdoDropdown(document.getElementById('demo-2'));
const example3 = new OdoDropdown(document.getElementById('demo-3'));
const example4 = new OdoDropdown(document.getElementById('demo-4'));

// Export to window to play with in the console.
window.dropdown = example;
window.example2 = example2;
window.example3 = example3;
window.example4 = example4;
