
var util    = require('../util'),
    Model   = require('../model'),
    BundleModel
;

module.exports = BundleModel = Model.derive({
    
    self: {
        id: "BundleModel",
        
        get: function (id) {
            return Model.get.call(this, id) || this.getByName(id);
        },
        
        getByName: function (name) {
            return this.find({name: name});
        }
    },
    
    init: function (name, desc) {
        this.name = name;
        this.description = desc || '';
        this.composition = [];
        
        BundleModel.__super__.init.apply(this, arguments);
    }
    
});
