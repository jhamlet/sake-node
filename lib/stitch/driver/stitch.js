
(function (exports) {
    
    var util        = require('stitch/util'),
        Proteus     = require("stitch/util/proteus").Proteus,
        Driver      = require('stitch/driver').Driver,
        ConfigDriver = require('stitch/driver/config').Driver
    ;
    
    exports.Driver = Proteus.createObject(Driver, {

        configure: function (name, fn) {
            
            if (!fn) {
                // return this.context.get(name);
            }
            
            // ConfigDriver.context = this.context.getOrCreate(name);
            // ConfigDriver.run(fn);
            
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