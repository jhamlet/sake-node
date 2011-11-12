
var Proteus      = require("proteus"),
    util         = require('../util'),
    Driver       = require('../driver'),
    BundleDriver = require('./bundle'),
    ConfigModel  = require('../model/config'),
    BundleModel  = require("../model/bundle"),
    FilterModel  = require('../model/filter'),
    ConfigDriver
;

module.exports = ConfigDriver = Proteus.create(Driver, {
    
    /**
     * Directory paths to look for included files in.
     * These are tried in reverse order.
     * 
     * @property source_paths
     * @type {array[string]}
     */
    get source_paths () {
        return ConfigDriver.context.sourcePaths;
    },
    
    set source_path (path) {
        ConfigDriver.source_paths.push(path);
    },
    
    /**
     * Cumulatively set the description for the next Module
     * 
     * @property description
     * @type {string}
     * @default ""
     */
    get description () {
        return ConfigDriver.context.description;
    },
    
    set description (txt) {
        ConfigDriver.context.description += txt;
    },
    
    get desc () {
        return ConfigDriver.description;
    },
    
    set desc (txt) {
        ConfigDriver.description = txt;
    },
    
    get filename_format () {
        return ConfigDriver.context.filenameFormat;
    },
    
    set filename_format (fmt) {
        return ConfigDriver.context.filenameFormat = fmt;
    },
    
    /**
     * 
     * @method setDescription
     * @param txt {string}
     * @returns {ConfigDriver}
     */
    setDescription: function (txt) {
        ConfigDriver.context.description = txt;
        return ConfigDriver;
    },
    
    setDesc: util.aliasMethod("setDescription", ConfigDriver),
    
    /**
     * 
     * @method bundle
     * @param name {string} name of the bundle
     * @param fn {function} optional, function to run in the bundle scope
     * @returns {ConfigDriver}
     */
    bundle: function (name, fn) {
        var bndl = ConfigDriver.context.bundle(name);
        
        if (fn) {
            BundleDriver.run(fn, bndl);
        }
        
        return ConfigDriver;
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

ConfigDriver.init();
