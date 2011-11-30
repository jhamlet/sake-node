
(function () {
    
    var Proteus = require("proteus"),
        util    = require("./util"),
        Path    = require("path"),
        FS      = require("fs"),
        App     = require("./app"),
        sake    = require("./driver/sake"),
        FILENAME_FORMAT = "${bundle.name}-${date.getTime()}.${type.extension}",
        Context
    ;
    
    module.exports = Context = new (Proteus.Class.derive({
        
        init: function () {
            Object.defineProperty(this, "__source__", {
                value: "",
                writable: true
            });
            
            Object.defineProperty(this, "__stream__", {
                value: undefined,
                writable: true
            });

            Object.defineProperty(this, "__optsParsed__", {
                value: false,
                writable: true
            });
        },
        
        parseOptions: function () {
            var opts, cmd,
                bundleName,
                bundleParts,
                type, bundle
            ;

            if (this.__optsParsed__) {
                return;
            }
            
            opts = this.options;
            cmd  = opts[0];
            bundleName = opts[1];
            bundleParts = bundleName.split(".");
            bundle = sake.Task.get(bundleParts[0]);
            type = sake.type(bundleParts[1]);
            
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
            
            this.__optsParsed__ = true;
        },
        
        write: function (content) {
            // process.stderr.write(Array(72).join("-") + "\n" + content + "\n");
            this.__source__ += content;
        },
        
        read: function () {
            return this.__source__;
        },
        
        openStream: function () {
            var opts = this.options,
                bndl = this.bundle,
                type = this.type,
                filepath, d;

            // TODO: Check to see if the supplied outfile is a directory,
            // if so, then create a filename and make it in that directory.
            if ((filepath = opts.outfile)) {
                filepath = util.template(filepath, {
                    bundle: bndl,
                    type: type,
                    date: new Date()
                });
                
                // output to named file
                if (Path.existsSync(filepath) && !opts.force) {
                    throw new Error(
                        "Output file already exists. " + 
                        "Use -F, or --force, to overwrite."
                    );
                }

                this.__stream__ = FS.createWriteStream(filepath, {
                    encoding: "utf8",
                    mode: '0755'
                });
            }
            else {
                this.__stream__ = process.stdout;
            }
            
            return this.__stream__;
        },
        
        writeStream: function () {
            var stream = this.openStream();
            
            stream.write(this.__source__);
            this.__source__ = "";
            
            if (stream !== process.stdout) {
                stream.end();
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
            this.parseOptions();
            return this.__mode__;
        },
        
        get type () {
            this.parseOptions();
            return this.__type__;
        },
        
        get bundle () {
            this.parseOptions();
            return this.__bundle__;
        }
        
    }))();
    
}());