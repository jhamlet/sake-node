
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
            return this.options[0];
        },
        
        get typeName () {
            return this.options[1].split(".")[1];
        },
        
        get type () {
            return sake.type(this.typeName);
        },
        
        get bundleName () {
            return this.options[1].split(".")[0];
        },
        
        get bundle () {
            return sake.Task.get(this.bundleName);
        }
        
    });
    
}());