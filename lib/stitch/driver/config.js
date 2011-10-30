
(function (exports) {
    
    var Proteus      = require("proteus"),
        util         = require('../util'),
        Driver       = require('../driver.js').Driver,
        ModuleDriver = require('./module').Driver,
        ConfigModel  = require('./config').Model,
        ConfigDriver
    ;
    
    exports.Driver = ConfigDriver = Proteus.create(Driver, {
        
        get sourcePaths () {
            return this.context.sourcePaths;
        },
        
        set sourcePath (path) {
            this.sourcePaths.push(path);
        },
        
        /**
         * Cumulatively set the description for the next Module
         * 
         * @property description
         * @type {string}
         * @default ""
         */
        set description (txt) {
            this.setDescription(txt);
        },
        
        set desc (txt) {
            this.setDescription(txt);
        },
        
        /**
         * 
         * @method setDescription
         * @param txt {string}
         * @returns {ConfigDriver}
         */
        setDescription: function (txt) {
            ModuleDriver.description = txt;
            return this;
        },
        
        setDesc: util.aliasMethod("setDescription"),
        
        /**
         * 
         * @method module
         * @param name {string} name of the module
         * @param fn {function} optional, function to run in the module scope
         * @returns {ConfigDriver}
         */
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
        
        /**
         * Include another stitch configuration file into the current context
         * 
         * @method include
         * @param path {string} absolute or relative path to the file to
         *      include
         */
        include: function (path) {
            
        },
        /**
         * 
         * @method filter
         * @returns {type}
         */
        filter: function () {
            return this;
        }
        
    });
    
}(exports));