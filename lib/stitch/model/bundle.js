
(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model').Model,
        BundleModel
    ;
    
    exports.Model = BundleModel = BaseModel.derive({
        
        init: function (name, desc) {
            this.name = name;
            this.description = desc || '';
            this.composition = [];
        }
        
    });
    
}(exports));