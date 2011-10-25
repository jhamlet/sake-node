
(function (exports) {
    
    var util        = require('stitch/util'),
        BaseModel   = require('stitch/model').Model,
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