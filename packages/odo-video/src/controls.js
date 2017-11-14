import settings from './settings';

class Controls {
  createElement(type, options) {
    const el = document.createElement(type);
    Object.keys(options).forEach((k) => {
      el[k] = options[k];
    });

    return el;
  }

  createElements() {
    return {
      controls: this.createElement('div', {
        className: settings.Classes.CONTROLS,
      }),
      playToggle: this.createElement('button', {
        className: settings.Classes.PLAY_TOGGLE,
        title: Controls.LABEL.PLAY_TOGGLE,
      }),
      playControl: this.createElement('span', {
        className: settings.Classes.PLAY_CONTROL,
      }),
      pauseControl: this.createElement('span', {
        className: settings.Classes.PAUSE_CONTROL,
      }),
      progressContainer: this.createElement('div', {
        className: settings.Classes.PROGRESS_CONTAINER,
      }),
      progressHolder: this.createElement('div', {
        className: settings.Classes.PROGRESS_HOLDER,
      }),
      buffer: this.createElement('div', {
        className: settings.Classes.BUFFER,
      }),
      progress: this.createElement('div', {
        className: settings.Classes.PROGRESS,
      }),
      currentTime: this.createElement('div', {
        className: settings.Classes.CURRENT_TIME,
      }),
      volumeToggle: this.createElement('button', {
        className: settings.Classes.VOLUME,
        title: Controls.LABEL.VOLUME,
      }),
      muteControl: this.createElement('span', {
        className: settings.Classes.MUTE_CONTROL,
        innerHTML: settings.Icons.AUDIO_ON,
      }),
      unmuteControl: this.createElement('span', {
        className: settings.Classes.UNMUTE_CONTROL,
        innerHTML: settings.Icons.AUDIO_OFF,
      }),
      fullScreenToggle: this.createElement('button', {
        className: settings.Classes.FULLSCREEN,
        title: Controls.LABEL.FULLSCREEN,
      }),
      enterFullscreen: this.createElement('span', {
        className: settings.Classes.FULLSCREEN_CONTROL,
        innerHTML: settings.Icons.FULLSCREEN,
      }),
      exitFullscreen: this.createElement('span', {
        className: settings.Classes.EXIT_FULLSCREEN_CONTROL,
        innerHTML: settings.Icons.EXIT_FULLSCREEN,
      }),
      flexibleSpace: this.createElement('div', {
        className: settings.Classes.FLEXIBLE_SPACE,
      }),
    };
  }

  create(style, customFn) {
    const elements = this.createElements();

    elements.playToggle.appendChild(elements.playControl);
    elements.playToggle.appendChild(elements.pauseControl);

    elements.volumeToggle.appendChild(elements.muteControl);
    elements.volumeToggle.appendChild(elements.unmuteControl);

    elements.fullScreenToggle.appendChild(elements.enterFullscreen);
    elements.fullScreenToggle.appendChild(elements.exitFullscreen);

    elements.progressHolder.appendChild(elements.buffer);
    elements.progressHolder.appendChild(elements.progress);
    elements.progressContainer.appendChild(elements.progressHolder);

    switch (style) {
      case settings.Controls.INLINE_PROGRESS:
        this._createInline(elements);
        break;
      case settings.Controls.NONE:

        // When no controls are specified, create them anyways. It's easier to hide
        // the controls and still have them in the DOM than it is to many if-statements
        // checking if the controls exist before modifying them.
        this._createInline(elements);
        elements.controls.classList.add(settings.Classes.CONTROLS_HIDDEN);
        break;
      case settings.Controls.STACKED_PROGRESS:
        this._createStacked(elements);
        break;
      case settings.Controls.CUSTOM:
        customFn(elements);
        break;
      // no default
    }

    return elements.controls;
  }

  _createInline(elements) {
    elements.controls.appendChild(elements.playToggle);
    elements.controls.appendChild(elements.progressContainer);
    elements.controls.appendChild(elements.currentTime);
    elements.controls.appendChild(elements.volumeToggle);
    elements.controls.appendChild(elements.fullScreenToggle);
  }

  _createStacked(elements) {
    elements.controls.appendChild(elements.progressContainer);
    elements.controls.appendChild(elements.playToggle);
    elements.controls.appendChild(elements.flexibleSpace);
    elements.controls.appendChild(elements.currentTime);
    elements.controls.appendChild(elements.volumeToggle);
    elements.controls.appendChild(elements.fullScreenToggle);
    elements.controls.classList.add(settings.Classes.CONTROLS_STACKED);
  }
}

Controls.LABEL = {
  PLAY_TOGGLE: 'toggle video playback.',
  VOLUME: 'toggle mute for video.',
  FULLSCREEN: 'toggle video fullscreen mode.',
};

export default Controls;
