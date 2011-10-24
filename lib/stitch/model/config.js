
(function (exports) {
    
    var util        = require('stitch/util'),
        BaseModel   = require('stitch/model/base').Model,
        ModuleModel = require("stitch/model/module").Model,
        ConfigModel
    ;
    
    exports.Model = ConfigModel = BaseModel.derive({
        
        init: function (name) {
            ConfigModel.__super__.init.call(this, name);
            this.sourcePaths = [];
            this.ModuleModel = ModuleModel.derive();
        },
        
        createModule: function (name) {
            return new this.ModuleModel(name);
        },
        
        getModule: function (name) {
            return this.ModuleModel.find({name: name});
        }
        
    }).extend({
        /**
         * If an argument is not supplied, assume "default"
         */
        get: function (id) {
            if (!id) {
                id = "default";
            }
            
            return BaseModel.get.call(this, id);
        }
        
    });
    
}(exports));