
(function (exports) {
    
    var util    = require('stitch/util'),
        Proteus = require('stitch/util/proteus').Proteus,
        Model
    ;
    
    exports.Model = Model = Proteus.createClass().extend({
        // Class props
        inherited: function (subclass) {
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
        
        getAll: function () {
            return this.records;
        },

        find: function (args) {
            var records = this.records,
                found, id, rec, key
            ;
            
            for (rec in records) {
                rec = records[rec];
                for (key in args) {
                    if (rec[key] === args[key]) {
                        found = true;
                    }
                    else {
                        found = false;
                    }
                }
                if (found) {
                    return rec;
                }
            }
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