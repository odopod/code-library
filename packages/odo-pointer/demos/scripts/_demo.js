const OdoPointer = window.OdoPointer;

const horizontal = new OdoPointer(document.getElementById('field-x'), {
  axis: OdoPointer.Axis.X,
});

const vertical = new OdoPointer(document.getElementById('field-y'), {
  axis: OdoPointer.Axis.Y,
});

const both = new OdoPointer(document.getElementById('field-xy'));

const requests = {
  'field-x': null,
  'field-y': null,
  'field-xy': null,
};

function roundTo(value, decimals = 0) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function coordinateToString(coord) {
  return `(${roundTo(coord.x, 4)}, ${roundTo(coord.y, 4)})`;
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
  return `event === {
  type: '${event.type}',
  target: '.${event.target.className.trim().split(' ').join('.')}',
  currentTarget: '.${event.currentTarget.className.trim().split(' ').join('.')}',
  start: '${coordinateToString(event.start)}',
  end: '${coordinateToString(event.end)}',
  deltaTime: ${event.deltaTime},
  delta: '${coordinateToString(event.delta)}',
  velocity: '${coordinateToString(event.velocity)}',
  currentVelocity: '${coordinateToString(event.currentVelocity)}',
  distance: ${roundTo(event.distance, 4)},
  direction: ${getDirection(event.direction)},
  axisDirection: ${getDirection(event.axisDirection)},
  isDirectionOnAxis: ${event.isDirectionOnAxis},
  didMoveOnAxis: ${event.didMoveOnAxis},
}`;
}

function getHandler(section) {
  const code = document.getElementById(section.id + '-event').querySelector('code');
  return (evt) => {
    code.innerHTML = template(evt);

    // Cancel a previous scheduled task.
    if (requests[section.id]) {
      cancelAnimationFrame(requests[section.id]);
    }

    requests[section.id] = requestAnimationFrame(() => {
      requests[section.id] = null;
      window.Prism.highlightElement(code);
    });
  };
}

const handlerX = getHandler(horizontal.element);
const handlerY = getHandler(vertical.element);
const handlerXY = getHandler(both.element);

horizontal.on(OdoPointer.EventType.START, handlerX);
horizontal.on(OdoPointer.EventType.MOVE, handlerX);
horizontal.on(OdoPointer.EventType.END, handlerX);

vertical.on(OdoPointer.EventType.START, handlerY);
vertical.on(OdoPointer.EventType.MOVE, handlerY);
vertical.on(OdoPointer.EventType.END, handlerY);

both.on(OdoPointer.EventType.START, handlerXY);
both.on(OdoPointer.EventType.MOVE, handlerXY);
both.on(OdoPointer.EventType.END, handlerXY);
