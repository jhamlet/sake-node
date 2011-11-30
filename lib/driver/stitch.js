
(function () {

    var Proteus      = require("proteus"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("../driver"),
        BundleDriver = require("./bundle"),
        sake         = require("./sake"),
        stitch
    ;
    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    function taskAction (name) {
        return function (t) {
            var ctx      = stitch.context,
                mode     = ctx.mode,
                bundle   = ctx.bundle,
                type     = ctx.type,
                taskname = mode + "-" + name + "-" + type.extension,
                task
            ;
            
            task = sake.task(taskname, [bundle.name]);

            task.on("complete", function (t) {
                ctx.writeStream();
            });

            task.invoke(ctx);
        };
    }
    //-----------------------------------------------------------------------
    // PUBLIC
    //-----------------------------------------------------------------------
    module.exports = stitch = Proteus.create(Driver, {

        id: "stitch",

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
                sake.task("weave", taskAction("weave"));
                sake.task("trace", taskAction("trace"));
                this.__tasksDefined__ = true;
            }
        }

    });

}());
