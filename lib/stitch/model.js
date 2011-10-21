
(function (exports) {
    
    var util    = require('stitch/util'),
        Proteus = require('stitch/proteus'),
        Model
    ;
    
    exports.Model = Model = Proteus.create({
        // Static properties
        extended: function (proteus) {
            proteus.__uuid__ = 1;
            proteus.records = {};
        },
        
        created: function (rec, args) {
            var id = rec.id = this.__uuid__++;
            this.records[id] = rec;
            Model.__super__.created.call(this, rec, args);
        },
        
        get: function (id) {
            return this.records[id];
        },
        
        find: function (args) {
            
        },
        
        destroy: function (id) {
            delete this.records[id];
        }
        
    }, {
        // Instance properties
        destroy: function () {
            this.__proteus__.destroy(this.id);
        }

    });
    
}(exports));