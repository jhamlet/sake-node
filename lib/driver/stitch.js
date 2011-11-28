
(function () {

    var Proteus      = require("proteus"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("../driver"),
        BundleDriver = require("./bundle"),
        SakeDriver   = require("./sake"),
        StitchDriver
    ;

    //---------------------------------------------------------------------------
    // PUBLIC
    //---------------------------------------------------------------------------
    module.exports = StitchDriver = Proteus.create(Driver, {

        id: "StitchDriver",

        bundle: BundleDriver.run.bind(BundleDriver),

        get context () {
            return require("../context");
        },
        
        run: function (fn) {
            this.defineTasks();
            Driver.run.apply(this, arguments);
        },
        
        defineTasks: function () {
            if (!this.__tasksDefined__) {
                SakeDriver.task("weave", function (t) {
                    var ctx = StitchDriver.context,
                        bundle = ctx.bundle,
                        type   = ctx.type,
                        weavetask = "weave" + "-" + type.extension
                    ;
                    
                    SakeDriver.task(weavetask, [bundle.name]).invoke(ctx);
                    
                    ctx.writeStream();
                });

                SakeDriver.task("trace", function (t) {
                    var ctx = StitchDriver.context,
                        bundle = ctx.bundle,
                        type   = ctx.type,
                        tracetask = "trace" + "-" + type.extension
                    ;
                    
                    SakeDriver.task(tracetask, [bundle.name]).invoke(ctx);
                    
                    ctx.writeStream();
                });
                
                this.__tasksDefined__ = true;
            }
        }

    });

}());
