
(function (exports) {
    
    var _context;
    
    exports.Driver = Object.create(Object.prototype, {
        /**
         * @property context
         * @type {Model}
         */
        context: {

            get: function () {
                return _context;
            },

            set: function (c) {
                var ctx = _context;

                if (this.beforeContextChanged) {
                    this.beforeContextChanged(ctx, c);
                }

                this._context = c;

                if (this.contextChanged) {
                    this.contextChanged(c, ctx);
                }
            },
            
            enumerable: true
        },
            
        run: {
            value: function (fn) {
                fn.call(this);
            },
            
            enumerable: true
        }
    });
    
}(exports));