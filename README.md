# File Bin

File Bin is an exercise in writing an abstraction for file system access in [Node.js].

[Node.js]: http://nodejs.org

## Why does this even exist?

We're doing a project at the [Turing School of Software and Design][turing] building a note-taking application using Ember and Electron. Ember Data was designed to work with APIs—not the filesystem.

- `fs.readdir` returns an array of strings. APIs normally return an array of objects.
- You have to distinguish between directories and files. `fs.read` doesn't work on directories.
- Ember really likes promises and Node really likes callbacks. It would be nice to have an abstraction to bridge that gap.
- We don't want to open weird Vim temp files and stuff like that. It would be cool if we could pass in an array of file extensions that we'd like to return.

[turing]: http://turing.io

## How does it work?

### Instantiating an Instance

```js
const FileBin = require('file-bin');

let fileBin = new FileBin('/base-directory', ['.md', '.txt']);
```

The constructor takes two arguments:

1. The base directory where we want to look for files.
2. Valid extensions.

You can leave either blank. If you do, then it will default to `process.cwd()` and allowing all extensions respectively.

### Finding a File

Instances have a `#find` method that will look for a file with a given file name and return a promise.

```js
fileBin.find('README.md').then(file => {
  console.log(file);
});
```

The resuling file has two properties: `id` and `content`. `id` is the file name. `content` is the content of the file.

### Finding All of the Files

`#all` will find all of the files in the base directory. If you provided an array of valid extensions, then it will filter by those extenions. The resulting files are fulling instantiated objects—just like `#find` above.

**Note**: At this moment, File Bin does not support subdirectories. They are omitted.

```js
fileBin.all().then(files => console.log(files));
```

### Writing a File

`#write` takes two arguments `fileName` and `content`. It will write the file to the filesystem and then return the object via a promise.

```js
fileBin.write('CONTRIBUTORS.md', 'Pull requests accepted')
       .then(file => console.log(file));
```

### Copying a File

`#copy` takes two arguments `sourceFile` and `copyFile`. It will write the copied file to the filesystem and then return the copy via a promise.

```js
fileBin.copy('orignal.md', 'original-copy.md')
       .then(copy => console.log(copy));
```
