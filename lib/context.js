
(function () {
    
    var Proteus = require("proteus"),
        Path    = require("path"),
        FS      = require("fs"),
        App     = require("./app"),
        SakeDriver = require("./driver/sake"),
        FILENAME_FORMAT = "${bundle.name}-${date.getTime()}.${type.extension}",
        Context
    ;
    
    module.exports = Context = new (Proteus.Class.derive({
        
        parseOptions: function () {
            var opts = this.options,
                cmd  = opts[0],
                bundleName = opts[1],
                bundleParts,
                type, bundle
            ;
            
            bundleParts = bundleName.split(".");
            bundle = SakeDriver.task(bundleParts[0]);
            type = SakeDriver.type(bundleParts[1]);
            
            Object.defineProperties(this, {
                __mode__: {
                    value: cmd
                },
                __bundle__: {
                    value: bundle
                },
                __type__: {
                    value: type
                }
            });
        },
        
        openStream: function () {
            var ctx  = this.context(),
                opts = this.options,
                bndl = ctx.bundle,
                type = ctx.type,
                filepath, d;

            // TODO: Check to see if the supplied outfile is a directory,
            // if so, then create a filename and make it in that directory.
            if ((filepath = opts.outfile)) {
                filepath = util.template(
                    filepath === true ?
                        opts._[2] || FILENAME_FORMAT :
                        filepath,
                    {
                        bundle: bndl,
                        type: type,
                        date: new Date()
                    }
                );
                
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
         * @property options
         * @type {object}
         */
        get options () {
            return App.options;
        },
        
        /**
         * @property environment
         * @type {object}
         */
        get environment () {
            return process.env;
        },
        
        /**
         * @property env
         * @alias environment
         */
        get env () {
            return process.env;
        },
        
        /**
         * @property mode
         * @type {string}
         */
        get mode () {
            if (!this.__mode__) {
                this.parseOptions();
            }
            return this.__mode__;
        },
        
        get type () {
            if (!this.__type__) {
                this.parseOptions();
            }
            
            return this.__type__;
        },
        
        get bundle () {
            if (!this.__bundle__) {
                this.parseOptions();
            }
            
            return this.__bundle__;
        }
        
    }))();
    
}());