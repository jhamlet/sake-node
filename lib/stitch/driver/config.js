
(function (exports) {
    
    var Proteus      = require("proteus"),
        util         = require('../util'),
        Driver       = require('../driver').Driver,
        BundleDriver = require('./bundle').Driver,
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
            this.context.description += txt;
        },
        
        get description () {
            return this.context.description;
        },
        
        get desc () {
            return this.description;
        },
        
        set desc (txt) {
            this.description = txt;
        },
        
        /**
         * 
         * @method setDescription
         * @param txt {string}
         * @returns {ConfigDriver}
         */
        setDescription: function (txt) {
            this.context.description = txt;
            return this;
        },
        
        setDesc: util.aliasMethod("setDescription"),
        
        /**
         * 
         * @method bundle
         * @param name {string} name of the bundle
         * @param fn {function} optional, function to run in the bundle scope
         * @returns {ConfigDriver}
         */
        bundle: function (name, fn) {
            var mod = this.context.getModule(name);
            
            if (!mod) {
                mod = this.context.createModule(name);
            }
            
            BundleDriver.context = mod;
            
            if (fn) {
                BundleDriver.run(fn);
            }
            
            BundleDriver.context = null;
            
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
    
    Proteus.defineGetter(ConfigDriver, "__globalInterface__", function () {
        return {
            get sourcePaths () {
                return ConfigDriver.sourcePaths;
            },
            
            set sourcePath (path) {
                ConfigDriver.sourcePath = path;
            },
            
            get description () {
                return ConfigDriver.description;
            },
            
            set description (txt) {
                ConfigDriver.description = description;
            },
            
            set desc (txt) {
                ConfigDriver.description = txt;
            },
            
            setDescription: ConfigDriver.setDescription.bind(ConfigDriver),
            
            setDesc: ConfigDriver.setDescription.bind(ConfigDriver),
            
            bundle: ConfigDriver.bundle.bind(ConfigDriver),
            
            filter: ConfigDriver.filter.bind(ConfigDriver)
        };
    }, {
        enumerable: false,
        configurable: false
    });
    
}(exports));