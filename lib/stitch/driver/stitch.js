
(function (exports) {
    
    var Proteus     = require("proteus"),
        Path        = require('path'),
        util        = require('../util'),
        Driver      = require('../driver').Driver,
        ConfigDriver = require('./config').Driver,
        ConfigModel = require("../model/config").Model,
        StitchDriver
    ;
    
    exports.Driver = StitchDriver = Proteus.create(Driver, {

        /**
         * Include one, or more, stitch configuration files
         * 
         * @method include
         * @param rest {string} list of absolute or relative paths
         */
        include: function (/* rest */) {
            var len = arguments.length,
                i = 0,
                root, path
            ;
            
            root = Path.dirname(module.parent.parent.filename);

            for (; i < len; i++) {
                path = Path.join(root, arguments[i]);
                require(path);
            }
        },

        /**
         * Retrieve or define a configuration.
         * 
         * If name is omitted, returns the default configuration.
         * 
         * The supplied function is then run in the scope of the named 
         * configuration, or default.
         * 
         * @method configure
         * @param name {string} optional, name of the configuration, defaults
         *      to "default".
         * @param fn {function} optional, function to run to define the
         *      named configuration.
         * @returns {type}
         */
        configure: function () {
            var cfg, name, fn;
            
            if (util.isFunction(arguments[0])) {
                fn = arguments[0];
            }
            else {
                name = arguments[0];
                fn = arguments[1];
            }
            
            cfg = ConfigModel.get(name);
            ConfigDriver.context = cfg;
            
            if (fn) {
                ConfigDriver.run(fn);
            }
            
            return ConfigDriver;
        },
        
        config: util.aliasMethod("configure"),

        types: require('../types')

    });
    
    Object.defineProperty(StitchDriver, "__globalInterface__", {
        configure:  StitchDriver.configure,
        config:     StitchDriver.configure,
        include:    StitchDriver.include
    });
    
}(exports));