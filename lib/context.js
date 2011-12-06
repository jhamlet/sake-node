
(function () {
    
    var Proteus = require("proteus"),
        util    = require("./util"),
        Path    = require("path"),
        FS      = require("fs"),
        sake    = require("./driver/sake"),
        FILENAME_FORMAT = "${bundle.name}-${date.getTime()}.${type.extension}",
        Context
    ;
    
    module.exports = Context = Proteus.Class.derive({
        
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
            // sake.log("[Writing to context...]");
            // process.stderr.write(Array(72).join("-") + "\n" + content + "\n");
            this.__source__ += content;
        },
        
        read: function () {
            return this.__source__;
        },
        
        get source () {
            return this.read();
        },
        
        /**
         * @property options
         * @type {object}
         */
        get options () {
            return sake.options;
        },
        
        /**
         * @property environment
         * @type {object}
         */
        get environment () {
            return sake.env;
        },
        
        /**
         * @property env
         * @alias environment
         */
        get env () {
            return sake.env;
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
        
    });
    
}());