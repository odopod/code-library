const OdoWindowEvents = window.OdoWindowEvents;

const output1 = document.getElementById('output1');
const output2 = document.getElementById('output2');
const output3 = document.getElementById('output3');
const output4 = document.getElementById('output4');


let scrolls = 0;
OdoWindowEvents.onScroll(() => {
  scrolls += 1;
  output1.innerHTML = scrolls;
});

let fastScrolls = 0;
OdoWindowEvents.onFastScroll(() => {
  fastScrolls += 1;
  output2.innerHTML = fastScrolls;
});

let resizes = 0;
OdoWindowEvents.onResize(() => {
  resizes += 1;
  output3.innerHTML = resizes;
});

let leadingResizes = 0;
OdoWindowEvents.onLeadingResize(() => {
  leadingResizes += 1;
  output4.innerHTML = leadingResizes;
});
