
(function (exports) {
    
    var Proteus = require("proteus"),
        util    = require('../util'),
        Driver  = require('../driver.js').Driver,
        O       = Object,
        hasOwnProp = O.hasOwnProperty,
        CompileDriver
    ;
    
    exports.Driver = CompileDriver = Proteus.create(Driver, {
        require: function (args) {
            
        },
        
        include: function (args) {
            
        },
        
        
        compileModule: function (mod) {
            var list = mod.composition,
                len = list.length,
                i = 0,
                hasOwn = hasOwnProp,
                componenent, key
            ;
            
            for (; i < len; i++) {
                componenent = list[i];
                for (key in componenent) {
                    if (hasOwn.call(componenent, key) &&
                        util.isFunction(this[key])
                    ) {
                        this[key].call(this, component);
                    }
                }
            }
        },
        
        run: function () {
            
        }
    });
    
}(exports));