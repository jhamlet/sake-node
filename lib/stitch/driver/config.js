
(function (exports) {
    
    var util         = require('stitch/util'),
        Driver       = require('stitch/driver').Driver,
        ModuleDriver = require('stitch/driver/module').Driver
    ;
    
    util.merge(exports.Driver = Object.create(Driver, {
        sourceDirectories: {
            get: function () {
                return this.context.sourceDirectories;
            },
            
            enumerable: true
        },
        
        sourceDirectory: {
            set: function (path) {
                this.sourceDirectories.push(path);
            },
            
            enumerable: true
        },
        
        description: {
            set: function (txt) {
                ModuleDriver.description = txt;
            },
            
            enumerable: true
        },
        
        desc: {
            set: function (txt) {
                this.description = txt;
            },
            
            enumerable: true
        }
        
    }), {
        
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
    });
    
}(exports));