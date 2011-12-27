
(function () {

    var Proteus      = require("proteus"),
        Path         = require("path"),
        FS           = require("fs"),
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
        sake.debug("[Render stream]");
        writeStream(stitch.context);
    }
    
    function runAction (name) {
        return function (t) {
            var ctx = stitch.context = new (require("../context")),
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

        /**
         * Retrieve, extend, or define a type
         * 
         * @method type
         * @param mime {string} mime type for the type
         * @param ext {string} optional, extension for the type
         * @param spec {object} optional, addition properties for type
         * @returns {object} TypeModel instance
         */
        type: function (mime, ext, spec) {
            if (arguments.length === 1 &&
                (typeof mime === "string" || mime instanceof TypeModel)
            ) {
                return TypeModel.get(mime);
            }
            return new TypeModel(mime, ext, spec);
        },

        aliasType: function (type, alias) {
            TypeModel.get(type).addAlias(alias);
        },
        
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
                    sake.task(tmpDir).isStitched = true;
                    sake.CLOBBER.include(tmpDir);
                }
                //-----------------------------------------------------------
                // stitch
                //-----------------------------------------------------------
                sake.task("stitch", [tmpDir], runAction("stitch"));
                sake.task("stitch", postAction("stitch"));
                sake.task("stitch", render);
                sake.task("stitch").isStitched = true;
                //-----------------------------------------------------------
                // trace
                //-----------------------------------------------------------
                sake.task("trace", runAction("trace"));
                sake.task("trace", postAction("trace"));
                sake.task("trace", render);
                sake.task("trace").isStitched = true;
                
                this.__tasksDefined__ = true;
            }
        }

    });

}());
