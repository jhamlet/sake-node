
(function () {
    
    var Proteus = require("proteus"),
        App     = require("./app"),
        SakeDriver = require("./driver/sake"),
        Context;
    
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