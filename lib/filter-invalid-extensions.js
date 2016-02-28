const path = require('path');

module.exports = function (instance, files) {
  if (!instance.validExtensions.length) { return files; }
  return files.filter(file => {
    return instance.validExtensions.indexOf(path.extname(file)) !== -1;
  });
};
