
(function () {
    
    var FS          = require("fs"),
        Path        = require("path"),
        Proteus     = require("proteus"),
        util        = require("./util"),
        TypeModel   = require("./model/type"),
        Task        = require("./model/task"),
        stitch      = require("./driver/stitch"),
        sake        = require("./driver/sake"),

        PACKAGE_INFO  = JSON.parse(FS.readFileSync(
                            Path.join(__dirname, "../package.json"),
                            "utf8"
                        )),
        
        VERSION = PACKAGE_INFO.version,

        DEFAULT_STITCHFILES = [
            "Sakefile", "sakefile", "Sakefile.js", "sakefile.js",
            "Sakefile.coffee", "sakefile.coffee",
        ],

        OPTIONS, App
    ;
    
    //-----------------------------------------------------------------------
    // PUBLIC
    //-----------------------------------------------------------------------
    module.exports = App = {
        /**
         * @property version
         * @type {string}
         */
        get version () { return VERSION; },
        
        /**
         * Our command-line options
         * 
         * @property options
         * @type {object} Nomnom options object
         */
        get options () {
            return OPTIONS || (OPTIONS = require("./options")());
        },
        
        log: function () {
            var opts = this.options;
            
            if (!opts.quiet || opts.verbose) {
                Proteus.slice(arguments).forEach(function (arg) {
                    arg = typeof arg === "string" ? "[" + arg + "]" : arg;
                    console.log.call(console, arg);
                });
            }
        },
        
        debug: function () {
            var opts = this.options;
            
            if (opts.debug) {
                this.log.apply(this, arguments);
            }
        },
        /**
         * Run the passed function, or look for command-line arguments and
         * run the given task.
         * 
         * @method run
         * @param fn {function} optional, if given stitch will run in the
         *      context of the function
         */
        run: function (fn) {
            if (fn && util.isFunction(fn)) {
                return sake.run(fn);
            }
            
            this.runCli();
        },
        
        runCli: function () {
            var opts = this.options,
                cmd  = opts._[0],
                taskArgs = opts._.slice(1),
                taskname,
                task
            ;
            
            if (~["stitch", "trace"].indexOf(cmd)) {
                opts.quiet = opts.debug ? opts.quiet : true;
                stitch.defineTasks();
            }
            
            this.loadStitchfile(opts.sakefile);
            
            if (typeof this.runOption === "function") {
                this.runOption();
            }
            
            taskname = cmd || "default";
            task = Task.lookup(taskname);
            
            if (task) {
                this.log("sake: " + taskname);
                task.invoke.apply(task, taskArgs);
            }
            else {
                this.log("Can not find '" + taskname + "'");
            }
        },
        
        /**
         * Load a file and run it.
         * 
         * @method loadStitchfile
         * @param path {string} optional, file path to load
         * @returns {mixed}
         */
        loadStitchfile: function (path, ctx) {
            var here = process.cwd();
            
            path = path || this.stitchfileLocation();
            this.options.sakefile = path;
            
            process.chdir(Path.dirname(path));

            return sake.runSakefile(Path.basename(path));
        },
        
        /**
         * Does the directory have a stitchfile in it?
         * 
         * @method haveStitchfile
         * @param here {string} the directory to search
         * @returns {string}
         */
        haveStitchfile: function (here) {
            var filenames = FS.readdirSync(here),
                len = filenames.length,
                i = 0,
                f
            ;
            
            for (; i < len; i++) {
                f = filenames[i];
                if (~DEFAULT_STITCHFILES.indexOf(f)) {
                    return f;
                }
            }
        },
        
        /**
         * Starting with the current working directory, start looking for a 
         * stitchfile, moving up the directory hierarchy until found, or 
         * we reach root level.
         * 
         * @method stitchfileLocation
         * @returns {string} path to the stitchfile
         */
        stitchfileLocation: function () {
            var here = process.cwd(),
                start = here,
                filename;
                
            while (!(filename = this.haveStitchfile(here)) && here !== "/") {
                process.chdir("..");
                here = process.cwd();
            }
            
            process.chdir(start);
            
            if (filename) {
                return Path.join(here, filename);
            }
        },
        
        getNonStitchTasks: function () {
            return Task.getAll().filter(function (t) {
                return App.options.debug || !t.isStitched;
            }).sort(function (a, b) {
                return a.id - b.id;
            });
        },
        
        listTasks: function () {
            var maxWidth = 0;
            
            this.getNonStitchTasks().filter(function (t) {
                return App.options.debug || Boolean(t.description);
            }).map(function (t) {
                var aW = t.name.length;
                maxWidth = aW > maxWidth ? aW : maxWidth;
                return t;
            }).forEach(function (t) {
                var name = t.name,
                    pad = (maxWidth - name.length) + 6,
                    desc = t.description
                ;
                
                console.log(name + Array(pad).join(" ") + " # " + desc);
            });
            
            process.exit(0);
        },
        
        listPrerequisites: function () {
            this.getNonStitchTasks().map(function (t) {
                var name = t.name,
                    preqs = t.prerequisites,
                    hasPreqs = preqs.length > 0,
                    pad = "  "
                ;
                
                console.log(name + (hasPreqs ? ":" : ""));
                if (hasPreqs) {
                    console.log(preqs.map(function (p) {
                        return pad + p;
                    }).join("\n"));
                }
            });
            process.exit(0);
        },
    };
    
}());