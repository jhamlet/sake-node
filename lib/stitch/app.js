
(function () {
    
    var FS            = require("fs"),
        Path          = require("path"),
        VM            = require("vm"),
        Proteus       = require("proteus"),
        StitchDriver  = require("./driver/stitch").Driver,
        CompileDriver = require("./driver/compile").Driver,
        RenderDriver  = require("./driver/render").Driver,
        ConfigModel   = require("./model/config").Model,
        BundleModel   = require("./model/bundle").Model,
        TypeModel     = require("./model/type").Model,
        util          = require("./util"),
        StitchFileScope = {
            console: console,
            require: require
        },
        App
    ;
    
    module.exports = App = {
        
        DEFAULT_STITCHFILES: Object.freeze([
            "Stitchfile", "stitchfile", "Stitchfile.js", "stitchfile.js"
        ]),
            
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
         * Turn extra command-line arguments into stitch.env key/variables.
         * 
         * @method processEnvArgs
         * @param args {array[string]} the extra arguments given on the
         *      command-line
         */
        processEnvArgs: function (args) {
            var len = args.length,
                i = 0,
                arg, key, val
            ;
            
            for (; i < len; i++) {
                arg = args[i].split("=");
                key = arg[0];
                val = arg[1] || true;
                try {
                    this.environment[key] = JSON.parse(val);
                }
                catch (e) {
                    this.environment[key] = val;
                }
            }
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

            // opts.command("server [port]").
            //     description("Start stitch as a server process on [prot]").
            //     action(function (port) {
            //         // processExtraArguments(arguments);
            //         console.log("startup server" + (port ? " on " + port : ""));
            //     });
            // 
            // opts.command("parse <file>").
            //     action(function (file) {
            //         // processExtraArguments(arguments);
            //         console.log("parse " + file);
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
                cfgName, bndlName, typeName,
                ctx = {
                    options:     this.options,
                    environment: this.environment,
                    env:         this.environment,
                },
                cfg, bndl, type,
                composition
            ;
            
            // add excess arguments to environment
            // TODO: handle when we are not passed an argument, and we have to
            // determine config, bundle and type from options
            this.processEnvArgs(util.slice(arguments, 2));
            
            arg = arg && arg.replace(
                /^(([\w\d\-]+):)?([\w\d\-]+)\.(\w+)$/,
                function () {
                    cfgName  = arguments[2];
                    bndlName = arguments[3];
                    typeName = arguments[4];
                    return arguments[0];
                }
            );
            
            opts.config = opts.config || cfgName || "default";
            opts.bundle = opts.bundle || bndlName;
            opts.type   = opts.type || typeName;
            
            // Now that environment and options have been properly set, run
            // the stitchfile
            this.loadStitchfile();
            
            ctx.config = opts.config && ConfigModel.get(opts.config);
            ctx.bundle = ctx.config.bundle(opts.bundle, true);
            ctx.type   = TypeModel.get(opts.type);
            
            console.log("run: " + cmd + ", arg: " + arg);

            if (cmd === "trace" || cmd === "weave") {
                composition = CompileDriver.run(ctx);
            }
            
            if (cmd === "trace") {
                console.log(composition);
            }
            else if (cmd === "weave") {
                RenderDriver.run(composition, ctx);
            }
        },
        
        /**
         * Run the passed function, or look for command-line arguments and
         * runt the given command.
         * 
         * @method run
         * @param fn {function} optional, if given stitch will run in the
         *      context of the function
         */
        run: function (fn) {
            var path;
            
            if (fn && util.isFunction(fn)) {
                return StitchDriver.run(fn, this);
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
            path = path || this.options.file || this.stitchfileLocation();
            StitchDriver.context = this;
            return VM.runInNewContext(
                FS.readFileSync(path, "utf8"),
                Proteus.create(StitchFileScope, StitchDriver),
                "stitch.vm"
            );
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
    
}());