
(function (exports) {
    
    var util         = require('stitch/util'),
        Proteus      = require("stitch/util/proteus"),
        Driver       = require('stitch/driver'),
        ModuleDriver = require('stitch/driver/module')
    ;
    
    util.merge(exports, Proteus.createObject({
        
        get sourceDirectories () {
            return this.context.sourceDirectories;
        },
        
        set sourceDirectory (path) {
            this.sourceDirectories.push(path);
        },
        
        set description (txt) {
            ModuleDriver.description = txt;
        },
        
        set desc (txt) {
            this.description = txt;
        },
        
        module: function (name, fn) {
            if (!fn) {
                return this.context.modules.get(name);
            }

            ModuleDriver.context = this.context.modules.getOrCreate(name);
            ModuleDriver.run(fn);

            return ModuleDriver;
        },
        
        filter: function () {
            
        }
        
    }));
    
}(exports));