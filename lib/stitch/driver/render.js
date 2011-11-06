
(function (exports) {
    
    var Proteus = require("proteus"),
        Path    = require("path"),
        util    = require('../util'),
        Driver  = require('../driver').Driver,
        RenderDriver
    ;
    
    exports.Driver = RenderDriver = Proteus.create(Driver, {
        
        run: function (ctx) {
            this.context = ctx;
            return this.composition;
        }
        
    });
    
}(exports));