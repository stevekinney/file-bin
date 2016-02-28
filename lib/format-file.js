const fs = require('fs');

module.exports = function (fileName, content, stats) {
  var statistics = {
    id: fileName,
    content: content.toString()
  };

  if (stats instanceof fs.Stats) {
    statistics.lastModified =  new Date(stats.mtime);
    statistics.birthTime = new Date(stats.birthtime);
    statistics.lastAccessed =  new Date(stats.atime);
  }

  return statistics;
};
