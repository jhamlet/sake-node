
(function () {
    
    var VM      = require("vm"),
        Proteus = require("proteus"),
        util    = require("./util")
    ;
    
    module.exports = {

        scope: {
            console: console,
            require: require
        },
        
        runInContext: function (code, ctx) {
            return VM.runInNewContext(
                code,
                Proteus.create(this.scope, ctx)
            );
        }
    };
    
}());