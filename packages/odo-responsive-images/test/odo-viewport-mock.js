/* eslint-disable */

var count = 0;

function uniqueId() {
  return 'unique' + count++;
}

window.sinon.stub(window.OdoViewport, 'add').callsFake(function (options) {
  if (Array.isArray(options)) {
    return options.map(uniqueId);
  }

  return uniqueId();
});

window.sinon.stub(window.OdoViewport, 'update');
window.sinon.stub(window.OdoViewport, 'remove');
