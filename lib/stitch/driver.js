
(function (exports) {

    var Proteus = require("proteus"),
        util    = require("./util"),
        Driver  = module.exports
    ;

    /**
     * @property context
     * @type {object}
     * @private
     */
    Object.defineProperty(Driver, "context", {
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
    });

    /**
     * Run a function with the Driver's context object set.  Also, swap out
     * the Driver's interface onto the global object (and 'stitch' if defined),
     * to make the Driver's method available, well, globally.
     * 
     * Put everything back the way we found it when we are done running the
     * function.
     * 
     * @method run
     * @param fn {function} a function to run
     * @param ctx {object} optional, a new context object to use for the
     *      current run of the function
     * @returns {object} Driver
     */
    Object.defineProperty(Driver, "run", {
        value: function (fn, ctx) {
            var tmpGlobal = util.swapInterface(global, this),
                tmpStitch,
                tmpCtx;

            if (global.stitch) {
                tmpStitch = util.swapInterface(global.stitch, this);
            }

            if (ctx) {
                tmpCtx = this.context;
                this.context = ctx;
            }

            fn.call(this, this);

            if (ctx) {
                this.context = tmpCtx;
            }

            util.swapInterface(global, tmpGlobal);
            if (global.stitch) {
                util.swapInterface(global.stitch, tmpStitch);
            }

            return this;
        }
    });

    /**
     * Make sure each driver has its own __context__ property.
     * Sub-Driver objects should call 'init' in their module files
     */
    Object.defineProperty(Driver, "init", {
        value: function () {
            Object.defineProperty(this, "__context__", {
                writable: true
            });
        }
    });

    Driver.init();

}(exports));
