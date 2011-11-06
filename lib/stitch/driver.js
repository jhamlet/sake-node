
(function (exports) {
    
    var Proteus = require("proteus"),
        util    = require("./util"),
        Driver
    ;
    
    exports.Driver = Driver = Proteus.create({
        /**
         * @property context
         * @type {Model}
         */
        get context () {
            return this.__context__;
        },

        set context (c) {
            var ctx = this.__context__;

            if (this.beforeContextChanged) {
                this.beforeContextChanged(ctx, c);
            }

            this.__context__ = c;

            if (this.contextChanged) {
                this.contextChanged(c, ctx);
            }
        },

        run: function (fn) {
            fn.call(this, this);
            return this;
        },
        
        runWithContext: function (fn, ctx) {
            this.context = ctx;
            this.run(fn);
            this.context = null;
            return this;
        }

    });
    
}(exports));