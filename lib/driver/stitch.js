
(function () {

    var Proteus      = require("proteus"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("../driver"),
        BundleDriver = require("./bundle"),
        sake         = require("./sake"),
        stitch,
        TEMP_DIRECTORY
    ;
    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    function render () {
        sake.log("[Render stream]");
        stitch.context.writeStream();
    }
    
    function taskAction (name) {
        return function (t) {
            var ctx      = stitch.context,
                mode     = ctx.mode,
                bundle   = ctx.bundle,
                type     = ctx.type,
                name     = bundle.name,
                ext      = type.extension,
                modeTask = mode + "-" + ext,
                taskName = name + "." + ext
            ;
            
            sake.log("[Run " + modeTask + " for " + taskName + "]");
            sake.task(modeTask, [taskName]).invoke(ctx);
        };
    }
    
    function defineTask (name) {
        sake.task(name, taskAction(name));
        sake.task(name, render);
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
            var tmpDir;
            
            if (!this.__tasksDefined__) {
                defineTask("weave");
                defineTask("trace");
                
                if ((tmpDir = sake.options.stitchTempDirectory)) {
                    sake.directory(tmpDir);
                    sake.task("weave", [tmpDir]);
                    sake.CLEAN.include(tmpDir);
                }
                this.__tasksDefined__ = true;
            }
        }

    });

}());
