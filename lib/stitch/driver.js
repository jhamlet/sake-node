var Proteus = require("proteus"),
    util    = require("./util"),
    Driver, StitchDriver
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
        var tmpGlobal = util.swapInterface(global, this),
            tmpStitch,
            tmpCtx;
        
        if (global.stitch) {
            tmpStitch = util.swapInterface(stitch, this);
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
            util.swapInterface(stitch, tmpStitch);
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

StitchDriver = require("./driver/stitch");