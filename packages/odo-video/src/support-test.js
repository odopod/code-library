// Determine support for videos. From Modernizr source.
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/video.js

// Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
export default () => {
  const elem = document.createElement('video');
  let bool = !!elem.canPlayType;

  // IE9 Running on Windows Server 2008 can cause an exception to be thrown, bug #224
  // End of life for 'mainstream' WS2008 was 2015-1-13.
  /* istanbul ignore next */
  if (bool) {
    bool = new Boolean(bool); // eslint-disable-line no-new-wrappers
    bool.ogg = elem.canPlayType('video/ogg; codecs="theora"');

    // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
    bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"');
    bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"');
    bool.vp9 = elem.canPlayType('video/webm; codecs="vp9"');
    bool.hls = elem.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"');
  }

  return bool;
};
