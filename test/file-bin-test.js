const assert = require('chai').assert;
const FileBin = require('../index');
const mock = require('mock-fs');

describe('FileBin - Class', () => {

  it('should be a function', () => {
    assert.isFunction(FileBin);
  });

  it('should take two argument', () => {
    assert.equal(FileBin.length, 2);
  });

  it('should instantiate an object', () => {
    var instance = new FileBin();
    assert.isObject(instance);
  });

  it('should throw if called without the new keyword', () => {
    assert.throws(() => FileBin(), 'Must be instantiated with the "new" keyword');
  });

});

describe('fileBin - Instance', () => {

  beforeEach(() => {
    this.instance = new FileBin('/some/directory', ['.md', '.markdown', '.txt']);

    mock({
      '/some/directory': {
        'first-file.md': 'first file content',
        'second-file.markdown': 'second file content',
        'third-file.txt': 'third file content',
        'invalid.invalidext': 'invalid file content',
        'mockfile.md': {
          mockfile: mock.file({
           content: 'contents',
           atime: new Date(1),
           mtime: new Date(1),
           birthtime: new Date(1)
         })
       },
        'subdirectory': {}
      }
    });
  });

  afterEach(() => {
    mock.restore();
  });

  describe('#base', () => {

    it('should default to process.cwd()', () => {
      var instance = new FileBin();
      assert.equal(instance.base, process.cwd());
    });

    it('should use the first argument to FileBin as the base directory', () => {
      var instance = new FileBin('/some/directory');
      assert.equal(instance.base, '/some/directory');
    });

  });

  describe('#validExtensions', () => {

    it('stores validExtensions in an array', () => {
      assert.isArray(this.instance.validExtensions);
    });

    it('show take the second argument and store it in "valid extensions"', () => {
      var instance = new FileBin('/some/directory', ['md']);
      assert.deepEqual(instance.validExtensions, ['md']);
    });

    it('should default to an empty array', () => {
      var instance = new FileBin('/some/directory');
      assert.deepEqual(instance.validExtensions, []);
    });

  });

  describe('#find', () => {

    it('should have a #find method', () => {
      assert.isDefined(this.instance.find);
    });

     it('should return a thenable', () => {
       assert.isFunction(this.instance.find('first-file.md').then);
     });

    it('should resolve to have an id with the file name', (done) => {
      this.instance.find('first-file.md').then(file => {
        assert.isDefined(file.id, 'Result does not have a "id" property.');
        assert.equal(file.id, 'first-file.md');
        done();
      }).catch(done);
    });

    it('should resolve to have an "content" property with files content', (done) => {
      this.instance.find('first-file.md').then(file => {
        assert.isDefined(file.content, 'Result does not have a "content" property.');
        assert.equal(file.content, 'first file content');
        done();
      }).catch(done);
    });

    it('should throw an error if there is no file by that name', (done) => {
      this.instance.find('not-really-there.md').catch(error => {
        assert.equal(error.code, 'ENOENT');
        done();
      }).catch(done);
    });

    it('should have a lastModified attribute', (done) => {
      this.instance.find('first-file.md').then(file => {
        assert.isDefined(file.lastModified, 'Result does not have a "lastModified" property.');
        done();
      }).catch(done);
    });

    it('should have a birthTime attribute', (done) => {
      this.instance.find('first-file.md').then(file => {
        assert.isDefined(file.birthTime, 'Result does not have a "birthTime" property.');
        done();
      }).catch(done);
    });

    it('should have a lastAccessed attribute', (done) => {
      this.instance.find('first-file.md').then(file => {
        assert.isDefined(file.lastAccessed, 'Result does not have a "lastAccessed" property.');
        done();
      }).catch(done);
    });

  });

  describe('#list', () => {

    it('should have a #list method', () => {
      assert.isDefined(this.instance.list);
    });

    it('should return a thenable', () => {
      assert.isFunction(this.instance.list().then);
    });

    it('should resolve to array', (done) => {
      this.instance.list().then(files => {
        assert.isArray(files);
        done();
      }).catch(done);
    });

    it('should not include directories', (done) => {
      this.instance.list().then(files => {
        assert.notInclude(files, 'subdirectory');
        done();
      }).catch(done);
    });

    it('should not include with files with invalid extensions', (done) => {
      this.instance.list().then(files => {
        assert.notInclude(files, 'invalid.invalidext');
        done();
      }).catch(done);
    });

  });

  describe('#all', () => {

    it('should have a #all method', () => {
      assert.isDefined(this.instance.all);
    });

    it('should return a thenable', () => {
      assert.isFunction(this.instance.all().then);
    });

    it('should not include invalid file names', (done) => {
      this.instance.all().then(files => {
        var fileNames = files.map(file => file.id);
        assert.notInclude(files, 'invalid.invalidext');
        done();
      }).catch(done);
    });

    it('should resolve to objects that have "id" and "content" properties', (done) => {
      this.instance.all().then(files => {
        files.forEach(file => {
          assert.isDefined(file.id);
          assert.isDefined(file.content);
        });
        done();
      });
    });

  });

  describe('#write', () => {

    it('should have a #write method', () => {
      assert.isDefined(this.instance.write);
    });

    it('should return a thenable', () => {
      assert.isFunction(this.instance.write('test.md', 'wowow').then);
    });

    it('should write the file', (done) => {
      this.instance.write('test.md', 'wowow').then(file => {
        this.instance.list().then(fileNames => {
          assert.include(fileNames, 'test.md');
          done();
        });
      }).catch(done);
    });

  });

  describe('#rename', () => {
    it('should have a #rename method', () => {
      assert.isDefined(this.instance.rename);
    });

    it('should return a thenable', () => {
      assert.isFunction(this.instance.rename('test.md', 'wowow.md').then);
    });

    it('should rename the file', (done) => {
      this.instance.rename('first-file.md', 'wowowow.md').then(file => {
        this.instance.list().then(fileNames => {
          assert.include(fileNames, 'wowowow.md');
          assert.notInclude(fileNames, 'first-file.md');
          done();
        });
      }).catch(done);
    });

    it('returns the actual file', (done) => {
      this.instance.rename('first-file.md', 'renamed-wowow.md').then(file => {
        assert.equal(file.id, 'renamed-wowow.md');
        assert.equal(file.content, 'first file content');
        done();
      }).catch(done);
    });

  });

  describe('#getBaseDirectory', () => {

    it('should have a #getBaseDirectory method', () => {
      assert.isDefined(this.instance.getBaseDirectory);
    });

    it('should return the base directory', () => {
      assert.equal('/some/directory', this.instance.getBaseDirectory());
    });
  });

   describe('#copy', () => {

     it('should have a #copy method', () => {
       assert.isDefined(this.instance.copy);
     });

     it('should return a thenable', () => {
       assert.isFunction(this.instance.copy('first-file.md', 'copy.md').then);
     });

     it('should copy the file', (done) => {
       this.instance.copy('first-file.md', 'test-copy.md').then(file => {
         this.instance.list().then(fileNames => {
           assert.include(fileNames, 'test-copy.md');
           done();
         });
       }).catch(done);
     });

     it('should have same contents of source file', (done) => {
       this.instance.copy('first-file.md', 'first-file-copy.md').then(copy => {
         this.instance.find('first-file.md').then(original => {
           assert.equal(copy.content, original.content);
           console.log(copy.content, original.content);
           done();
         }).catch(done);
       }).catch(done);
     });

   });

   describe('#copy', () => {

     it('should have a #copy method', () => {
       assert.isDefined(this.instance.copy);
     });

     it('should return a thenable', () => {
       assert.isFunction(this.instance.copy('first-file.md', 'copy.md').then);
     });

     it('should copy the file', (done) => {
       this.instance.copy('first-file.md', 'test-copy.md').then(file => {
         this.instance.list().then(fileNames => {
           assert.include(fileNames, 'test-copy.md');
           done();
         });
       }).catch(done);
     });

     it('should have same contents of source file', (done) => {
       this.instance.copy('first-file.md', 'first-file-copy.md').then(copy => {
         this.instance.find('first-file.md').then(original => {
           assert.equal(copy.content, original.content);
           console.log(copy.content, original.content);
           done();
         }).catch(done);
       }).catch(done);
     });

   });

   describe('#getBaseDirectory', () => {

     it('should have a #getBaseDirectory method', () => {
       assert.isDefined(this.instance.getBaseDirectory);
     });

     it('should return the base directory', () => {
       assert.equal('/some/directory', this.instance.getBaseDirectory());
     });
   });

   describe('#setBaseDirectory', () => {
     it('should have a #setBaseDirectory method', () => {
       assert.isDefined(this.instance.setBaseDirectory);
     });

     it('should set the Base Directory', () => {
       assert.equal(this.instance.base, '/some/directory');
       this.instance.setBaseDirectory('/new/directory');
       assert.equal(this.instance.base, '/new/directory');
     });
   });

   describe('#destroy', () => {

     it('should have a #destroy method', () => {
       assert.isDefined(this.instance.destroy);
     });

     it('should return a thenable', () =>  {
       assert.isFunction(this.instance.destroy().then);
     });

     it('should destroy the file', (done) => {
       this.instance.destroy('first-file.md').then(file => {
         this.instance.list().then(fileNames => {
           assert.notInclude(fileNames, 'first-file.md');
           done();
         });
       }).catch(done);
     });
   });

   describe('#rename', () => {
      it('should have a #rename method', () => {
        assert.isDefined(this.instance.rename);
      });

      it('should return a thenable', () => {
        assert.isFunction(this.instance.rename('test.md', 'wowow.md').then);
      });

      it('should rename the file', (done) => {
        this.instance.rename('first-file.md', 'wowowow.md').then(file => {
          this.instance.list().then(fileNames => {
            assert.include(fileNames, 'wowowow.md');
            assert.notInclude(fileNames, 'first-file.md');
            done();
          });
        }).catch(done);
      });

      it('returns the actual file', (done) => {
        this.instance.rename('first-file.md', 'renamed-wowow.md').then(file => {
          assert.equal(file.id, 'renamed-wowow.md');
          assert.equal(file.content, 'first file content');
          done();
        }).catch(done);
      });

   });

});
