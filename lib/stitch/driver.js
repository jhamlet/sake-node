
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
            this.applyGlobalInterface();
            fn.call(this, this);
            this.resetGlobalInterface();
        },
        
        applyGlobalInterface: function () {
            if (this.__globalInterface__) {
                this.__resetInterface__ = util.swapInterface(
                    global,
                    this.__globalInterface__
                );
            }
        },
        
        resetGlobalInterface: function () {
            if (this.__resetInterface__) {
                util.swapInterface(global, this.__resetInterface__);
                delete this.__resetInterface__;
            }
        }

    });
    
}(exports));