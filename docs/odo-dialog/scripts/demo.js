(function () {
  'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  /* eslint-disable no-console */

  var OdoDialog = window.OdoDialog;

  var defaultDialog = new OdoDialog(document.getElementById('default'));

  defaultDialog.on(OdoDialog.EventType.OPENED, function () {
    console.log('default dialog opened');
  });

  defaultDialog.on(OdoDialog.EventType.CLOSED, function () {
    console.log('default dialog closed');
  });

  defaultDialog.on(OdoDialog.EventType.TRIGGER_CLICKED, function (triggerElement) {
    console.log('dialog about to open because you clicked:', triggerElement);
  });

  var styledDialog = new OdoDialog(document.getElementById('styled'));

  var animationChanger = new OdoDialog(document.getElementById('animation-changer'));

  var modal = new OdoDialog(document.getElementById('modal-dialog'), {
    dismissable: false
  });

  var button = modal.element.querySelector('button');
  button.addEventListener('click', function () {
    modal.close();
  });

  var scrollable = new OdoDialog(document.getElementById('scrollable-region'), {
    scrollableElement: '.my-list'
  });

  var fullscreen = new OdoDialog(document.getElementById('fullscreen'));
  var inception = new OdoDialog(document.getElementById('inception'));

  window.defaultDialog = defaultDialog;
  window.styledDialog = styledDialog;
  window.animationChanger = animationChanger;
  window.modal = modal;
  window.scrollable = scrollable;
  window.fullscreen = fullscreen;
  window.inception = inception;

  // Change the class applied to the animation-changer dialog.
  var select = document.querySelector('#animation-select');
  animationChanger.element.classList.add(select.value);
  select.addEventListener('change', function () {
    var _animationChanger$ele;

    var classes = Array.from(select.options, function (opt) {
      return opt.value;
    });
    (_animationChanger$ele = animationChanger.element.classList).remove.apply(_animationChanger$ele, toConsumableArray(classes));
    animationChanger.element.classList.add(select.value);
  });

  // Normally, we would use @odopod/odo-scroll-animation for the scroll listener.

  var ScrollToCloseDialog = function (_OdoDialog) {
    inherits(ScrollToCloseDialog, _OdoDialog);

    function ScrollToCloseDialog(element, options) {
      classCallCheck(this, ScrollToCloseDialog);

      var _this = possibleConstructorReturn(this, _OdoDialog.call(this, element, options));

      _this._onScroll = _this._onScroll.bind(_this);
      _this._onOpened = _this._onOpened.bind(_this);
      _this._onClosed = _this._onClosed.bind(_this);
      _this._saveCloseOffset = _this._saveCloseOffset.bind(_this);
      _this.on(OdoDialog.EventType.OPENED, _this._onOpened);
      _this.on(OdoDialog.EventType.CLOSED, _this._onClosed);
      return _this;
    }

    ScrollToCloseDialog.prototype._saveCloseOffset = function _saveCloseOffset() {
      var viewportHeight = window.innerHeight;

      // The extra margin is on the inner element, so it's included in the height
      // of the content element.
      var contentHeight = this.element.scrollHeight - viewportHeight;

      this.closeOffset = contentHeight - Math.round(viewportHeight / ScrollToCloseDialog.VIEWPORT_DIVISOR);
    };

    ScrollToCloseDialog.prototype._onOpened = function _onOpened() {
      this._saveCloseOffset();
      this.element.addEventListener('scroll', this._onScroll);
      window.addEventListener('resize', this._saveCloseOffset);
    };

    ScrollToCloseDialog.prototype._onClosed = function _onClosed() {
      this.element.removeEventListener('scroll', this._onScroll);
      window.removeEventListener('resize', this._saveCloseOffset);
    };

    ScrollToCloseDialog.prototype._onScroll = function _onScroll() {
      if (this.element.scrollTop > this.closeOffset) {
        this.close();
      }
    };

    ScrollToCloseDialog.prototype.dispose = function dispose() {
      this.off(OdoDialog.EventType.OPENED, this._onOpened);
      this.off(OdoDialog.EventType.CLOSED, this._onClosed);
      _OdoDialog.prototype.dispose.call(this);
    };

    return ScrollToCloseDialog;
  }(OdoDialog);

  // Require the user to scroll the content + x-1/x of the extra space.


  ScrollToCloseDialog.VIEWPORT_DIVISOR = 6;

  var scrollToClose = new ScrollToCloseDialog(document.getElementById('scroll-to-close'));

  window.scrollToClose = scrollToClose;

}());
