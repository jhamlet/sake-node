
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
        CLEAN           = new FileList(),
        CLOBBER         = new FileList().clearExcludes(),
        DEFAULT_FILE_MODE = "0644",
        DEFAULT_DIRECTORY_MODE = "0777",
        EVENTS          = {
            "typeCreated": [TypeModel, "created"],
            "typeUpdated": [TypeModel, "updated"]
        },
        includePaths = [],
        currentTaskDescription = "",
        stitch,
        sakeProto,
        sake,
        App
    ;

    //---------------------------------------------------------------------------
    // PRIVATE
    //---------------------------------------------------------------------------
    function synthesizeFileTask (filepath) {
        return Path.existsSync(filepath) ? new FileTask(filepath) : null;
    }
    
    function defineTask (TaskClass, name, deps, fn) {
        var task = Task.lookup(name);
        
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
    
    /**
     * Need to handle requires a tad differently when required from within
     * a Sakefile or included file.
     */
    function sakeRequire (path) {
        var finalPath, currentPath, testPath;
        
        try {
            return require(path);
        }
        catch (err) {
            finalPath = Path.join("/node_modules", path);
            currentPath = includePaths[includePaths.length-1];
            do {
                testPath = Path.join(currentPath, "node_modules", path);
                try {
                    return require(testPath);
                }
                catch (e) {}
                currentPath = Path.join(currentPath, "..");
            } while (testPath !== finalPath);

            throw err;
        }
    }
    
    function getSelf () { return sake; }

    //---------------------------------------------------------------------------
    // PUBLIC
    //---------------------------------------------------------------------------
    // Define sakeProto separately so it is not exported in the context.
    sakeProto = Object.create(Driver, {
        runSakefile: {
            value: function (path) {
                var code, ret;
                
                if (!sake.__runContext__) {
                    Object.defineProperty(sake, "__runContext__", {
                        value: VM.createContext(sake)
                    });
                }
                
                code = FS.readFileSync(path, "utf8");
                
                if (Path.extname(path).toLowerCase() === ".coffee") {
                    code = require("coffee-script").compile(code);
                }
                
                includePaths.push(Path.dirname(Path.join(process.cwd(), path)));
                
                ret = VM.runInContext(
                    code,
                    sake.__runContext__,
                    path
                );
                
                includePaths.pop();
                return ret;
            }
        }
    });
    
    module.exports = sake = Proteus.create(sakeProto, {

        id: "sake",

        // Re-define some needed globals
        require: (function () {
            Proteus.merge(sakeRequire, require);
            return sakeRequire;
        }()),
        
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
            var app = getApp();
            app.log.apply(app, arguments);
        },
        
        debug: function () {
            var app = getApp();
            app.debug.apply(app, arguments);
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
        // Export our CLEAN and CLOBBER FileLists
        CLEAN:          CLEAN,
        CLOBBER:        CLOBBER,

        description: function (txt) { currentTaskDescription += txt; },
        desc: function () {
            return sake.description.apply(sake, arguments);
        },
        
        /**
         * Define a standard task.
         * 
         * @method task
         * @param name {string}
         * @param deps {array} optional, array of dependent tasks
         * @param fn {function} optional, action to execute when the
         *      task is invoked
         * @returns {function}
         */
        task: defineTask.bind(sake, "Task"),
        
        /**
         * Define an asynchronous task.  Basically, just flag the action
         * function as an asynchronous one, so when the TaskDriver comes
         * across the task, it knows what to do.
         * 
         * @method asyncTask
         * @param name {string}
         * @param deps {array} optional
         * @param fn {function} optional
         * @returns {Task}
         */
        asyncTask: function (name, deps, fn) {
            var task = defineTask("Task", name, deps);
            if (fn) {
                Object.defineProperty(fn, "__isAsync__", { value: true });
                task.addAction(fn);
            }
            return task;
        },
        /**
         * @method atask
         * @alias asyncTask
         */
        atask: function () {
            return sake.asyncTask.apply(sake, arguments);
        },
        /**
         * @method async
         * @alias asyncTask
         */
        async: function () {
            return sake.asyncTask.apply(sake, arguments);
        },
        /**
         * @method file
         * @param name {string}
         * @param deps {array} optional
         * @param fn {function} optional
         * @returns {FileTask}
         */
        file: defineTask.bind(sake, "FileTask"),

        /**
         * @method fileCreate
         * @param name {string}
         * @param deps {array} optional
         * @param fn {function} optional
         * @returns {FileCreateTask}
         */
        fileCreate: defineTask.bind(sake, "FileCreateTask"),

        /**
         * @method directory
         * @param name {string}
         * @returns {FileCreateTask}
         */
        directory: (function () {
            
            function mkdirAction (t) {
                if (!Path.existsSync(t.name)) {
                    sake.mkdir_p(t.name);
                }
            }

            return function (name) {
                var dirpath = name;

                while (dirpath !== ".") {
                    sake.fileCreate(name, mkdirAction);
                    dirpath = Path.dirname(dirpath);
                }

                return Task.lookup(name);
            };
        }()),

        //-----------------------------------------------------------------------
        // Shell short-cuts
        //-----------------------------------------------------------------------
        sh: function (cmd, success, failure) {
            sake.log("sh: " + cmd);
            ChildProcess.exec(cmd, function (error, stdout, stderr) {
                if (!error && success) {
                    success(stdout);
                }
                else if (error && failure) {
                    failure(error, stderr);
                }
                else {
                    throw error;
                }
            });
        },

        mkdir: FS.mkdirSync.bind(FS),
        
        // TODO: Figure out what process.platform returns for non-unixy (windows)
        // systems and change the path separator to something appropriate
        mkdir_p: function (path, mode) {
            sake.log("mkdir -p " + path);
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
                sake.log("rm " + path);
                FS.unlinkSync(path);
            });
        },

        rm_rf: function () {
            util.slice(arguments).forEach(function (path) {
                var stats;
                
                sake.log("rm -rf " + path);
                
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
            sake.log("cp " + from + " " + to);
            sake.write(to, sake.read(from));
        },

        mv: function (from, to) {
            sake.log("mv " + from + " " + to);
            FS.renameSync(from, to);
        },
        
        ln: function (from, to) {
            sake.log("ln " + from + " " + to);
            FS.linkSync(from, to);
        },

        ln_s: function (from, to) {
            sake.log("ln -s " + from + " " + to);
            FS.symlinkSync(from, to);
        },
        
        cat: function () {
            var args = util.slice(arguments);
            sake.log("cat " + args.join(" "));
            return args.map(function (path) {
                if (Array.isArray(path)) {
                    return sake.cat.apply(sake, path);
                }
                return sake.read(path, "utf8");
            }).join("");
        },
        
        read: function (path, enc) {
            sake.log("read: " + path);
            return FS.readFileSync.apply(FS, arguments);
        },
        
        write: function (/*path, data, enc, mode*/) {
            var args = util.slice(arguments, 0, 3),
                mode = arguments[3] || "w"
            ;
            if (mode === "a") {
                args[1] = args[1] + sake.read(args[0]);
            }
            sake.log("write: " + 
                (mode === "a" ? ">> " : "> ") + args[0] + " " +
                "\"" + args[1].slice(0, 32) + "...\""
            );
            FS.writeFileSync.apply(FS, args);
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
            
                runDriverInNamespace.apply(sake, [stitch].concat(args));
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
        CLEAN.existing.forEach(function (path) {
            sake.rm_rf(path);
        });
    });

    sake.description("Remove any generated file.");
    sake.task("clobber", ["clean"], function (t) {
        CLOBBER.existing.forEach(function (path) {
            sake.rm_rf(path);
        });
    });
    
}());
