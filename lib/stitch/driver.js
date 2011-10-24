
(function (exports) {
    
    var util    = require("stitch/util"),
        Proteus = require('stitch/util/proteus').Proteus;
    
    exports.Driver = Proteus.createObject({
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
        }

    });
    
}(exports));