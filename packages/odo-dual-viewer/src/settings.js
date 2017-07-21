export default {
  Position: {
    START: 0,
    CENTER: 1,
    END: 2,
    BETWEEN: 3,
  },

  ClassName: {
    VERTICAL: 'odo-dual-viewer--vertical',
    INNER: 'odo-dual-viewer__inner',
    SCRUBBER_CONTAINER: 'odo-dual-viewer__scrubber-bounds',
    SCRUBBER: 'odo-dual-viewer__scrubber',
    OVERLAY: 'odo-dual-viewer__overlay',
    UNDERLAY: 'odo-dual-viewer__underlay',
    MEDIA: 'odo-dual-viewer__media',

    // States
    GRABBING: 'grabbing',
    CENTERED: 'is-centered',
    START: 'is-start',
    END: 'is-end',
  },

  EventType: {
    CAME_TO_REST: 'ododualviewer:handlecametorest',
  },

  Defaults: {
    startPosition: 0.5,
    isVertical: false,
    animationDuration: 300,
    verticalSafeZone: 0.1,
    hasZones: true,
    zones: [0.33, 0.33, 0.66, 0.66],
  },
};
