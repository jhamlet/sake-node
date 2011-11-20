
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

                if (!this.__context__) {
                    Object.defineProperty(this, "__context__", {
                        value: undefined,
                        writable: true
                    });
                }
                
                if (this.beforeContextChanged) {
                    this.beforeContextChanged(ctx, c);
                }

                this.__context__ = c;

                if (this.contextChanged) {
                    this.contextChanged(c, ctx);
                }
            }
        },
        
        runStitchfile: {
            value: function (path) {
                if (!this.__runContext__) {
                    Object.defineProperty(this, "__runContext__", {
                        value: VM.createContext(this)
                    });
                }
                
                VM.runInContext(
                    FS.readFileSync(path, "utf8"),
                    this.__runContext__,
                    path
                );
            }
        },

        /**
         * Run a function with the Driver's context object set.  
         * 
         * @method run
         * @param fn {function} a function to run
         * @param ctx {object} optional, a new context object to use for the
         *      current run of the function
         * @returns {object} Driver
         */
        run: {
            value: function (fn, ctx) {
                var tmpCtx, result;
                
                if (ctx) {
                    tmpCtx = this.context;
                    this.context = ctx;
                }

                result = fn.call(this, this);
                
                if (tmpCtx) {
                    this.context = tmpCtx;
                }

                return this;
            }
        }
    });
    
}(exports));
