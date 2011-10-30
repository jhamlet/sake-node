
(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model.js').Model,
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