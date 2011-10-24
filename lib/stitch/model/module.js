
(function (exports) {
    
    var util        = require('stitch/util'),
        BaseModel   = require('stitch/model/base').Model,
        ModuleModel
    ;
    
    exports.Model = ModuleModel = BaseModel.derive({
        
        init: function (name, desc) {
            ModuleModel.__super__.init.call(this, name);
            this.description = desc || '';
            this.composition = [];
        }
        
    });
    
}(exports));