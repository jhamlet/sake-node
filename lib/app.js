
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

        DEFAULT_STITCHFILES = Object.freeze([
            "Sakefile", "sakefile", "Sakefile.js", "sakefile.js",
            "Stitchfile", "stitchfile", "Stitchfile.js", "stitchfile.js"
        ]),

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
            this.loadStitchfile();
            
            if (!cmd && typeof this.runOption === "function") {
                this.runOption();
            }
            
            task = Task.get(cmd || "default");
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
            var here = process.cwd(),
                dir, file, ret;
            
            if ((path = path || this.options.file)) {
                // If a file is specified, take advantage of process.cwd()
                // to give us the full path.
                dir  = Path.dirname(path);
                file = Path.basename(path);
                process.chdir(dir);
                path = Path.join(process.cwd(), file);
            }
            
            // if we use stitchfileLocation() to get the path, it takes care
            // of putting us in the correct directory.
            path = path || this.stitchfileLocation();
            
            ret = sake.runSakefile(path);
            
            // Make sure we return to our starting directory
            process.chdir(here);
            return ret;
        },
        
        /**
         * Does the current working directory have a stitchfile in it
         * 
         * @method haveStitchfile
         * @returns {string}
         */
        haveStitchfile: function () {
            var filenames = FS.readdirSync(process.cwd()),
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
                filename;
                
            while (!(filename = this.haveStitchfile()) && here !== "/") {
                process.chdir("..");
                here = process.cwd();
            }
            
            if (filename) {
                return Path.join(here, filename);
            }
        },
        
        listTasks: function () {
            Task.getAll().sort(function (a, b) {
                return a.id - b.id;
            }).map(function (t) {
                console.log([t.name, t.description].join(" "));
            });
        }
    };
    
}());