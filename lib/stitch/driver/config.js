
var Proteus      = require("proteus"),
    Path         = require("path"),
    util         = require('../util'),
    Driver       = require('../driver'),
    BundleDriver = require('./bundle'),
    ConfigModel  = require('../model/config'),
    BundleModel  = require("../model/bundle"),
    ConfigDriver
;

module.exports = ConfigDriver = Proteus.create(Driver, {
    
    id: "ConfigDriver",
    
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
    
    //-----------------------------------------------------------------------
    // Globals to undefine when in ConfigDriver scope
    //-----------------------------------------------------------------------
    configure:  undefined,
    config:     undefined
    
});

ConfigDriver.init();
