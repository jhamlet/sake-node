
(function (exports) {
    
    var util        = require('stitch/util'),
        BaseModel   = require('stitch/model').Model,
        ModuleModel = require("stitch/model/module").Model,
        ConfigModel
    ;
    
    exports.Model = ConfigModel = BaseModel.derive({
        
        init: function (name) {
            this.name = name;
            this.sourcePaths = [];
        },
        
        createModule: function (name, desc) {
            var mod = this.getModule(name);
            
            if (!mod) {
                mod = new ModuleModel(name, desc);
                mod.configuration = this.name;
            }
            
            return mod;
        },
        
        getModule: function (name) {
            return ModuleModel.find({name: name, configuration: this.name});
        }
        
    }).extend({
        get: function (id) {
            var u = util,
                rec
            ;

            if (u.isNumber(id)) {
                return this.get(id);
            } else if (!id) {
                id = "default";
            }

            rec = this.find({name: id});
            
            if (!rec) {
                rec = new this(id);
            }
            
            return rec;
        }
        
    });
    
}(exports));