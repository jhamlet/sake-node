
(function (exports) {
    
    var Path        = require("path"),
        util        = require('../util'),
        BaseModel   = require('../model').Model,
        BundleModel = require("./bundle").Model,
        reqRegex    = /(?:([^:]+):)?(.*)/,
        ConfigModel
    ;
    
    exports.Model = ConfigModel = BaseModel.derive({
        
        self: {
            id: "ConfigModel",
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
            
            ConfigModel.__super__.init.apply(this, arguments);
        },
        
        resolveSourcePath: function (path) {
            var cwd = process.cwd(),
                srcPaths, i, fullpath;
            
            if (Path.existsSync(Path.join(cwd, path))) {
                return Path.normalize(path);
            }
            
            srcPaths = this.sourcePaths;
            i = srcPaths.length;
            
            while (i--) {
                fullpath = Path.normalize(Path.join(cwd, srcPaths[i], path));
                if (Path.existsSync(fullpath)) {
                    return fullpath;
                }
            }
            
            throw "Could not find '" + path + "' within " +
                srcPaths.map(function (p) {
                    return Path.normalize(Path.join(cwd, p));
                }).join(", ");
        },
        
        bundle: function (name, doNotCreate) {
            var cfgName, bndl;
            
            name = name.replace(reqRegex, function () {
                cfgName = arguments[1];
                return arguments[2];
            });
            
            bndl = BundleModel.find({
                name: name,
                configuration: cfgName ? ConfigModel.get(cfgName).id : this.id
            })[0];

            if (bndl) {
                return bndl;
            }
            else if (!doNotCreate) {
                bndl = new BundleModel(name);
                bndl.configuration = this.id;
                return bndl;
            }
        }
        
    });
    
}(exports));