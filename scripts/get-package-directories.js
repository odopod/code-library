const fs = require('fs');
const path = require('path');

module.exports = new Promise((resolve, reject) => {
  fs.readdir(path.join(process.cwd(), 'packages'), (err, files) => {
    if (err) {
      reject(err);
    } else {
      resolve(files.filter(dirname => dirname.startsWith('odo-')));
    }
  });
});
