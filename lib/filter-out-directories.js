const fs = require('fs');
const path = require('path');
const async = require('async');
if (!Promise) { Promise = require('rsvp').Promise; }

module.exports = function (base, files, callback) {
  return new Promise((resolve, reject) => {
    async.filter(files, function (file, cb) {
      var fullPath = path.join(base, file);
      fs.stat(fullPath, function (error, stats) {
        if (error) { reject(error); }
        cb(stats.isFile());
      });
    }, function (results) {
      if (typeof callback === 'function') { callback(results); };
      return resolve(results);
    });
  });
};
