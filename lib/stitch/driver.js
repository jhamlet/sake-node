
(function (exports) {
    
    var Proteus = require('stitch/util/proteus'),
        _context;
    
    exports.Driver = Proteus.createObject({
        /**
         * @property context
         * @type {Model}
         */
        get context () {
            return _context;
        },
        
        set context (c) {
            var ctx = _context;

            if (this.beforeContextChanged) {
                this.beforeContextChanged(ctx, c);
            }

            this._context = c;

            if (this.contextChanged) {
                this.contextChanged(c, ctx);
            }
        },
        
        run: function (fn) {
            fn.call(this);
        }

    });
    
}(exports));