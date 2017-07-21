export default {
  Classes: {
    BASE: 'odo-video',

    IS_PLAYING: 'odo-video--playing',
    IS_FULLSCREEN: 'odo-video--fullscreen',
    IS_MUTED: 'odo-video--muted',
    IS_BUFFERING: 'odo-video--buffering',
    IS_IDLE: 'odo-video--idle',
    NO_FLEXBOX: 'odo-video--no-flexbox',
    CONTROLS_STACKED: 'odo-video__controls--stacked',
    CONTROLS_HIDDEN: 'odo-video__controls--hidden',

    CONTROLS: 'odo-video__controls',
    PLAY_TOGGLE: 'odo-video__play-toggle',
    PLAY_CONTROL: 'odo-video__play-control',
    PAUSE_CONTROL: 'odo-video__pause-control',
    PROGRESS_CONTAINER: 'odo-video__progress-container',
    PROGRESS_HOLDER: 'odo-video__progress-holder',
    BUFFER: 'odo-video__buffer',
    PROGRESS: 'odo-video__progress',
    CURRENT_TIME: 'odo-video__current-time',
    VOLUME: 'odo-video__volume',
    MUTE_CONTROL: 'odo-video__mute-control',
    UNMUTE_CONTROL: 'odo-video__unmute-control',
    FULLSCREEN: 'odo-video__fullscreen',
    FULLSCREEN_CONTROL: 'odo-video__fullscreen-control',
    EXIT_FULLSCREEN_CONTROL: 'odo-video__exit-fullscreen-control',
    FLEXIBLE_SPACE: 'odo-video__flexible-space',
  },

  Icons: {
    FULLSCREEN: '<svg viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2H8v2h2.586L8 6.587 9.414 8 12 5.415V8h2V2zM8 9.414L6.586 8 4 10.586V8H2v6h6v-2H5.415z"/></svg>',
    EXIT_FULLSCREEN: '<svg viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path d="M15 2.4L13.6 1 11 3.6V1H9v6h6V5h-2.6L15 2.4zM5 9H1v2h2.6L1 13.6 2.4 15 5 12.4V15h2V9H5z"/></svg>',
    AUDIO_ON: '<svg viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path d="M1 5.366v5.294c0 .177.142.32.317.32h2.89c.093 0 .18.034.254.093l4.505 3.743c.16.135.4.018.402-.19l.002-13.25c0-.21-.243-.325-.403-.193L4.47 4.923c-.077.064-.173.098-.27.098H1.33c-.235 0-.33.17-.33.346zm10.292-1.03c-.295-.296-.76-.296-1.057 0-.292.296-.292.775.002 1.07v-.002c.642.652 1.04 1.55 1.04 2.54 0 .992-.396 1.884-1.04 2.535-.294.295-.294.774 0 1.07.143.148.334.222.526.222.19 0 .388-.074.528-.22.91-.922 1.476-2.202 1.476-3.606 0-1.41-.567-2.69-1.476-3.61h.002zm1.71-1.732c-.294-.296-.76-.296-1.053 0-.294.296-.293.772 0 1.066 1.08 1.096 1.754 2.602 1.754 4.273s-.667 3.176-1.753 4.273c-.294.294-.294.77 0 1.067.142.146.337.222.53.222.19 0 .386-.076.526-.222 1.35-1.366 2.19-3.257 2.19-5.34-.008-2.08-.843-3.975-2.194-5.34z"/></svg>',
    AUDIO_OFF: '<svg viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path d="M1 5.366v5.294c0 .177.142.32.317.32h2.89c.093 0 .18.034.254.093l4.505 3.743c.16.135.4.018.402-.19l.002-13.25c0-.21-.243-.325-.403-.193L4.47 4.923c-.077.064-.173.098-.27.098H1.33c-.235 0-.33.17-.33.346z"/></svg>',
  },

  IDLE_TIMEOUT: 2000,

  Defaults: {
    controls: 1,
    layoutControls: null,
    updateControls: null,
    pauseOnClick: true,
  },

  Controls: {
    NONE: 0,
    INLINE_PROGRESS: 1,
    STACKED_PROGRESS: 2,
    CUSTOM: 3,
  },

  VideoEvents: {
    LOADED_METADATA: {
      name: 'loadedmetadata',
      readyState: 1,
    },
    LOADED_DATA: {
      name: 'loadeddata',
      readyState: 2,
    },
    CAN_PLAY: {
      name: 'canplay',
      readyState: 3,
    },
    CAN_PLAYTHROUGH: {
      name: 'canplaythrough',
      readyState: 4,
    },
  },
};
