
(function (exports) {
    
    var util    = require('stitch/util'),
        Proteus = require('stitch/util/proteus').Proteus,
        Model
    ;
    
    exports.Model = Model = Proteus.createClass().extend({
        // Class props
        inherited: function (subclass) {
            console.log("Model inherited");
            subclass.records = {};
            subclass.__uuid__ = 1;
        },

        initializing: function (rec, args) {
            var id = rec.id = this.__uuid__++;
            rec.__model__ = this;
            this.records[id] = rec;
        },

        get: function (id) {
            return this.records[id];
        },

        find: function (args) {

        },

        destroy: function (id) {
            delete this.records[id];
        }
    }).include({
        // Instance props
        destroy: function () {
            this.__model__.destroy(this.id);
        }
    });
            
}(exports));