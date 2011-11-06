
(function () {
    
    var FS            = require("fs"),
        Path          = require("path"),
        StitchDriver  = require("./driver/stitch").Driver,
        CompileDriver = require("./driver/compile").Driver,
        RenderDriver  = require("./driver/render").Driver,
        ConfigModel   = require("./model/config").Model,
        BundleModel   = require("./model/bundle").Model,
        TypeModel     = require("./model/type").Model,
        StitchScope   = require("./scope"),
        util          = require("./util"),
        packageInfo   = require("./package-info"),
        App
    ;
    
    module.exports = App = {
        
        DEFAULT_STITCHFILES: Object.freeze([
            "Stitchfile", "stitchfile", "Stitchfile.js", "stitchfile.js"
        ]),
            
        environment: require("./env"),
        
        get env () {
            return this.environment;
        },
        
        set env (v) {},
        
        version: packageInfo.version,
        
        options: require("./options"),
        
        processEnvArgs: function (args) {
            var len = args.length,
                i = 0,
                arg, key, val
            ;
            
            for (; i < len; i++) {
                arg = args[i].split("=");
                key = arg[0];
                val = arg[1] || true;
                this.environment[key] = val;
            }
        },
        
        setupCommands: function () {
            var opts = this.options;
            
            opts.version(this.version);
            
            opts.command("list <[config:]bundle.type>").
                description(
                    "List what would be included for the named 'bundle' for asset " +
                    "type 'type'"
                ).
                action(this.runCommand.bind(this, "list"));

            opts.command("weave <[config:]bundle.type>").
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
        
        runCommand: function (cmd, arg) {
            this.processEnvArgs(util.slice(arguments, 2));
            console.log("run: " + cmd + ", arg: " + arg);
        },
        
        run: function (arg) {
            var path;
            
            if (arg) {
                if (util.isFunction(arg)) {
                    return StitchDriver.runWithContext(arg, this);
                }
            }
            
            this.setupCommands();
            this.parseOptions();
        },
        
        loadStitchfile: function (path) {
            path = path || this.options.file || this.stitchfileLocation();
            return StitchScope.runInContext(FS.readFileSync(path, "utf8"), this);
        },
        
        compile: function (config, bundle, type) {
            return CompileDriver.run({
                config: ConfigModel.get(config),
                bundle: BundleModel.get(bundle),
                type: TypeModel.get(type)
            });
        },
        
        render: function (config, bundle, type) {
            var composition = this.compile(config, bundle, type);
            
            return RenderDriver.run({
                config: ConfigModel.get(config),
                bundle: BundleModel.get(bundle),
                type: TypeModel.get(type)
            });
        },
        
        haveStitchfile: function () {
            var filenames = FS.readdirSync(process.cwd()),
                len = filenames.length,
                i = 0,
                f
            ;
            
            for (; i < len; i++) {
                f = filenames[i];
                if (this.DEFAULT_STITCHFILES.indexOf(f) > -1) {
                    return f;
                }
            }
        },
        
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