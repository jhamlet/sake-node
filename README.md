SAKÉ
====

**S**[titch from R]**ake**

This package contains **Saké**, a JavaScript build program that runs in node with capabilities similar to ruby's Rake, and with some extra **Stitch** tasks for building JavaScript, CSS, HTML, and other sundry files for web development.

Saké has the following features:

1.  Sakefiles (Saké’s version of Rakefiles) are completely defined in standard JavaScript (or CoffeeScript, for those who want an even more Rake-like feel).
2.  Flexible FileLists that act like arrays but know about manipulating file names and paths.
3.  Standard `clean` and `clobber` tasks
4.  Handling of *Synchronous* and *Asynchronous* tasks.
5.  Many utility methods for handling common build tasks (rm, rm\_rf, mkdir, mkdir\_p, sh, cat, etc...)
6.  **Stitch** a set of utility methods that help build packages of JavaScript, CSS, HTML, etc...


Installation
------------

### Install with npm

Download and install with the following:

    npm install -g sake


Saké Usage
----------

Within a `Sakefile`, Saké's methods are exported to the global scope, so you can invoke them directly:

```js
task("taskname", ["prereq1", "prereq2"], function (t) {
    // task action...
});
```
    
or, the equivalent in a `Sakefile.coffee`:

```js
task "taskname", ["prereq1", "prereq2"], (t)->
    // task action...
```

Within another node module you can `require("sake")` and access the methods on the exported object:

```js
var sake = require("sake");
    
sake.task("taskname", ["prereq1", "prereq2"], function (t) {
    // task action...
});
```

The remainder of this documentation will assume that we are calling the methods from within a `Sakefile`.


### Defining Tasks

```js
[task|file|directory|fileCreate](taskname, [prerequisites], [action]);
```

*   `taskname` is a `string` naming the task
*   `prerequisites` is an _optional_ array of task names, a FileList, or functions that return a task name, an array, or a FileList. You can also pass a FileList in place of the array.
*   `action` is an _optional_ function that will be called when the task is invoked.
*   `returns` the Task instance

If a task is already defined, it will be augmented by whatever is passed. So, this:

```js
task("othertask")
task("one", ["othertask"])
task("one", function (t) {
    //...
});
```

Would result in a task "othertask" with no prerequisites, and no action, and a task "one" with "othertask" as a prerequisite and the function as its first action.


#### File Tasks

File tasks are created with the (appropriately named) `file` method. File tasks, however, are only triggered if the file doesn't exist, or the modification time of any of its prerequisites is newer than itself.

```js
file("path/to/some/file", function (t) {
    cp("other/path", t.name);
});
```

The above task would only be triggered if `path/to/some/file` did not exist.

The following:

```js
file("combined/file/path", ["pathA", "pathB", "pathC"], function (t) {
    write(t.name, cat(t.prerequisites), "utf8");
});
```

would be triggered if `path/to/some/file` did not exist, or its modification time was earlier than any of its prerequisites.


#### Directory Tasks

Directory tasks, created with the `directory` method are tasks that will only be called if they do not exist. The named directory (and any directories along the way) will be created when the task is triggered. Directory tasks can have prerequisites and actions also.


#### File Create Tasks

A file create task is a file task that when used as a dependency will be needed if, and only if, the file has not been created. Once created, it is not re-triggered if any of its dependencies are newer, nor does it trigger any rebuilds of tasks that depend on it whenever it is updated.


### Asynchronous Tasks

In Saké all tasks are assumed to be *synchronous*. However, many things in node require *asynchronous* callbacks. You can indicate that a task action is asynchronous by calling the tasks's, or the global `Task` class', `startAsyc` method when starting the task action, and the `clearAsync` method when it is complete. i.e:

```js
task("asynctask", function (t) {
    t.startAsync(); // or, Task.startAsync()
    sh("some long running shell command", function (err, stdout, stderr) {
        // do stuff...
        t.clearAsync(); // or, Task.clearAsync()
    });
});
```

Alternatively, you can use the `async` method to define a task. This will automatically set the async flag. However, your task must still clear it when it is done. i.e:

```js
async("longtask", function (t) {
    sh("some long running shell command", function (err, stdout, stderr) {
        t.clearAsync(); // or, Task.clearAsync()
    });
});
```

File Lists
----------



Saké Utilities
--------------

### sh(cmd, success[, failure])

Execute shell `cmd`. On success the `success` handler will be called, on error, the `failure` function. This method is *asynchronous*, and if used in a task, one should call `Task.startAsync` or the `task#startAsync` to indicate that the task is asynchronous. Clear the *asynchronous* flag by calling `Task.clearAsync`, or the `task#clearAsync` method in the `success` or `failure` handler.


### mkdir(dirpath[, mode])
### mkdir_p(dirpath[, mode])

Create the `dirpath` directory, if it doesn't already exist. `mkdir_p` will create all intermediate directories as needed.
    
### rm(path[, path1, ..., pathN])
### rm_rf(path[, path1, ..., pathN])

Remove one or more paths from the file system. `rm_rf` will remove directories and their contents.
    
### cp(from, to)

Copy a file from `from` path to `to` path.
    
### mv(from, to)

Move a file from `from` path to `to` path.
    
### ln(from, to)

Create a hard link from `from` path to `to` path.
    
### ln_s(from, to)

Create a symlink from `from` path to `to` path.
    
### cat(path [, path1, ..., pathN])

Synchronously read all supplied paths and return their contents as a string. If an argument is an `Array` it will be expanded and those paths will be read.
    
### read(path [, enc])

Synchronously read the supplied file path. Returns a `buffer`, or a `string` if `enc` is given.
    
### write(path, data [, enc, mode])

Synchronously write the `data` to the supplied file `path`. `data` should be a `buffer` or a `string` if `enc` is given. `mode` is a `string` of either "w", for over write,  or "a" for append.

### chomp(text)

Remove all trailing newline characters and return the resulting string.


Stitch Usage
------------

### Types

### Bundles

