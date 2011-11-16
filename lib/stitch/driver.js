
(function (exports) {

    var Proteus = require("proteus"),
        FS      = require("fs"),
        VM      = require("vm"),
        util    = require("./util"),
        Driver  = module.exports
    ;

    Object.defineProperties(Driver, {
        /**
         * @property context
         * @type {object}
         * @private
         */
        context: {
            get: function () {
                return this.__context__;
            },

            set: function (c) {
                var ctx = this.__context__;

                if (this.beforeContextChanged) {
                    this.beforeContextChanged(ctx, c);
                }

                this.__context__ = c;

                if (this.contextChanged) {
                    this.contextChanged(c, ctx);
                }
            }
        },
        
        /**
         * Make sure each driver has its own __context__ property.
         * Sub-Driver objects should call 'init' in their module files
         * 
         * @method init
         * @param ctx {object} optional, starting value for context
         */
        init: {
            value: function (ctx) {
                Object.defineProperty(this, "__context__", {
                    value: ctx,
                    writable: true
                });
            }
        },
        
        runScriptFile: {
            value: function (path) {
                return VM.runInThisContext(
                    FS.readFileSync(path, "utf8"),
                    path
                );
            }
        },

        /**
         * Run a function with the Driver's context object set.  Also, swap
         * out the Driver's interface onto the global object (and 'stitch'
         * if defined), to make the Driver's method available, well, globally.
         * 
         * Put everything back the way we found it when we are done running
         * the function.
         * 
         * @method run
         * @param fn {string|function} a path to a file, or a function to run
         * @param ctx {object} optional, a new context object to use for the
         *      current run of the function
         * @returns {object} Driver
         */
        run: {
            value: function (fn, ctx) {
                var tmpGlobal, tmpStitch, tmpCtx, result;
                
                // Swap our interface onto the global(s)
                tmpGlobal = util.swapInterface(global, this);
                tmpStitch = util.swapInterface(global.stitch, this);

                if (ctx) {
                    tmpCtx = this.context;
                    this.context = ctx;
                }

                if (typeof fn === "string") {
                    result = this.runScriptFile(fn);
                }
                else {
                    result = fn.call(this, this);
                }

                if (ctx) {
                    this.context = tmpCtx;
                }

                util.swapInterface(global, tmpGlobal);
                util.swapInterface(global.stitch, tmpStitch);

                return result;
            }
        }
    });

    Driver.init();

}(exports));
