
(function (exports) {

var Path        = require('path'),
    FS          = require('fs'),
    stitch      = require('stitch'),
    util        = require('stitch/util'),
    ProtoClass  = require('stitch/proto-class'),
    moduleDir       = Path.dirname(module.filename),
    commandsDir     = Path.join(moduleDir, 'commands'),
    commandFiles    = FS.readdirSync(commandsDir),
    Module
;

// Internal functions
function formatComment (txt) {
    return "/*! \n * " + txt.split("\n").join("\n * ") + "\n */\n";
}

Module = ProtoClass.create({
    init: function (name, desc) {
        this.name = name;
        this.description = desc;
        this.composition = [];
    },
    
    /**
     * Fetch an external resource to be included
     * @method fetch
     * @param uri {string} uri of asset to load
     * @param type {string} asset type
     * @returns {object} the Module instance
     */
    fetch: function (uri, type) {
        
        return this;
    },
    
    /**
     * Insert a comment into the module
     * @method comment
     * @param txt {string} content of the comment
     * @returns {object} the Module instance
     */
    comment: function (txt) {
        this.composition.push({
            toString: function () {
                return formatComment(txt);
            }
        });
        return this;
    },
    
    /**
     * Include a file as a comment
     * @method include_comment
     * @param path {string} path to a file
     * @returns {object} the Module instance
     */
    include_comment: function (path) {
        var txt = "file path of text";
        this.composition.push({
            toString: function () {
                return formatComment(txt);
            }
        });
        return this;
    },
    
    /**
     * Require another module
     * @method require
     * @param module {string} module name to include
     * @returns {object} the Module instance
     */
    require: function (module) {
        this.composition.push({
            toString: function () {
                // return stitch.module(module).render();
            }
        });
        return this;
    },
    
    /**
     * Add a filter to this modules output.
     * @method filter
     * @param type {string} type of assets to filter
     * @param name {string} optional, name of the filter
     * @param fn {function} function to filter the output
     * @returns {object} the Module instance
     */
    filter: function (type, name, fn) {
        
        return this;
    },
    
    /**
     * 
     * @method compose
     * @returns {object} the Module instance
     */
    compose: function () {
        this.composed = true;
        return this;
    },
    
    render: function (type) {
        if (!this.composed) {
            this.compose();
        }
        return "Render some output...\n" + this.composition.join("\n");
    }
});

commandFiles.forEach(function (filename) {
    util.merge(
        Module.prototype,
        require(Path.join(commandsDir, filename))
    );
});

exports.Class = Module;

}(exports || window));