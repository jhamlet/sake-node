
(function () {
    
    var FS            = require("fs"),
        Path          = require("path"),
        Proteus       = require("proteus"),
        ConfigModel   = require("./model/config"),
        TypeModel     = require("./model/type"),
        Task          = require("./model/task"),
        util          = require("./util"),
        StitchDriver  = require("./driver/stitch"),
        PACKAGE_INFO, VERSION,
        OPTIONS, DEFAULT_STITCHFILES,
        FILENAME_FORMAT,
        App
    ;
    
    PACKAGE_INFO = JSON.parse(FS.readFileSync(
                        Path.join(__dirname, "../package.json"),
                        "utf8"
                    ));
                    
    VERSION = PACKAGE_INFO.version;
    
    DEFAULT_STITCHFILES = Object.freeze([
        "Sakefile", "sakefile", "Sakefile.js", "sakefile.js",
        "Stitchfile", "stitchfile", "Stitchfile.js", "stitchfile.js"
    ]);
    
    FILENAME_FORMAT = "${config.name}-${bundle.name}" +
        "-${date.getTime()}.${type.extension}";

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
            var opts = this.options,
                cmd = opts[0],
                name;
            
            if (fn && util.isFunction(fn)) {
                return StitchDriver.run(fn);
            }
            
            this.loadStitchfile();
            
            if (cmd === "server") {
                
            }
            else if (cmd.match(/weave|trace/)) {
                name = cmd;
                new Task(name);
            }
            else {
                name = cmd || "default";
            }
            
        },
        
        /**
         * Run the app with the given command-line command and argument.
         * 
         * @method runCommand
         * @param cmd {string} name of the command to run
         * @param arg {string} the combination [config]:[bundle].[type] to
         *      list, generate, etc...
         */
        runCommand: function (cmd, arg) {
            var opts = this.options,
                // add excess arguments to environment
                args = this.processEnvArgs(util.slice(arguments, 2)),
                cfgName, bndlName, typeName,
                cfg, bndl, type, ctx, t
            ;
            
            cmd = cmd || opts.args[0];
            
            arg = arg && arg.replace(
                /^(?:([\w\d\-]+):)?([\w\d\-]+)\.(\w+)$/,
                function () {
                    cfgName  = arguments[1];
                    bndlName = arguments[2];
                    typeName = arguments[3];
                    return arguments[0];
                }
            );
            
            opts.config = opts.config || cfgName || "default";
            opts.bundle = opts.bundle || bndlName;
            opts.type   = opts.type || typeName;
            
            // Now that environment and options have been properly set, run
            // the stitchfile
            this.loadStitchfile();
            
            if (opts.listTasks) {
                return this.listTasks();
            }
            
            ctx = this.getContext();
            ctx.command = cmd;
            cfg = ctx.config = opts.config && ConfigModel.get(opts.config);
            ctx.bundle = cfg.bundle(opts.bundle, true);
            ctx.type   = TypeModel.get(opts.type);
            ctx.stream.source = "";

            t = new Task(cmd, [opts.bundle]);
            
            t.on("complete", function (t) {
                this.writeStream();
            }.bind(this));
            
            t.invoke(ctx);
        },
        
        runServer: function () {
        },
        
        // TODO: context should probably be its own object/class
        getContext: function () {
            if (!this.__context__) {
                Object.defineProperty(this, "__context__", {
                    value: {
                        options:     this.options,
                        environment: process.env,
                        env:         process.env,
                        stream: {
                            source: "",
                            write: function (txt) {
                                this.source += txt;
                            },
                            read: function (amt) {
                                amt = util.isNumber(amt) ? amt : this.source.length;
                                return this.source.slice(0, amt);
                            },
                            readAll: function () {
                                return this.read();
                            }
                        }
                    }
                });
            }
            
            return this.__context__;
        },
        
        openStream: function () {
            var ctx  = this.getContext(),
                opts = this.options,
                cfg  = ctx.config,
                bndl = ctx.bundle,
                type = ctx.type,
                filepath, d;

            // TODO: Check to see if the supplied outfile is a directory,
            // if so, then create a filename and make in that directory.
            if ((filepath = opts.outfile)) {
                filepath = filepath === true ?
                    cfg.filenameFormat || FILENAME_FORMAT :
                    filepath;

                filepath = util.template(filepath, {
                    config: cfg,
                    bundle: bndl,
                    type: type,
                    date: new Date()
                });
                
                // output to named file
                if (Path.existsSync(filepath) && !opts.force) {
                    throw new Error(
                        "Output file already exists. " + 
                        "Use -F, --force to overwrite."
                    );
                }

                return FS.createWriteStream(filepath, {
                    encoding: "utf8",
                    mode: '0755'
                });
            }
            else {
                return process.stdout;
            }
        },
        
        writeStream: function () {
            var str = this.openStream(),
                ctx = this.getContext();
            
            str.write(ctx.stream.source, "utf8");
            
            if (str !== process.stdout) {
                str.end();
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
            
            ret = StitchDriver.runStitchfile(path);
            
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
                if (t.description) {
                    console.log([t.name, t.description].join(" "));
                }
            });
        }
    };
    
}());