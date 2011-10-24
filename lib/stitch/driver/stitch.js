
(function (exports) {
    
    var util        = require('stitch/util'),
        Proteus     = require("stitch/util/proteus").Proteus,
        Driver      = require('stitch/driver').Driver,
        ConfigDriver = require('stitch/driver/config').Driver,
        ConfigModel = require("stitch/model/config").Model
    ;
    
    exports.Driver = Proteus.createObject(Driver, {

        configure: function (name, fn) {
            var arglen = arguments.length,
                cfg;
            
            if (arglen === 1) {
                if (util.isFunction(name)) {
                    fn = name;
                    name = "default";
                }
            }
            else {
                name = "default";
            }

            cfg = ConfigModel.find({name: name});
            
            if (!cfg) {
                cfg = new ConfigModel(name);
            }
            
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

        types: require('stitch/types')

    });
    
}(exports));