
(function () {

    var Proteus         = require("proteus"),
        Path            = require('path'),
        FS              = require("fs"),
        util            = require('../util'),
        TypeModel       = require("../model/type"),
        Driver          = require('../driver'),
        ChildProcess    = require("child_process"),
        Task            = require("../model/task"),
        FileTask        = require("../model/task/file-task"),
        FileCreateTask  = require("../model/task/file-create-task"),
        FileList        = require("../file-list"),
        DEFAULT_FILE_MODE = "0644",
        DEFAULT_DIRECTORY_MODE = "0777",
        EVENTS          = {
            "typeCreated": [TypeModel, "created"],
            "typeUpdated": [TypeModel, "updated"]
        },
        currentTaskDescription = "",
        StitchDriver, SakeDriver, App
    ;

    //---------------------------------------------------------------------------
    // Privates
    //---------------------------------------------------------------------------
    function getSelf () { return SakeDriver; }

    function getStitch () {
        if (!StitchDriver) {
            StitchDriver = require("./stitch");
        }
        return StitchDriver;
    }

    function defineTask (TaskClass, name, deps, fn) {
        var t = new SakeDriver[TaskClass](name, deps, fn);
        t.description = currentTaskDescription;
        currentTaskDescription = "";
        return t;
    }

    function spawnShellCommand (cmd, args, callback) {
        var process = ChildProcess.spawn(cmd, args),
            result = "",
            error = ""
        ;

        Task.setAsync();

        process.stdout.setEncoding("utf8");
        process.stderr.setEncoding("utf8");

        process.stdout.on("data", function (data) {
            result += data;
        });

        process.stderr.on("data", function (data) {
            error += data;
        });

        process.on("exit", function (code) {
            if (code === 0 && callback) {
                callback(result);
            }
            else {
                global.process.stderr.write(error, "utf8");
            }
            Task.clearAsync();
        });
    }

    function runDriverInNamespace () {
        var driver = arguments[0],
            fn, name, namespace;

        if (typeof driver === "function") {
            driver = driver();
        }

        if (util.isFunction(arguments[1])) {
            fn = arguments[1];
        }
        else {
            name = arguments[1];
            fn = arguments[2];
        }

        namespace = Task.currentNamespace;
        Task.currentNamespace = name;

        if (fn) {
            driver.run(fn);
        }

        Task.currentNamespace = namespace;

        return SakeDriver;
    }

    function getApp () {
        if (!App) {
            App = require("../app");
        }

        return App;
    }

    //---------------------------------------------------------------------------
    // Publics
    //---------------------------------------------------------------------------
    module.exports = SakeDriver = Proteus.create(Driver, {

        id: "SakeDriver",

        // Re-define some needed globals
        require:        require,
        console:        console,
        process:        process,
        // Not 100% sure about these being needed, or needing to be wrapped.
        Buffer:         Buffer,
        setTimeout:     setTimeout,
        setInterval:    setInterval,
        clearTimeout:   clearTimeout,
        clearInterval:  clearInterval,

        get options () {
            return getApp().options;
        },
        set options (v) {},

        /**
         * Retrieve, extend, or define a type
         * 
         * @method type
         * @param mime {string} mime type for the type
         * @param ext {string} optional, extension for the type
         * @param spec {object} optional, addition properties for type
         * @returns {object} TypeModel instance
         */
        type: function (mime, ext, spec) {
            if (arguments.length === 1 && typeof mime === "string") {
                return TypeModel.get(mime);
            }
            return new TypeModel(mime, ext, spec);
        },

        /**
         * Include one, or more, sake configuration files.  Files loaded and
         * run will have access to global variables (actual references on global),
         * however, they will not have access to the local variable scope
         * definitions where 'include' is called.
         * 
         * @method include
         * @param rest {string} list of absolute or relative paths
         */
        include: function (/* rest */) {
            util.slice(arguments).forEach(function (path) {
                SakeDriver.runSakefile(path);
            });
        },

        /**
         * Define a namespace.
         * 
         * @method namespace
         * @param name {string} optional, namespace, defaults to "default".
         * @param fn {function} function
         * @returns {object} SakeDriver
         */
        namespace: runDriverInNamespace.bind(SakeDriver, SakeDriver),

        stitch: runDriverInNamespace.bind(SakeDriver, getStitch),

        //-----------------------------------------------------------------------
        // Events
        //-----------------------------------------------------------------------
        on: function (name, fn) {
            var pub = EVENTS[name];
            if (!pub) {
                throw new Error("Unknown Stitch Event '" + name + "'.");
            }

            pub[0].on(pub[1], fn);
        },

        //------------------------------------------------------------------------
        // Task aliases
        //------------------------------------------------------------------------
        Task:           Task,
        FileTask:       FileTask,
        FileCreateTask: FileCreateTask,
        FileList:       FileList,

        description: function (txt) { currentTaskDescription += txt; },
        desc: util.aliasMethod("description"),

        task: defineTask.bind(SakeDriver, "Task"),

        file: defineTask.bind(SakeDriver, "FileTask"),

        file_create: defineTask.bind(SakeDriver, "FileCreateTask"),

        directory: function (name) {
            return SakeDriver.file_create(name, function (t) {
                if (!Path.existsSync(t.name)) {
                    SakeDriver.mkdir(t.name);
                }
            });
        },

        //-----------------------------------------------------------------------
        // Shell short-cuts
        //-----------------------------------------------------------------------
        sh: function (cmd, callback) {
            Task.setAsync();
            ChildProcess.exec(cmd, function (error, stdout, stderr) {
                if (!error && callback) {
                    callback(stdout);
                }
                else {
                    process.stderr.write(stdout, "utf8");
                }
                Task.clearAsync();
            });
        },

        mkdir: FS.mkdirSync.bind(FS),
        
        // TODO: Figure out what process.platform returns for non-unixy (windows)
        // systems and change the path separator to something appropriate
        mkdir_p: function (path, mode) {
            mode = mode || DEFAULT_DIRECTORY_MODE;
            path.split("/").reduce(function (prev, curr) {
                var path = (prev ? prev + "/" : "") + curr;
                if (!Path.existsSync(path)) {
                    SakeDriver.mkdir(path, mode);
                }
                return path;
            }, null);
        },

        rm: function () {
            util.slice(arguments, 0).forEach(function (path) {
                FS.unlinkSync(path);
            });
        },

        rm_rf: function () {
            util.slice(arguments).forEach(function (path) {
                var stats;
                
                function filepath (f) {
                    return Path.join(path, f);
                }

                if ((stats = FS.statSync(path)).isDirectory()) {
                    SakeDriver.rm_rf.apply(
                        this,
                        FS.readdirSync(path).map(filepath)
                    );
                    FS.rmdirSync(path);
                }
                else {
                    SakeDriver.rm(path);
                }
            });
        },

        cp: function (from, to) {
            FS.writeFileSync(to, FS.readFileSync(from));
        },

        mv: FS.renameSync.bind(FS),

        ln: FS.linkSync.bind(FS),

        ln_s: FS.symlinkSync.bind(FS)

    });

    ["sake", "global", "GLOBAL", "root"].forEach(function (name) {
        Object.defineProperty(SakeDriver, name, {
            get: getSelf,
            set: util.noop,
            enumerable: true
        });
    });
    
}());
