(function () {
  'use strict';

  var OdoShare = window.OdoShare;

  (function example1() {
    var share = document.getElementById('example-1-share');
    var urlField = document.getElementById('example-1-url');
    var serviceField = document.getElementById('example-1-service');

    share.addEventListener('click', function (evt) {
      evt.preventDefault();

      OdoShare.share({
        service: serviceField.value,
        data: {
          url: urlField.value
        }
      });
    });
  })();

  (function example2() {
    var share = document.getElementById('example-2-share');

    OdoShare.add({
      element: share,
      before: function before() /* output */{
        // Perform something asynchronous.
        return new Promise(function (resolve) {
          setTimeout(resolve, 1000);
        });
      }
    });
  })();

  (function example3() {
    var share = document.getElementById('example-3-share');

    OdoShare.add({
      element: share,
      before: function before() /* output */{
        // decodeURIComponent(output.params.url) => "http://www.odopod.com"

        // Rewrite the data before we perform the share.
        return {
          url: 'http://odopod.com'
        };
      },
      after: function after() /* output */{
        // decodeURIComponent(output.params.url) => "http://odopod.com"
      }
    });
  })();

  (function example4() {
    var share = document.getElementById('example-4-share');

    OdoShare.add({
      element: share,
      before: function before() {
        // eslint-disable-next-line no-alert
        if (confirm('Are you sure you want to share this page?')) {
          return null;
        }

        // Halt the share process.
        return false;
      }
    });
  })();

}());
