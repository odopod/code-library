(function () {
'use strict';

var OdoPointer = window.OdoPointer;

var horizontal = new OdoPointer(document.getElementById('field-x'), {
  axis: OdoPointer.Axis.X
});

var vertical = new OdoPointer(document.getElementById('field-y'), {
  axis: OdoPointer.Axis.Y
});

var both = new OdoPointer(document.getElementById('field-xy'));

var requests = {
  'field-x': null,
  'field-y': null,
  'field-xy': null
};

function roundTo(value) {
  var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function coordinateToString(coord) {
  return '(' + roundTo(coord.x, 4) + ', ' + roundTo(coord.y, 4) + ')';
}

function getDirection(direction) {
  switch (direction) {
    case OdoPointer.Direction.LEFT:
      return 'OdoPointer.Direction.LEFT';
    case OdoPointer.Direction.RIGHT:
      return 'OdoPointer.Direction.RIGHT';
    case OdoPointer.Direction.UP:
      return 'OdoPointer.Direction.UP';
    case OdoPointer.Direction.DOWN:
      return 'OdoPointer.Direction.DOWN';
    case OdoPointer.Direction.NONE:
      return 'OdoPointer.Direction.NONE';
    default:
      return '';
  }
}

function template(event) {
  return 'event === {\n  type: \'' + event.type + '\',\n  target: \'.' + event.target.className.trim().split(' ').join('.') + '\',\n  currentTarget: \'.' + event.currentTarget.className.trim().split(' ').join('.') + '\',\n  start: \'' + coordinateToString(event.start) + '\',\n  end: \'' + coordinateToString(event.end) + '\',\n  deltaTime: ' + event.deltaTime + ',\n  delta: \'' + coordinateToString(event.delta) + '\',\n  velocity: \'' + coordinateToString(event.velocity) + '\',\n  currentVelocity: \'' + coordinateToString(event.currentVelocity) + '\',\n  distance: ' + roundTo(event.distance, 4) + ',\n  direction: ' + getDirection(event.direction) + ',\n  axisDirection: ' + getDirection(event.axisDirection) + ',\n  isDirectionOnAxis: ' + event.isDirectionOnAxis + ',\n  didMoveOnAxis: ' + event.didMoveOnAxis + ',\n}';
}

function getHandler(section) {
  var code = document.getElementById(section.id + '-event').querySelector('code');
  return function (evt) {
    code.innerHTML = template(evt);

    // Cancel a previous scheduled task.
    if (requests[section.id]) {
      cancelAnimationFrame(requests[section.id]);
    }

    requests[section.id] = requestAnimationFrame(function () {
      requests[section.id] = null;
      window.Prism.highlightElement(code);
    });
  };
}

var handlerX = getHandler(horizontal.element);
var handlerY = getHandler(vertical.element);
var handlerXY = getHandler(both.element);

horizontal.on(OdoPointer.EventType.START, handlerX);
horizontal.on(OdoPointer.EventType.MOVE, handlerX);
horizontal.on(OdoPointer.EventType.END, handlerX);

vertical.on(OdoPointer.EventType.START, handlerY);
vertical.on(OdoPointer.EventType.MOVE, handlerY);
vertical.on(OdoPointer.EventType.END, handlerY);

both.on(OdoPointer.EventType.START, handlerXY);
both.on(OdoPointer.EventType.MOVE, handlerXY);
both.on(OdoPointer.EventType.END, handlerXY);

}());
