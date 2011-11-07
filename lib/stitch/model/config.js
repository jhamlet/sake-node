
(function (exports) {
    
    var Path        = require("path"),
        util        = require('../util'),
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
                
                id = id || "default";
                
                rec = BaseModel.get.call(this, id) || this.getByName(id);
                
                if (rec) {
                    return rec;
                }
                
                return new this(id);
            },
            
            getByName: function (name) {
                return this.find({name: name})[0];
            }
        },
        
        init: function (name, desc) {
            this.name = name;
            this.description = desc || "";
            this.sourcePaths = [];
        },
        
        resolveSourcePath: function (path) {
            var srcPaths, i, fullpath;
            
            if (Path.existsSync(path)) {
                return path;
            }
            
            srcPaths = this.sourcePaths;
            i = srcPaths.length;
            
            while (--i) {
                fullpath = Path.join(srcPaths[i], path);
                if (Path.existsSync(fullpath)) {
                    return fullpath;
                }
            }
            
            throw "Could not find '" + path + "' within " +
                JSON.stringify(srcPaths);
        },
        
        bundle: function (name, doNotCreate) {
            var bndl = BundleModel.find({
                    name: name,
                    configuration: this
                })[0];

            if (bndl) {
                return bndl;
            }
            else if (!doNotCreate) {
                bndl = new BundleModel(name);
                bndl.configuration = this;
                return bndl;
            }
        }
        
    });
    
}(exports));