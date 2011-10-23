
(function (exports) {
    
    var util    = require('stitch/util'),
        Proteus = require('stitch/util/proteus'),
        Model
    ;
    
    exports.Model = Model = Proteus.create({
        destroy: function () {
            this.__model__.destroy(this.id);
        }
    }).augment({
        
        extended: function (subclass) {
            subclass.records = [];
            subclass.__uuid__ = 1;
        },
        
        initialized: function (rec, args) {
            var id = rec.id = this.__uuid__++;
            rec.__model__ = this;
            this.records[id] = rec;
            this._super();
        },

        get: function (id) {
            return this.records[id];
        },

        find: function (args) {

        },

        destroy: function (id) {
            delete this.records[id];
        }
    });
            
}(exports));