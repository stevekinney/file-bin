'use strict';

const EventEmitter = require('events');
const util = require('util');

const fs = require('fs');
const path = require('path');
const async = require('async');

const filterOutDirectories = require('./lib/filter-out-directories');
const formatFile = require('./lib/format-file');
const filterInvalidExtensions = require('./lib/filter-invalid-extensions');

if (!Promise) { Promise = require('rsvp').Promise; }

function FileBin(baseDirectory, validExtensions) {
  if (!(this instanceof FileBin)) {
    throw new Error('Must be instantiated with the "new" keyword.');
  }

  EventEmitter.call(this);

  this.base = baseDirectory || __dirname;
  this.validExtensions = validExtensions || [];

}

util.inherits(FileBin, EventEmitter);

FileBin.prototype.find = function (fileName) {
  var fullPath = path.join(this.base, fileName);
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, (error, file) => {
      fs.stat(fullPath, (err, stats) =>  {
        if (error) { return reject(error); }
        return resolve(formatFile(fileName, file, stats));
      });
    });
  });
};


FileBin.prototype.list = function () {
  return new Promise((resolve, reject) => {
    fs.readdir(this.base, (error, files) => {
      if (error) { return reject(error); }

      files = filterInvalidExtensions(this, files);

      return filterOutDirectories(this.base, files).then(resolve);
    });
  });
};

FileBin.prototype.all = function () {
  return new Promise((resolve, reject) => {
    this.list().then(fileNames => {
      var promises = fileNames.map(this.find, this);
      Promise.all(promises).then(resolve);
    }).catch(reject);
  });
};

FileBin.prototype.write = function (fileName, data) {
  var fullPath = path.join(this.base, fileName);
  return new Promise((resolve, reject) => {
    fs.writeFile(fullPath, data, (error) => {
      if (error) { reject(error); }
      resolve(formatFile(fileName, data));
    });
  });
};

FileBin.prototype.destroy = function (fileName) {
  return new Promise((resolve, reject) => {
    fs.unlink(path.join(this.base, fileName), (error) => {
      if (error) { return reject(error); }
      resolve( { id: fileName } );
    });
  });
};

FileBin.prototype.rename = function (oldFileName, newFileName) {
  var oldFullPath = path.join(this.base, oldFileName);
  var newFullPath = path.join(this.base, newFileName);
  return new Promise((resolve, reject) => {
    fs.rename(oldFullPath, newFullPath, (error) => {
      if (error) { reject(error); }
      this.find(newFileName).then((file) => {
        return resolve(file, newFullPath, oldFullPath);
      });
    });
  });
};

FileBin.prototype.copy = function (sourceFile, copyFile) {
  return new Promise((resolve, reject) => {
    this.find(sourceFile).then(source => {
      this.write(copyFile, source.content).then(copy => {
        resolve(copy);
      }).catch(reject);
    }).catch(reject);
  });
};

FileBin.prototype.getBaseDirectory = function() {
  return this.base;
};

FileBin.prototype.setBaseDirectory = function (directoryName) {
  if (!directoryName){ throw new Error('Directory name can\'t be blank.'); }

  let oldDirectoryName = this.getBaseDirectory();

  this.base = directoryName;
  this.emit('base-directory-changed', this.base, oldDirectoryName)

  return this;
};

module.exports = FileBin;
