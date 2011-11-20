
var Proteus      = require("proteus"),
    Path         = require("path"),
    util         = require('../util'),
    Driver       = require('../driver'),
    BundleDriver = require('./bundle'),
    ConfigModel  = require('../model/config'),
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
        return this.context.description;
    },
    
    set description (txt) {
        this.context.description += txt;
    },
    
    get desc () {
        return this.description;
    },
    
    set desc (txt) {
        this.description = txt;
    },
    
    get filename_format () {
        return this.context.filenameFormat;
    },
    
    set filename_format (fmt) {
        return this.context.filenameFormat = fmt;
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
    
    setDesc: util.aliasMethod("setDescription", ConfigDriver),
    
    /**
     * 
     * @method bundle
     * @param name {string} name of the bundle
     * @param fn {function} optional, function to run in the bundle scope
     * @returns {ConfigDriver}
     */
    bundle: function (name, fn) {
        var bndl = this.context.bundle(name);
        
        if (fn) {
            BundleDriver.run(fn, bndl);
        }
        
        return this;
    }
});
