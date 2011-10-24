
(function (exports) {
    
    var util         = require('stitch/util'),
        Proteus      = require("stitch/util/proteus").Proteus,
        Driver       = require('stitch/driver').Driver,
        ModuleDriver = require('stitch/driver/module').Driver,
        ConfigModel  = require('stitch/model/config').Model
    ;
    
    exports.Driver = Proteus.createObject(Driver, {
        
        get sourcePaths () {
            return this.context.sourcePaths;
        },
        
        set sourcePath (path) {
            this.sourcePaths.push(path);
        },
        
        set description (txt) {
            this.setDescription(txt);
        },
        
        set desc (txt) {
            this.setDescription(txt);
        },
        
        setDescription: function (txt) {
            ModuleDriver.description = txt;
            return this;
        },
        
        setDesc: util.aliasMethod("setDescription"),
        
        module: function (name, fn) {
            var mod = this.context.getModule(name);
            
            if (!mod) {
                mod = this.context.createModule(name);
            }
            
            ModuleDriver.context = mod;
            
            if (fn) {
                ModuleDriver.run(fn);
            }
            
            ModuleDriver.context = null;
            
            return this;
        },
        
        filter: function () {
            return this;
        }
        
    });
    
}(exports));