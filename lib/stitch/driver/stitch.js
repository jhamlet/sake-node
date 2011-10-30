
(function (exports) {
    
    var Proteus     = require("proteus"),
        util        = require('../util'),
        Path        = require('path'),
        Driver      = require('../driver.js').Driver,
        ConfigDriver = require('./config').Driver,
        ConfigModel = require("../model/config").Model
    ;
    
    exports.Driver = Proteus.create(Driver, {

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

        description: function (txt) {
            return this;
        },
        
        desc: util.aliasMethod("description"),
        
        config: util.aliasMethod("configure"),

        types: require('../types')

    });
    
}(exports));