
(function (exports) {
    
    var Proteus = require("proteus"),
        Path    = require("path"),
        FS      = require("fs"),
        util    = require('../util'),
        Driver  = require('../driver').Driver,
        filenameFormat = "<%=config.name%>-<%=bundle.name%>" +
            "-<%=date.getTime()%>.<%=type.extension%>",
        RenderDriver
    ;
    
    exports.Driver = RenderDriver = Proteus.create(Driver, {
        
        run: function (composition, ctx) {
            this.context = ctx;
            this.composition = composition;

            this.openStream();
            this.writeComposition();
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
                cfg  = ctx.config,
                bndl = ctx.bundle,
                type = ctx.type,
                filepath, d;
            
            if ((filepath = opts.outfile)) {
                filepath = filepath === true ?
                    cfg.filenameFormat || filenameFormat :
                    filepath;
                
                // output to named file
                if (Path.existsSync(filepath) && !opts.force) {
                    throw new Error(
                        "Output file already exists. " + 
                        "Use -F, --force to overwrite."
                    );
                }
                
                console.log(filepath);
                
                this.stream = FS.createWriteStream(
                    util.template(filepath, {
                        config: cfg,
                        bundle: bndl,
                        type: type,
                        date: new Date()
                    }), {
                        encoding: "utf8",
                        mode: '0755'
                    }
                );
            }
            else {
                this.stream = process.stdout;
            }
        },
        
        /**
         * 
         * @method writeComposition
         */
        writeComposition: function () {
            var composition = this.composition,
                len = composition.length,
                i = 0,
                component, val
            ;
            
            for (; i < len; i++) {
                component = composition[i];
                if (component.value) {
                    val = component.value;
                }
                else if (component.url) {
                    val = component.url;
                }
                else if (component.command) {
                    val = component.command + " " + component.arguments.join(' ');
                }
                else if (component.path) {
                    val = FS.readFileSync(component.path, "utf8");
                }
                
                this.stream.write(val + "\n");
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