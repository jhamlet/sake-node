
(function (exports) {
    
    var util         = require('stitch/util'),
        Proteus      = require("stitch/util/proteus").Proteus,
        Driver       = require('stitch/driver').Driver,
        ModuleDriver = require('stitch/driver/module').Driver
    ;
    
    exports.Driver = Proteus.createObject(Driver, {
        
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
        
        setDescription: function (txt) {
            this.description = txt;
            return this;
        },
        
        setDesc: util.aliasMethod("setDescription"),
        
        module: function (name, fn) {
            if (!fn) {
                return this.context.modules.get(name);
            }

            // ModuleDriver.context = this.context.modules.getOrCreate(name);
            ModuleDriver.run(fn);

            return this;
        },
        
        filter: function () {
            return this;
        }
        
    });
    
}(exports));