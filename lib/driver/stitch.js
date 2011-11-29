
(function () {

    var Proteus      = require("proteus"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("../driver"),
        BundleDriver = require("./bundle"),
        SakeDriver   = require("./sake"),
        StitchDriver
    ;
    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    function taskAction (name) {
        return function (t) {
            var ctx      = StitchDriver.context,
                bundle   = ctx.bundle,
                type     = ctx.type,
                taskname = name + "-" + type.extension,
                task
            ;
            
            task = SakeDriver.task(taskname, [bundle.name]);

            task.on("complete", function (t) {
                ctx.writeStream();
            });

            task.invoke(ctx);
        };
    }
    //-----------------------------------------------------------------------
    // PUBLIC
    //-----------------------------------------------------------------------
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
                SakeDriver.task("weave", taskAction("weave"));
                SakeDriver.task("trace", taskAction("trace"));
                this.__tasksDefined__ = true;
            }
        }

    });

}());
