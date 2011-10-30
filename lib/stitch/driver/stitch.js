
(function (exports) {
    
    var Proteus     = require("proteus"),
        util        = require('../util'),
        Driver      = require('../driver.js').Driver,
        ConfigDriver = require('./config').Driver,
        ConfigModel = require("../model/config").Model
    ;
    
    exports.Driver = Proteus.create(Driver, {

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