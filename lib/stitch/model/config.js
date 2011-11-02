
(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model').Model,
        ModuleModel = require("./module").Model,
        ConfigModel
    ;
    
    exports.Model = ConfigModel = BaseModel.derive({
        
        self: {
            /**
             * Override the standard get function to retrieve by name, and if
             * the named configuration does not exist, create it.
             */
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
        
        init: function (name, desc) {
            this.name = name;
            this.description = desc || "";
            this.sourcePaths = [];
        },
        
        createFilter: function (name, type, phase, fn) {
            
        },
        
        createModule: function (name) {
            var mod = this.getModule(name);
            
            if (!mod) {
                mod = new ModuleModel(name);
                mod.configuration = this.name;
            }
            
            return mod;
        },
        
        /**
         * Get a ModuleModel for this configuration
         */
        getModule: function (name) {
            return ModuleModel.find({name: name, configuration: this.name})[0];
        },
        
        /**
         * Get all ModuleModels defined for this configuration, ordered by id
         */
        getModules: function () {
            return ModuleModel.find({configuration: this.name}, function (a, b) {
                return a.id - b.id;
            });
        }
        
    });
    
}(exports));