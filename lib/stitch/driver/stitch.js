
(function (exports) {
    
    var util        = require('stitch/util'),
        Driver      = require('stitch/driver').Driver,
        ConfigModel = require('stitch/model/config').Model,
        ConfigDriver = require('stitch/driver/config').Driver
    ;
    
    util.merge(exports.Driver = Object.create(Driver), {

        configure: function (name, fn) {
            
            if (!fn) {
                return this.context.get(name);
            }
            
            ConfigDriver.context = this.context.getOrCreate(name);
            ConfigDriver.run(fn);
            
            return ConfigDriver;
        },

        config: util.alias("configure"),

        types: require('stitch/types')
        
    });
    
}(exports));