
(function () {
    
    var StitchDriver  = require("./driver/stitch").Driver,
        CompileDriver = require("./driver/compile").Driver,
        ConfigModel   = require("./model/config").Model,
        BundleModel   = require("./model/bundle").Model,
        TypeModel     = require("./model/type").Model,
        StitchScope   = require("./scope"),
        util          = require("./util")
    ;
    
    module.exports = {
        
        run: function (arg) {
            if (util.isFunction(arg)) {
                return StitchDriver.runWithContext(arg, this);
            }
            
            StitchScope.runInContext(arg, StitchDriver);
        },
        
        compile: function (config, bundle, type) {
            return CompileDriver.run({
                config: ConfigModel.get(config),
                bundle: BundleModel.get(bundle),
                type: TypeModel.get(type)
            });
        },
        
        render: function (config, bundle, type) {
            var composition = this.compile(config, bundle, type);
            
            return RenderDriver.run({
                config: ConfigModel.get(config),
                bundle: BundleModel.get(bundle),
                type: TypeModel.get(type)
            });
        }
        
    };
    
}());