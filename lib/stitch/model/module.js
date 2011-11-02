
(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model').Model,
        ModuleModel
    ;
    
    exports.Model = ModuleModel = BaseModel.derive({
        
        init: function (name, desc) {
            this.name = name;
            this.description = desc || '';
            this.composition = [];
        }
        
    });
    
}(exports));