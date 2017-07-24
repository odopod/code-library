(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OdoShare = factory());
}(this, (function () { 'use strict';

/**
 * Facebook
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - [u=window.location.href] - URL of the page to share
 *
 * @see {@link https://dev.twitter.com/web/tweet-button#properties}
 */
var facebook = {
  BASE: 'http://www.facebook.com/sharer.php',
  params: {
    u: {
      friendly: 'url',
      parse: encodeURIComponent,
      default: window.location.href
    }
  }
};

/**
 * Implodes an array into a comma-separated list, or returns the input
 * if the input is not an array.
 *
 * @param {string|array} input - The string or array to implode.
 * @return {string}
 */
function implode(input) {
  if (typeof input !== 'string') {
    input = input.join(); // eslint-disable-line no-param-reassign
  }

  return encodeURIComponent(input);
}

/**
 * Implodes an array or string as well as strips a token from
 * the string or each item in the array. This is uesful for removing hastags or
 * @'s.
 *
 * @param {string|array} input - The string or array to implode.
 * @param {string} stripToken - The token to strip.
 * @return {string}
 */
function implodeAndStrip(input, stripToken) {
  if (typeof input === 'string') {
    input = input.replace(', ', ',').split(','); // eslint-disable-line no-param-reassign
  }

  input = input.map(function (item) {
    return item.replace(stripToken, '');
  }).join(); // eslint-disable-line no-param-reassign

  return encodeURIComponent(input);
}

/**
 * Twitter
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - [url=window.location.href] - URL of the page to share
 *  - via - Screen name of the user to attribute the
 *    Tweet to
 *  - text - Default Tweet text
 *  - related - Related accounts
 *  - [lang='en'] - The language for the Tweet Button
 *  - counturl - URL to which your shared URL resolves
 *  - hashtags - Comma separated hashtags appended to tweet text
 *
 * @see {@link https://dev.twitter.com/web/tweet-button#properties}
 */
var twitter = {
  BASE: 'https://twitter.com/intent/tweet',
  params: {
    url: {
      friendly: 'url',
      parse: encodeURIComponent,
      default: window.location.href
    },
    via: {
      friendly: 'via',
      parse: function parse(input) {
        return encodeURIComponent(input.replace('@', ''));
      }
    },
    text: {
      friendly: 'text',
      parse: encodeURIComponent
    },
    related: {
      friendly: 'recommend',
      parse: function parse(input) {
        return implodeAndStrip(input, '@');
      }
    },
    lang: {
      friendly: 'language',
      parse: encodeURIComponent,
      default: 'en'
    },
    counturl: {
      friendly: 'resolvesTo',
      parse: encodeURIComponent
    },
    hashtags: {
      friendly: 'hashtags',
      parse: function parse(input) {
        return implodeAndStrip(input, '#');
      }
    }
  }
};

/**
 * Google Plus
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - url - URL of the page to share
 */
var googleplus = {
  BASE: 'https://plus.google.com/share',
  features: 'width=600,height=460,menubar=no,location=no,status=no',
  params: {
    url: {
      friendly: 'url',
      parse: encodeURIComponent,
      default: window.location.href
    }
  }
};

/**
 * Tumblr
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - to
 *  - cc
 *  - bcc
 *  - subject
 *  - body
 */
var tumblr = {
  BASE: 'https://www.tumblr.com/widgets/share/tool',
  params: {
    url: {
      friendly: 'url',
      parse: encodeURI,
      default: window.location.href
    },
    title: {
      friendly: 'title',
      parse: encodeURI,
      default: document.title
    },
    description: {
      friendly: 'description',
      parse: encodeURI
    }
  }
};

/**
 * LinkedIn
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - mini
 *  - ro
 *  - title - Title of the page to share
 *  - url - URL of the page to share
 *
 * @see {@link https://www.linkedin.com/static?key=browser_bookmarklet}
 */
var linkedin = {
  BASE: 'http://www.linkedin.com/shareArticle',
  features: 'width=520,height=570,toolbar=0,location=0,status=0,scrollbars=yes',
  params: {
    mini: {
      friendly: 'mini',
      default: true
    },
    ro: {
      friendly: 'ro',
      default: false
    },
    title: {
      friendly: 'title',
      parse: encodeURIComponent,
      default: document.title
    },
    url: {
      friendly: 'url',
      parse: encodeURIComponent,
      default: window.location.href
    }
  }
};

/**
 * LinkedIn
 *
 * Sharing service configuration
 *
 * Supported parameters:
 *  - to
 *  - cc
 *  - bcc
 *  - subject
 *  - body
 */
var email = {
  BASE: 'mailto:',
  params: {
    to: {
      friendly: 'to',
      parse: implode
    },
    cc: {
      friendly: 'cc',
      parse: implode
    },
    bcc: {
      friendly: 'bcc',
      parse: implode
    },
    subject: {
      friendly: 'subject',
      parse: encodeURIComponent,
      default: document.title
    },
    body: {
      friendly: 'body',
      parse: encodeURIComponent,
      default: window.location.href
    }
  }
};



var services = Object.freeze({
	facebook: facebook,
	twitter: twitter,
	googleplus: googleplus,
	tumblr: tumblr,
	linkedin: linkedin,
	email: email
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * Share component.
 *
 * @author Nathan Buchar <nathan.buchar@odopod.com>
 */

/**
 * The window name for all share windows spawned by Share
 */
var WINDOW_NAME = 'ShareWindow';
var noop = function noop() {};

var Share = function () {
  /**
   * Prepares share components within the DOM.
   *
   * @constructor
   */
  function Share() {
    classCallCheck(this, Share);

    this.ClassName = {
      BASE: 'odo-share'
    };

    this.services = services;

    // An array of share data objects. These objects may contain information
    // regarding the root element, and beforeSend and afterSend functionality.
    this.shares = [];

    this._registerShareButtons();
  }

  /**
   * This registers all Share components that are
   * rendered to the DOM on page load. This will not prepare Share components
   * that are added to the DOM dynamically. These must be registered using the
   * public `add` method (@see add).
   *
   * @see _.add
   */


  Share.prototype._registerShareButtons = function _registerShareButtons() {
    var selector = '.' + this.ClassName.BASE;
    var shareElements = Array.from(document.querySelectorAll(selector));

    // Pass an array of objects to the `add` method. These objects simply contain
    // an `element` key that references the DOM element.
    this.add(shareElements.map(function (element) {
      return { element: element };
    }));
  };

  /**
   * Normalize an option.
   * @param {Object|Element} option Element or option object.
   * @return {?Object}
   */


  Share.prototype._normalizeOption = function _normalizeOption(option) {
    if (option && option.nodeType === 1) {
      // A DOM element was passed in.
      return { element: option };
    } else if (option && option.element) {
      // A data object was passed in.
      return option;
    }

    return null;
  };

  /**
   * Normalize the options to an array of objects to add.
   * @param {Element|Array|Object} options An array of option objects, an option
   *     object, or an element.
   * @return {Array.<Object>} An array of new share data.
   */


  Share.prototype._normalizeOptions = function _normalizeOptions(options) {
    var items = void 0;

    if (Array.isArray(options)) {
      items = options.map(this._normalizeOption, this);
    } else {
      items = [this._normalizeOption(options)];
    }

    return items.filter(function (item) {
      return !!item;
    });
  };

  /**
   * Iterates through each element passed into the method, prepares it and
   * pushes the completed data object to the `shares` array.
   *
   * @param {Element|Array|Object} options An array of option objects, an option
   *     object, or an element.
   */


  Share.prototype.add = function add(options) {
    var _this = this;

    var items = this._normalizeOptions(options);
    var newShares = [];

    items.forEach(function (data) {
      data.listener = function (evt) {
        evt.preventDefault();
        _this.share(data);
      };

      data.element.addEventListener('click', data.listener);

      _this.shares.push(data);
      newShares.push(data);
    });

    return newShares;
  };

  /**
   * Performs the share operation. This will call the `before` method, reapply
   * any modified input, open the window, then perform the `after` functionality.
   *
   * @param {object} input - The input data for the share as defined by the user.
   * @param {object} outout - The output data for the share as generated by the
   *   Share internals, such as the query  string, window properties, and
   *   parsed paramaters.
   * @param {object} service - The service configuration. @see ./services
   */


  Share.prototype._performShare = function _performShare(input, output, service) {
    var _this2 = this;

    var transformedData = input.before.call(this, output);

    var action = function action(arg) {
      var windowObject = void 0;
      var options = void 0;
      var parsedOptions = output;

      // Reapply new data if applicable.
      if (arg !== undefined && arg !== null) {
        if (arg === false) {
          return;
        } else if ('data' in arg) {
          options = Object.assign(input, arg);
        } else {
          options = Object.assign(input, { data: arg });
        }

        parsedOptions = Share._parseInput(options, service);
      }

      if (service === _this2.services.email) {
        // Prevent opening empty window if sharing via email.
        window.location.assign(parsedOptions.url);
      } else {
        // Open the share window.
        windowObject = Share._open(parsedOptions.url, parsedOptions.name, service.Features);
      }

      // Call the `after` functionality.
      input.after.call(_this2, parsedOptions, windowObject);
    };

    // Return a promise from the `before` method to do something async.
    if (transformedData && transformedData.then) {
      transformedData.then(action);
    } else {
      action(transformedData);
    }
  };

  /**
   * Gets the service configuration from the given string.
   *
   * @param {object} data - Share input data.
   * @return {object|undefined} - The service configuration, or void if no service was
   *   defined.
   */


  Share.prototype._getService = function _getService(data) {
    var service = data.service || data.element && data.element.getAttribute('data-service');

    if (this.services[service]) {
      return this.services[service];
    }

    return undefined;
  };

  /**
   * Parses the given input and exports the technical output based
   * on the service schema. This includes items such as the query string, window
   * data, and params.
   *
   * @param {object} input - Share input data.
   * @param {object} service - The service configuration.
   * @return {object} output - The parsed output.
   * @see _parseparamsFromInput
   * @see _getQueryString
   * @see _constructWindowData
   */


  Share._parseInput = function _parseInput(input, service) {
    var params = Share._parseParamsFromInput(input, service);
    var queryString = Share._getQueryString(params);

    return {
      params: params,
      queryString: queryString,
      url: service.BASE + queryString,
      name: WINDOW_NAME
    };
  };

  /**
   * Parse the parameters from the given input and service schema. Defining a
   * service schema allows us to always use "url" for all our share buttons,
   * regardless of their service, as long as the proper key is defined in its
   * respective parameter schema.
   *
   * If a parameter has a `parse` method within the object, this method will be
   * called and will pass in the input value for that particular parameter. This
   * allows us to customize how a parameter is parsed on a per-parameter and per-
   * service basis without adding needless code within conditional blocks below.
   *
   * Order of priorities:
   *   input value > `data` attributes (if applicable) > default > `void`
   *
   * @param {object} input - Share input data.
   * @param {object} service - The service configuration.
   * @return {object} obj - The parsed parameters.
   */


  Share._parseParamsFromInput = function _parseParamsFromInput(input, service) {
    var elementData = input.element ? input.element.dataset : {};
    var data = input.data;
    var obj = {};

    // Iterate through each valid paramater for the given service.
    Object.keys(service.params).forEach(function (param) {
      var config = service.params[param];
      var friendly = config.friendly;
      var value = null;

      // Check if the parameter was defined when `share` was called.
      if (friendly in data) {
        value = data[friendly];
      } else if (friendly in elementData) {
        // Check if the parameter is defined as a data attribute on the element.
        value = elementData[friendly];
      } else if (config.default) {
        // The param was not defined; Check for default values.
        value = config.default;
      }

      if (value) {
        // Parse the parameter and set its value.
        obj[param] = (config.parse ? config.parse(value) : value).toString();
      }
    });

    return obj;
  };

  /**
   * Assembles the query string from an enumerated param object.
   *
   * For example { foo: 'bar', baz: 'qux' } => "?foo=bar&baz=qux"
   *
   * @param {object} data - Parameter data.
   * @return {string} query - The finalized query string.
   */


  Share._getQueryString = function _getQueryString(data) {
    var base = '';

    // The mailto: format requires the `to` to be first, before the `?`.
    if (data.to) {
      base = data.to;
      delete data.to;
    }

    var pairs = Object.keys(data).map(function (param) {
      return param + '=' + data[param];
    });
    return base + '?' + pairs.join('&');
  };

  /**
   * Opens a new browser window.
   *
   * @param {string} url - The URL to be loaded in the newly opened window.
   * @param {string} windowName - A string name for the new window. The name
   *   should not contain any whitespace characters. NOTE that windowName does not
   *   specify the title of the new window. If a window with the same name already
   *   exists, then the URL is loaded into the existing window.
   * @return {object|null} - A reference to the newly created window. If the call
   *   failed, it will be null. The reference can be used to access properties and
   *   methods of the new window provided it complies with Same origin policy
   *   security requirements.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/open}
   */


  Share._open = function _open(url, windowName) {
    var windowFeatures = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    return window.open(url, windowName, windowFeatures);
  };

  /**
   * Initiate sharing. Extend the default options, fetch the service,
   * parse the input, then perform the share.
   *
   * @example
   *   Share.share({
   *     service: 'twitter',
   *     data: {
   *       url: 'http://odopod.com/'
   *       text: 'Check this out!',
   *       via: 'Nurun',
   *       hashtags: ['rad', 'odoshare']
   *     }
   *   });
   *
   * @param {object} options - Share options.
   * @return {boolean} - Will return true if the share was successfull.
   */


  Share.prototype.share = function share(options) {
    var opts = Object.assign({}, Share.Options, options);

    // Fetch the service config from the string provided.
    var service = this._getService(opts);

    // The service could not be determined or was not defined; Exit early.
    if (!service) {
      return false;
    }

    // Parse the output (params, query string, etc) from the data provided.
    var output = Share._parseInput(opts, service);

    // Perform the share operation.
    this._performShare(opts, output, service);

    return true;
  };

  /**
   * Disposes of all references and event listeners to the share
   * button. To reverse this, you must call `.add` and pass in the element and
   * options again.
   *
   * @param {Element} element - A reference to the share button's element.
   * @return {number|undefined} - If a share button was disposed, this will return `1`,
   *   (the length of the number of items disposed of), otherwise this will not
   *   return.
   */


  Share.prototype.dispose = function dispose(element) {
    for (var i = 0; i < this.shares.length; i++) {
      var data = this.shares[i];
      if (data.element === element) {
        data.element.removeEventListener('click', data.listener);
        return this.shares.splice(i, 1).length;
      }
    }

    return undefined;
  };

  return Share;
}();

/**
 * Default share input options. These may be overwritten by the user.
 */


Share.Options = {
  data: {},
  before: noop,
  after: noop
};

var share = new Share();

return share;

})));
//# sourceMappingURL=odo-share.js.map
