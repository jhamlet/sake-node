
(function (exports) {
    
    var Proteus = require("proteus"),
        Path    = require("path"),
        FS      = require("fs"),
        util    = require('../util'),
        Driver  = require('../driver').Driver,
        RenderDriver
    ;
    
    exports.Driver = RenderDriver = Proteus.create(Driver, {
        
        run: function (composition, ctx) {
            this.context = ctx;
            this.composition = composition;

            this.openStream();
            this.writeStream();
            this.closeStream();
        },
        
        /**
         * Open our output stream -- either a file, or STDOUT.
         * 
         * @method openStream
         */
        openStream: function () {
            var ctx  = this.context,
                opts = ctx.options,
                filepath, d;
            
            if ((filepath = opts.outfile)) {
                if (filepath === true) {
                    // output to file, but use naming convention
                    d = new Date();
                    filepath = ctx.config.name + "-" + ctx.bundle.name + "-" +
                        d.getTime() + "." + ctx.type.extension;
                }

                // output to named file
                if (Path.existsSync(filepath) && !opts.force) {
                    throw new Error(
                        "Output file already exists. " + 
                        "Use -F, --force to overwrite."
                    );
                }
                
                this.stream = FS.createWriteStream(filepath, {
                    encoding: "utf8",
                    mode: '0666'
                });
            }
            else {
                this.stream = process.stdout;
            }
        },
        
        writeStream: function () {
            var composition = this.composition,
                len = composition.length,
                i = 0
            ;
            
            for (; i < len; i++) {
                this.stream.write(JSON.stringify(composition[i]) + "\n");
            }
        },
        
        /**
         * Close our output stream
         * 
         * @method closeStream
         */
        closeStream: function () {
            if (this.stream !== process.stdout) {
                this.stream.end();
            }
        }
        
    });
    
    RenderDriver.init();
    
}(exports));