const OdoShare = window.OdoShare;

(function example1() {
  const share = document.getElementById('example-1-share');
  const urlField = document.getElementById('example-1-url');
  const serviceField = document.getElementById('example-1-service');

  share.addEventListener('click', (evt) => {
    evt.preventDefault();

    OdoShare.share({
      service: serviceField.value,
      data: {
        url: urlField.value,
      },
    });
  });
}());

(function example2() {
  const share = document.getElementById('example-2-share');

  OdoShare.add({
    element: share,
    before(/* output */) {
      // Perform something asynchronous.
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    },
  });
}());

(function example3() {
  const share = document.getElementById('example-3-share');

  OdoShare.add({
    element: share,
    before(/* output */) {
      // decodeURIComponent(output.params.url) => "http://www.odopod.com"

      // Rewrite the data before we perform the share.
      return {
        url: 'http://odopod.com',
      };
    },
    after(/* output */) {
      // decodeURIComponent(output.params.url) => "http://odopod.com"
    },
  });
}());

(function example4() {
  const share = document.getElementById('example-4-share');

  OdoShare.add({
    element: share,
    before() {
      // eslint-disable-next-line no-alert
      if (confirm('Are you sure you want to share this page?')) {
        return null;
      }

      // Halt the share process.
      return false;
    },
  });
}());
