
var Path        = require("path"),
    util        = require('../util'),
    Model       = require('../model'),
    BundleModel = require("./bundle"),
    reqRegex    = /(?:([^:]+):)?(.*)/,
    ConfigModel
;

module.exports = ConfigModel = Model.derive({
    
    self: {
        id: "ConfigModel",
        /**
         * Override the standard get function to retrieve by name, and if
         * the named configuration does not exist, create it.
         */
        get: function (id) {
            var rec;
            
            id = id || "default";
            
            rec = Model.get.call(this, id) || this.getByName(id);
            
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
        
        ConfigModel.__super__.init.apply(this, arguments);
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
