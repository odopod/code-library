/* eslint-disable */

window.OdoVideo = function (element, options) {
  this.element = element;
  this.videoEl = this._findVideoElement();
};

window.OdoVideo.prototype.play = function () {
  return this.videoEl.play();
};

window.OdoVideo.prototype.pause = function () {
  this.videoEl.pause();
};

window.OdoVideo.prototype._findVideoElement = function () {
  return this.element.getElementsByTagName('video')[0];
};

window.OdoVideo.prototype.getVideoElement = function () {
  return this.videoEl;
};

window.OdoVideo.prototype.dispose = function () {
  this.element = null;
  this.videoEl = null;
};

window.OdoVideo.prototype.listenOnData = function (evt, cb) {
  cb();
};

window.OdoVideo.autoplay = Promise.resolve(true);

window.OdoVideo.support = false;
window.OdoVideo.Controls = {
  NONE: 'none',
};
window.OdoVideo.VideoEvents = {
  LOADED_DATA: {
    name: 'loadeddata',
    readyState: 2,
  },
};
window.OdoVideo.ControlsCreator = function () {};
