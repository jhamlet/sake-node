(function () {

var Module = require('stitch/module').Module;

Module.include({
    // Internal functions
    formatComment: function (txt) {
        return "/*! \n * " + txt.split("\n").join("\n * ") + "\n */\n";
    }
});

Module.mixin({
    /**
     * Include a file in the module
     * @method include
     * @param path {string} file path to file
     * @param type {string} optional, asset type
     * @returns {object} the Module instance
     */
    include: function (path, type) {

        return this;
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
                return Module.formatComment(txt);
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
                return Module.formatComment(txt);
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
    }
});
    
}());
