
(function (exports) {
    
    var Proteus = require('proteus'),
        util    = require('./util'),
        Model
    ;
    
    exports.Model = Model = Proteus.Class.derive({
        
        self: {
            // Class props
            inherited: function (subclass) {
                subclass.records = {};
                subclass.__uuid__ = 1;
            },

            initialize: function (rec, args) {
                var id = rec.id = this.__uuid__++;
                Object.defineProperty(rec, "__model__", {
                    value: this
                });
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
                    ret = [],
                    found, id, rec, key
                ;

                for (rec in records) {
                    rec = records[rec];
                    for (key in args) {
                        if (rec[key] !== args[key]) {
                            found = false;
                            break;
                        }
                        else {
                            found = true;
                        }
                    }
                    if (found) {
                        ret.push(rec);
                    }
                }
                
                return ret.length > 0 ?
                    ret.length === 1 ? ret[0] : ret :
                    null;
            },
            
            destroy: function (id) {
                delete this.records[id];
            }
        },
        
        // Instance props
        destroy: function () {
            this.__model__.destroy(this.id);
        }
        
    });
            
}(exports));