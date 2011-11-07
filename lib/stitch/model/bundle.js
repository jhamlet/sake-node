
(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model').Model,
        BundleModel
    ;
    
    exports.Model = BundleModel = BaseModel.derive({
        
        self: {
            id: "BundleModel",
            
            get: function (id) {
                return BaseModel.get.call(this, id) || this.getByName(id);
            },
            
            getByName: function (name) {
                return this.find({name: name});
            }
        },
        
        init: function (name, desc) {
            this.name = name;
            this.description = desc || '';
            this.composition = [];
            this.compileFilters = [];
            this.renderFilters = [];
            
            BundleModel.__super__.init.apply(this, arguments);
        }
        
    });
    
}(exports));