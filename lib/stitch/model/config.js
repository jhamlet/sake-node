
(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model').Model,
        BundleModel = require("./bundle").Model,
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
            var mod = this.getBundle(name);
            
            if (!mod) {
                mod = new BundleModel(name);
                mod.configuration = this.name;
            }
            
            return mod;
        },
        
        /**
         * Get a BundleModel for this configuration
         */
        getBundle: function (name) {
            return BundleModel.find({name: name, configuration: this.name})[0];
        },
        
        /**
         * Get all BundleModels defined for this configuration, ordered by id
         */
        getBundles: function () {
            return BundleModel.find({configuration: this.name}, function (a, b) {
                return a.id - b.id;
            });
        }
        
    });
    
}(exports));