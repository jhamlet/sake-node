
(function (exports) {

    var Proteus = require("proteus"),
        FS      = require("fs"),
        util    = require("./util"),
        StitchScope = require("./scope"),
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
                StitchScope.runInNewGlobal(
                    FS.readFileSync(path, "utf8"),
                    this,
                    path
                );
            }
        },

        /**
         * Run a function with the Driver's context object set.  
         * 
         * @method run
         * @param fn {string|function} some code, or a function to run
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

                StitchScope.callWithNewGlobalInterface(fn, this, this);
                
                if (ctx) {
                    this.context = tmpCtx;
                }

                return this;
            }
        }
    });

    Driver.init();

}(exports));
