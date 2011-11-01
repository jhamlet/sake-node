
(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model').Model,
        ModuleModel = require("./module").Model,
        ConfigModel
    ;
    
    exports.Model = ConfigModel = BaseModel.derive({
        
        self: {
            get: function (id) {
                var rec;

                if (util.isNumber(id)) {
                    return this.get(id);
                } else if (!id) {
                    id = "default";
                }

                rec = this.find({name: id})[0];
                
                if (!rec) {
                    rec = new this(id);
                }

                return rec;
            }
        },
        
        init: function (name) {
            this.name = name;
            this.sourcePaths = [];
        },
        
        createFilter: function (name, type, phase, fn) {
            
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
            return ModuleModel.find({name: name, configuration: this.name})[0];
        },
        
        getModules: function () {
            return ModuleModel.find({configuration: this.name}, function (a, b) {
                return a.id - b.id;
            });
        }
        
    });
    
}(exports));