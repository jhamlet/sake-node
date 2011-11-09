var Proteus = require("proteus"),
    util    = require("./util"),
    Driver
;

module.exports = Driver = Proteus.create({
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

    run: function (fn, ctx) {
        var tmpCtx;
        
        if (ctx) {
            tmpCtx = this.context;
            this.context = ctx;
        }
        
        fn.call(this, this);
        
        if (ctx) {
            this.context = tmpCtx;
        }
        
        return this;
    }
    
});

Object.defineProperty(Driver, "init", {
    value: function () {
        Object.defineProperty(this, "__context__", {
            writable: true
        });
    }
});

Driver.init();
