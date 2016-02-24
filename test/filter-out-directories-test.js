const assert = require('chai').assert;
const filterOutDirectories = require('../lib/filter-out-directories');
const mock = require('mock-fs');
const fs = require('fs');

describe('filterOutDirectories', () => {

  beforeEach(() => {
    mock({
      'file.txt': 'contents',
      'directory': {}
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('should filter out directories via a promise', (done) => {

    fs.readdir('./', (error, files) => {
      filterOutDirectories('./', files).then(files => {
        assert.notInclude(files, 'directory');
        done();
      }).catch(done);
    });

  });

  it('should filter out directories via a callback', (done) => {

    fs.readdir('./', (error, files) => {
      filterOutDirectories('./', files, results => {
        assert.notInclude(results, 'directory');
        done();
      });
    });

  });

});
