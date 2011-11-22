
var Proteus         = require("proteus"),
    Path            = require('path'),
    FS              = require("fs"),
    VM              = require("vm"),
    util            = require('../util'),
    ConfigModel     = require("../model/config"),
    TypeModel       = require("../model/type"),
    Driver          = require('../driver'),
    ConfigDriver    = require('./config'),
    ChildProcess    = require("child_process"),
    EVENTS          = {
        "typeCreated": [TypeModel, "created"],
        "typeUpdated": [TypeModel, "updated"]
    },
    currentTaskDescription = "",
    Task, FileTask, FileCreateTask,
    StitchDriver, App
;

//---------------------------------------------------------------------------
// Privates
//---------------------------------------------------------------------------
function defineTask (TaskClass, name, deps, fn) {
    var t = new StitchDriver[TaskClass](name, deps, fn);
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

function returnSelf () {
    return StitchDriver;
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
module.exports = StitchDriver = Proteus.create(Driver, {

    id: "StitchDriver",

    // Re-define some needed globals
    require:        require,
    console:        console,
    process:        process,
    Buffer:         Buffer,
    // Not 100% sure about these being needed, or needing to be wrapped.
    setTimeout:     setTimeout,
    setInterval:    setInterval,
    clearTimeout:   clearTimeout,
    clearInterval:  clearInterval,
    
    get options () {
        return getApp().options;
    },
    set options (v) {},
    
    get Parser () {
        return getApp().Parser;
    },
    
    set Parser (v) {},
    
    /**
     * Retrieve, extend, or define a type
     * 
     * @method type
     * @param name {string} name of the type
     * @param mime {string} optional, mime type for the type
     * @param ext {string} optional, extension for the type
     * @returns {object} TypeModel instance
     */
    type: function (name, mime, ext) {
        if (arguments.length === 1 && typeof name === "string") {
            return TypeModel.get(name);
        }
        return new TypeModel(name, mime, ext);
    },
    
    /**
     * Include one, or more, stitch configuration files.  Files loaded and
     * run will have access to global variables (actual references on global),
     * however, they will not have access to the local variable scope
     * definitions where 'include' is called.
     * 
     * @method include
     * @param rest {string} list of absolute or relative paths
     */
    include: function (/* rest */) {
        util.slice(arguments).forEach(function (path) {
            StitchDriver.runStitchfile(path);
        });
    },

    /**
     * Retrieve or define a configuration.
     * 
     * If name is omitted, returns the default configuration.
     * 
     * The supplied function is then run in the scope of the named 
     * configuration, or default.
     * 
     * @method configure
     * @param name {string} optional, name of the configuration, defaults
     *      to "default".
     * @param fn {function} optional, function to run to define the
     *      named configuration.
     * @returns {type}
     */
    configure: function () {
        var cfg, name, fn;
        
        if (util.isFunction(arguments[0])) {
            fn = arguments[0];
        }
        else {
            name = arguments[0];
            fn = arguments[1];
        }
        
        cfg = ConfigModel.get(name);
        
        if (fn) {
            ConfigDriver.run(fn, cfg);
        }
        
        return ConfigDriver;
    },
    
    config: util.aliasMethod("configure", StitchDriver),
    
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
    get Task () {
        if (!Task) {
            Task = require("../model/task");
        }
        
        return Task;
    },
    
    set Task (v) {},
    
    get FileTask () {
        if (!FileTask) {
            FileTask = require("../model/task/file-task.js");
        }
        
        return FileTask;
    },
    
    set FileTask (v) {},
    
    get FileCreateTask () {
        if (!FileCreateTask) {
            FileCreateTask = require("../model/task/file-create-task.js");
        }
        
        return FileCreateTask;
    },
    
    set FileCreateTask (v) {},
    
    description: function (txt) { currentTaskDescription += txt; },
    desc: util.aliasMethod("description"),
    
    task: defineTask.bind(StitchDriver, "Task"),
    
    file: defineTask.bind(StitchDriver, "FileTask"),
    
    file_create: defineTask.bind(StitchDriver, "FileCreateTask"),
    
    directory: function (name) {
        return StitchDriver.file_create(name, function (t) {
            if (!Path.existsSync(t.name)) {
                StitchDriver.mkdir(t.name);
            }
        });
    },
    
    //-----------------------------------------------------------------------
    // Shell short-cuts
    //-----------------------------------------------------------------------
    sh: function (cmd, callback) {
        Task.setAsync();
        ChildProcess.exec(cmd, function (err, o, e) {
            if (!err && callback) {
                callback(o);
            }
            else {
                process.stderr.write(e, "utf8");
            }
            Task.clearAsync();
        });
    },

    // TODO: Figure out what process.platform returns for non-unixy (windows)
    // systems and change the path separator to something appropriate
    mkdir: function (path, mode) {
        mode = mode || "0777";
        path.split("/").reduce(function (prev, curr) {
            var path = (prev || "") + "/" + curr;
            FS.mkdirSync(path, mode);
            return path;
        });
    },
    
    rm: function () {
        util.slice(arguments, 0).forEach(function (path) {
            FS.unlinkSync(path);
        });
    },
    
    rm_rf: function () {
        util.slice(arguments, 0).forEach(function (path) {
            path.split("/").reduceRight(function (prev, curr) {
                var stats;
                if ((stats = FS.statSync(prev)).isDirectory()) {
                    StitchDriver.rm.apply(
                        StitchDriver,
                        FS.readdirSync(prev).map(function (f) {
                            return Path.join(prev, f);
                        })
                    );
                }
                else if (stats.isFile()) {
                    StitchDriver.rm(prev);
                }
                return util.slice(prev.split("/"), 0, -1).join("/");
            }, path);
        });
    },
    
    cp: function (from, to) {
        FS.writeFileSync(to, FS.readFileSync(from, "utf8"), "utf8");
    },
    
    mv: function (from, to) {
        FS.renameSync(from, to);
    },
    
    ln: function (from, to) {
        FS.linkSync(from, to);
    },
    
    ln_s: function (from, to) {
        FS.symlinkSync(from, to);
    }
    
});

["stitch", "global", "GLOBAL", "root"].forEach(function (name) {
    Object.defineProperty(StitchDriver, name, {
        get: returnSelf,
        set: util.noop,
        enumerable: true
    });
});

//---------------------------------------------------------------------------
// Extend the global scope with StitchDriver
//---------------------------------------------------------------------------
// global.stitch = StitchDriver;