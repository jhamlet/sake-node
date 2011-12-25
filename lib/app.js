
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
            "Sakefile.coffee", "sakefile.coffee",
            "Sakefile", "sakefile", "Sakefile.js", "sakefile.js",
            "Stitchfile", "stitchfile", "Stitchfile.js", "stitchfile.js"
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
                task;
            
            stitch.defineTasks();
            this.loadStitchfile(opts.sakefile);
            
            if (typeof this.runOption === "function") {
                this.runOption();
            }
            
            task = Task.lookup(cmd || "default");
            task.invoke.apply(task, taskArgs);
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
        
        listTasks: function () {
            Task.getAll().filter(function (t) {
                return !t.isStitched;
            }).sort(function (a, b) {
                return a.id - b.id;
            }).map(function (t) {
                var name = t.name,
                    preqs = t.prerequisites,
                    actions = t.actions.map(function (a) { return a.async; }),
                    pad = "  "
                ;
                
                console.log(t.name + (t.description ? " # " + t.description : ""));
                
                if (this.options.debug) {
                    preqs.forEach(function (p, i) {
                        var line = "";

                        line += pad;
                        line += (i === 0) ? "prereqs: " : Array(10).join(" ");
                        line += sake.task(p).name;

                        console.log(line);
                    });
                    actions.forEach(function (a, i) {
                        var line = "";

                        line += pad;
                        line += (i === 0) ? "actions: " : Array(10).join(" ");
                        line += "[" + i + "]: " + (a ? "async" : "") + "fn";

                        console.log(line);
                    });
                }
            }.bind(this));
            process.exit(0);
        }
    };
    
}());