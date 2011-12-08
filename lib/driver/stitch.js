
(function () {

    var Proteus      = require("proteus"),
        Path         = require("path"),
        FS           = require("fs"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("../driver"),
        BundleDriver = require("./bundle"),
        Context      = require("../context"),
        sake         = require("./sake"),
        stitch,
        TEMP_DIRECTORY
    ;
    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    function openStream (ctx) {
        var opts = ctx.options,
            bndl = ctx.bundle,
            type = ctx.type,
            stream,
            filepath, d;

        // TODO: Check to see if the supplied outfile is a directory,
        // if so, then create a filename and make it in that directory.
        if ((filepath = opts.outfile)) {
            filepath = util.template(filepath, {
                bundle: bndl,
                type: type,
                date: new Date()
            });
            
            // output to named file
            if (Path.existsSync(filepath) && !opts.force) {
                throw new Error(
                    "Output file already exists. " + 
                    "Use -F, or --force, to overwrite."
                );
            }

            stream = FS.createWriteStream(filepath, {
                encoding: "utf8",
                mode: '0755'
            });
        }
        else {
            stream = process.stdout;
        }
        
        return stream;
    }
    
    function writeStream (ctx) {
        var stream = openStream(ctx);
        
        stream.write(ctx.source);
        
        if (stream !== process.stdout) {
            stream.end();
        }
    }
    
    function render (t) {
        sake.log("[Render stream]");
        writeStream(stitch.context);
    }
    
    function runAction (name) {
        return function (t) {
            var ctx = stitch.context = new Context(),
                bundle = ctx.bundle
            ;

            bundle.invoke(ctx);
        };
    }
    
    function postAction (name) {
        return function (t) {
            var ctx = stitch.context,
                task = sake.Task.get(name + "." + ctx.type.extension)
            ;
            
            task = task && task.invoke(ctx);
        };
    }
    //-----------------------------------------------------------------------
    // PUBLIC
    //-----------------------------------------------------------------------
    module.exports = stitch = Proteus.create(Driver, {

        id: "stitch",

        bundle: BundleDriver.run.bind(BundleDriver),

        run: function (fn) {
            this.defineTasks();
            Driver.run.apply(this, arguments);
        },
        
        defineTasks: function () {
            var tmpDir;
            
            if (!this.__tasksDefined__) {
                tmpDir = sake.options.stitchTempDirectory;
                if (!sake.Task.lookup(tmpDir)) {
                    sake.directory(tmpDir);
                    sake.CLOBBER.include(tmpDir);
                }
                //-----------------------------------------------------------
                // stitch
                //-----------------------------------------------------------
                sake.task("stitch", [tmpDir], runAction("stitch"));
                sake.task("stitch", postAction("stitch"));
                sake.task("stitch", render);
                //-----------------------------------------------------------
                // trace
                //-----------------------------------------------------------
                sake.task("trace", runAction("trace"));
                sake.task("trace", postAction("trace"));
                sake.task("trace", render);
                
                this.__tasksDefined__ = true;
            }
        }

    });

}());
