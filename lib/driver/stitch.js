
(function () {

    var Proteus      = require("proteus"),
        util         = require("../util"),
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
                        b = SakeDriver.task(ctx.bundle);

                    b.invoke(ctx);
                    
                    ctx.writeStream();
                });

                SakeDriver.task("trace", function (t) {
                    var ctx = StitchDriver.context,
                        b = SakeDriver.task(ctx.bundle);

                    b.invoke(ctx);

                    ctx.writeStream();
                });
                
                this.__tasksDefined__ = true;
            }
        }

    });

}());
