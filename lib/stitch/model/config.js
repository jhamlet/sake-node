
(function (exports) {
    
    var util    = require('stitch/util'),
        Model   = require('stitch/model').Model,
        ModuleModel = require("stitch/model/module").Model
    ;
    
    exports.Model = Model.derive({
        
        init: function (name) {
            this.name = name;
            this.sourcePaths = [];
            this.ModuleModel = ModuleModel.derive();
        },
        
        createModule: function (name) {
            return new this.ModuleModel(name);
        },
        
        getModule: function (name) {
            return this.ModuleModel.find({name: name});
        }
        
    });
    
}(exports));