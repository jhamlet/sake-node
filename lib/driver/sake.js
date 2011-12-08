
(function () {

    var Proteus         = require("proteus"),
        Path            = require("path"),
        FS              = require("fs"),
        VM              = require("vm"),
        util            = require("../util"),
        TypeModel       = require("../model/type"),
        Driver          = require("./driver"),
        ChildProcess    = require("child_process"),
        Task            = require("../model/task"),
        FileTask        = require("../model/task/file-task"),
        FileCreateTask  = require("../model/task/file-create-task"),
        FileList        = require("../file-list"),
        CLEAN           = new FileList("**/*~", "**/*.bak", "**/core"),
        CLOBBER         = new FileList(),
        DEFAULT_FILE_MODE = "0644",
        DEFAULT_DIRECTORY_MODE = "0777",
        EVENTS          = {
            "typeCreated": [TypeModel, "created"],
            "typeUpdated": [TypeModel, "updated"]
        },
        currentTaskDescription = "",
        stitch,
        sakeProto,
        sake,
        App
    ;

    // CLEAN.clearExcludes().exclude(function (path) {
    //     var isDir = false;
    //     
    //     try {
    //         isDir = FS.statSync(path).isDirectory();
    //     }
    //     catch (e) {}
    //     
    //     return Path.basename(path) === "core" && isDir;
    // });
    // 
    // CLOBBER.clearExcludes();

    //---------------------------------------------------------------------------
    // PRIVATE
    //---------------------------------------------------------------------------
    function getSelf () { return sake; }

    function synthesizeFileTask (filepath) {
        return Path.existsSync(filepath) ? new FileTask(filepath) : null;
    }
    
    function defineTask (TaskClass, name, deps, fn) {
        var task = Task.get(name);
        
        if (!fn && typeof deps === "function") {
            fn = deps;
            deps = null;
        }
        
        if (!task) {
            task = new sake[TaskClass](name, deps, fn);
        }
        else if (deps || fn) {
            task.enhance(deps, fn);
        }
        
        task.description = task.description ?
            task.description + currentTaskDescription :
            currentTaskDescription;
            
        currentTaskDescription = "";
        
        return task;
    }

    function spawnShellCommand (cmd, args, success, failure) {
        var spawn = ChildProcess.spawn(cmd, args),
            result = "",
            error = ""
        ;

        spawn.stdout.setEncoding("utf8");
        spawn.stderr.setEncoding("utf8");

        spawn.stdout.on("data", function (data) {
            result += data;
        });

        spawn.stderr.on("data", function (data) {
            error += data;
        });

        spawn.on("exit", function (code) {
            if (code === 0 && success) {
                success(result);
            }
            else if (code !== 0 && failure) {
                failure(code, error);
            }
            else {
                process.stderr.write(error, "utf8");
                process.exit(1);
            }
        });
    }

    function runDriverInNamespace () {
        var driver = arguments[0],
            fn, name, namespace;

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

        return sake;
    }

    function getApp () {
        if (!App) {
            App = require("../app");
        }

        return App;
    }

    //---------------------------------------------------------------------------
    // PUBLIC
    //---------------------------------------------------------------------------
    // Define sakeProto separately so it is not exported in the context.
    sakeProto = Object.create(Driver, {
        runSakefile: {
            value: function (path) {
                var code;
                
                if (!this.__runContext__) {
                    Object.defineProperty(this, "__runContext__", {
                        value: VM.createContext(this)
                    });
                }
                
                code = FS.readFileSync(path, "utf8");
                
                if (Path.extname(path) === ".coffee") {
                    code = require("coffee-script").compile(code);
                }
                
                VM.runInContext(
                    code,
                    this.__runContext__,
                    path
                );
            }
        }
    });
    
    module.exports = sake = Proteus.create(sakeProto, {

        id: "sake",

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

        log: function () {
            if (getApp().options.verbose) {
                console.log.apply(console, arguments);
            }
        },
        
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
            if (arguments.length === 1 &&
                (typeof mime === "string" || mime instanceof TypeModel)
            ) {
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
                sake.runSakefile(path);
            });
        },

        //------------------------------------------------------------------------
        // Task aliases
        //------------------------------------------------------------------------
        Task:           Task,
        FileTask:       FileTask,
        FileCreateTask: FileCreateTask,
        FileList:       FileList,
        CLEAN:          CLEAN,
        CLOBBER:        CLOBBER,

        description: function (txt) { currentTaskDescription += txt; },
        desc: util.aliasMethod("description"),

        task: defineTask.bind(sake, "Task"),
        
        file: defineTask.bind(sake, "FileTask"),

        fileCreate: defineTask.bind(sake, "FileCreateTask"),

        directory: function (name) {
            return sake.fileCreate(name, function (t) {
                if (!Path.existsSync(t.name)) {
                    sake.mkdir_p(t.name);
                }
            });
        },

        //-----------------------------------------------------------------------
        // Shell short-cuts
        //-----------------------------------------------------------------------
        sh: function (cmd, success, failure) {
            ChildProcess.exec(cmd, function (error, stdout, stderr) {
                if (!error && success) {
                    success(stdout);
                }
                else if (error && failure) {
                    failure(error, stderr);
                }
                else {
                    process.stderr.write(stdout, "utf8");
                    process.exit(1);
                }
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
                    sake.mkdir(path, mode);
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
                    sake.rm_rf.apply(
                        sake,
                        FS.readdirSync(path).map(filepath)
                    );
                    FS.rmdirSync(path);
                }
                else {
                    sake.rm(path);
                }
            });
        },

        cp: function (from, to) {
            sake.write(to, sake.read(from));
        },

        mv: FS.renameSync.bind(FS),

        ln: FS.linkSync.bind(FS),

        ln_s: FS.symlinkSync.bind(FS),
        
        cat: function () {
            return util.slice(arguments).map(function (path) {
                if (Array.isArray(path)) {
                    return sake.cat.apply(sake, path);
                }
                return sake.read(path);
            }).join("");
        },
        
        read: function (path) {
            return FS.readFileSync(path);
        },
        
        write: function (path, data, mode) {
            mode = mode || "w";
            if (mode === "a") {
                data = data + sake.read(path);
            }
            FS.writeFileSync(path, data);
        }

    });

    Proteus.extend(
        sake,
        // Make sake an event emitter
        require("events").EventEmitter.prototype,
        {
            namespace: runDriverInNamespace.bind(sake, sake),
            stitch: function () {
                var args = util.slice(arguments);
            
                if (!stitch) {
                    stitch = require("./stitch");
                }
            
                runDriverInNamespace.apply(this, [stitch].concat(args));
            }
        }
    );

    // Export the global functions
    ["sake", "global", "GLOBAL", "root"].forEach(function (name) {
        Object.defineProperty(sake, name, {
            get: getSelf,
            set: util.noop,
            enumerable: true
        });
    });
    
    // Create the clean and clobber tasks
    sake.description("Remove any temporary products.");
    sake.task("clean", function (t) {
        CLEAN.items.forEach(function (path) {
            sake.rm_rf(path);
        });
    });

    sake.description("Remove any generated file.");
    sake.task("clobber", ["clean"], function (t) {
        CLOBBER.items.forEach(function (path) {
            sake.rm_rf(path);
        });
    });
}());
