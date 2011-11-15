
(function () {
    
    var FS            = require("fs"),
        Path          = require("path"),
        Proteus       = require("proteus"),
        StitchDriver  = require("./driver/stitch"),
        ConfigModel   = require("./model/config"),
        BundleModel   = require("./model/bundle"),
        TypeModel     = require("./model/type"),
        util          = require("./util"),
        App
    ;
    
    module.exports = App = {
        
        DEFAULT_STITCHFILES: Object.freeze([
            "Stitchfile", "stitchfile", "Stitchfile.js", "stitchfile.js"
        ]),
        
        FILENAME_FORMAT: "${config.name}-${bundle.name}" +
            "-${date.getTime()}.${type.extension}",
            
        /**
         * @property environment
         * @type {object}
         */
        environment: Object.create(process.env),
        get env () { return this.environment; },
        set env (v) {},
        
        /**
         * @property version
         * @type {string}
         */
        version: JSON.parse(
            FS.readFileSync(
                Path.join(__dirname, "../../package.json"),
                "utf8"
            )
        ).version,
        
        /**
         * Our command-line options
         * 
         * @property options
         * @type {object} Commander options object
         */
        options: require("./options"),
        
        /**
         * Turn extra command-line arguments of "key=value" into environment
         * variables.
         * 
         * @method processEnvArgs
         * @param args {array[string]} the extra arguments given on the
         *      command-line
         * @returns {array} array of non-environment arguments
         */
        processEnvArgs: function (args) {
            var len = args.length,
                i = 0,
                remainder = [],
                arg, key, val
            ;
            
            for (; i < len; i++) {
                arg = args[i];
                if (~arg.indexOf("=")) {
                    arg = arg.split("=");
                    key = arg[0];
                    val = arg[1];
                    try {
                        this.environment[key] = JSON.parse(val);
                    }
                    catch (e) {
                        this.environment[key] = val;
                    }
                }
                else {
                    remainder.push(arg);
                }
            }
            
            return remainder;
        },
        
        /**
         * Tell the options parser what commands we accept on the command-line
         * 
         * @method setupCommands
         */
        setupCommands: function () {
            var opts = this.options;
            
            opts.version(this.version);
            
            opts.command("trace [[config:]bundle.type]").
                description(
                    "List what would be included for the named 'bundle' for asset " +
                    "type 'type'"
                ).
                action(this.runCommand.bind(this, "trace"));

            opts.command("weave [[config:]bundle.type]").
                description("Generate the named 'bundle' for asset type 'type'").
                action(this.runCommand.bind(this, "weave"));

            opts.command("*").
                action(function () { console.log("ooops"); });
            
            // opts.command("server [port]").
            //     description("Start stitch as a server process on [prot]").
            //     action(function (port) {
            //         // processExtraArguments(arguments);
            //         console.log("startup server" + (port ? " on " + port : ""));
            //     });
        },
        
        /**
         * Tell the options parser to do its thing.
         * 
         * @method parseOptions
         */
        parseOptions: function () {
            if (this._optionsParsed) {
                return;
            }
            
            // No arguments, output useage
            if (process.argv.length < 3) {
                process.argv.push("-h");
            }
            
            this.options.parse(process.argv);
            
            this._optionsParsed = true;
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
            
            ctx = this.getContext();

            ctx.command = cmd;
            cfg = ctx.config = opts.config && ConfigModel.get(opts.config);
            ctx.bundle = cfg.bundle(opts.bundle, true);
            ctx.type   = TypeModel.get(opts.type);
            ctx.stream.source = "";
            
            t = task(cmd, [opts.bundle]);
            t.on("complete", function (t) {
                this.writeStream();
            }.bind(this));
            
            t.invoke(ctx);
        },
        
        getContext: function () {
            if (!this.__context__) {
                Object.defineProperty(this, "__context__", {
                    value: {
                        options:     this.options,
                        environment: this.environment,
                        env:         this.environment,
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
                    cfg.filenameFormat || this.FILENAME_FORMAT :
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
            
            str.on("exit", function () {
                process.exit(0);
            });
            
            str.write(ctx.stream.source, "utf8");
        },
        
        /**
         * Run the passed function, or look for command-line arguments and
         * run the given command.
         * 
         * @method run
         * @param fn {function} optional, if given stitch will run in the
         *      context of the function
         */
        run: function (fn) {
            var path;
            
            if (fn && util.isFunction(fn)) {
                return StitchDriver.run(fn);
            }
            
            this.setupCommands();
            this.parseOptions();
        },
        
        /**
         * Load a file and run it.
         * 
         * @method loadStitchfile
         * @param path {string} optional, file path to load
         * @returns {mixed}
         */
        loadStitchfile: function (path) {
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
            
            ret = StitchDriver.run(path);
            
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
                if (~this.DEFAULT_STITCHFILES.indexOf(f)) {
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
        }
        
    };
    
    StitchDriver.context = App;
    
}());