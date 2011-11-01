
(function (exports) {
    
    var Proteus      = require("proteus"),
        util         = require('../util'),
        Driver       = require('../driver.js').Driver,
        ModuleDriver = require('./module').Driver,
        ConfigModel  = require('../model/config').Model,
        FilterModel  = require('../model/filter').Model,
        ConfigDriver
    ;
    
    exports.Driver = ConfigDriver = Proteus.create(Driver, {
        
        /**
         * Directory paths to look for included files in.
         * These are tried in reverse order.
         * 
         * @property sourcePaths
         * @type {array[string]}
         */
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
        
        get description () {
            return ModuleDriver.description;
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
         * 
         * @method filter
         * @returns {type}
         */
        // name, type, phase, fn => define filter for type and phase
        // name, fn => define filter (all types, phase = render)
        // name, phase, fn => define filter for phase (type = all)
        // name, type, fn => define filter for type (phase = render)
        // name, type, phase => get filter of name, type and phase
        // name, phase => get filter of name and phase
        // name, type => get filter of name and type (phase = render)
        // name => get filters of name
        filter: function () {
            // var name   = arguments[0],
            //     phases = FilterModel._PHASES,
            //     phase  = phases.render,
            //     type   = "all",
            //     fn, filter;
            // 
            // switch (arguments.length) {
            //     case 2:
            //         if (util.isFunction(arguments[1])) {
            //             fn = arguments[1];
            //         }
            //         else if (phases[arguments[1]]) {
            //             phase = arguments[1];
            //         }
            //         else {
            //             type = arguments[1];
            //         }
            //         break;
            //     case 3:
            //         type = arguments[1];
            //         phase = arguments[2];
            //         
            //         if (util.isFunction(phase)) {
            //             fn = arguments[2];
            //             phase = phases.render;
            //         }
            //         
            //         if (phases[type]) {
            //             phase = type;
            //             type = "all";
            //         }
            //         break;
            //     case 4:
            //         type = arguments[1];
            //         phase = arguments[2];
            //         fn = arguments[3];
            //         break;
            // }
            // 
            // filter = FilterModel.find({
            //     name: name,
            //     type: type,
            //     phase: phase,
            //     configuration: this.context.name
            // });
            // 
            // if (!filter) {
            //     filter = this.context.createFilter(name, type, phase);
            //     filter.configuration = this.context.name;
            // }
            // 
            // if (fn) {
            //     filter.fn = fn;
            //     return this;
            // }
            // 
            // return filter;
            return this;
        }
        
    });
    
}(exports));