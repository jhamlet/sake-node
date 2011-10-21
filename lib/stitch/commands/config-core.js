
(function () {

var Config = require('stitch/config').Config,
    util = require('stitch/util');

Config.include({
    
    set: function (key, value) {
    
    },

    get: function (key) {
    
    },
    
    description: function (txt) {
        if (this.currentDesc === undefined) {
            this.currentDesc = txt;
        }
        else {
            this.currentDesc += "\n" + txt;
        }
        return this;
    },
    
    desc: util.alias("description"),

    /**
     * Include another config file into this one
     * @method include
     * @param path {string} relative path to the config file
     */
    include: function (path) {
        
    },
    
    /**
     * Retrieve a named filter, or define a filter function based on the
     * build phase or the type of asset being generated
     * @method filter
     * @param name {string} name of the filter
     * @param phase {string} optional, 'compose', 'compile', or 'render'
     * @param type {string} optional, type of the asset, or the name of the
     *      command, to apply the filter to
     * @param fn {function} optional, the function to run when all the conditions
     *      are met
     * @returns {object} either the named filter (if no function is passed),
     *      or the config instance
     * 
     * filter('minify', 'render', 'js', function () { ... })
     * filter('minify', 'render', 'js') => config
     * filter(
     *      'handleInclude',
     *      'compose',
     *      'include',
     *      function () {...}
     * ) => config
     */
    filter: function (name, phase, type, fn) {
        
        return this;
    }

});

}());