
(function (exports) {

    var Proteus = require("proteus"),
        Types   = require("../types"),
        util    = require('../util'),
        ConfigModel = require("../model/config").Model,
        Driver  = require('../driver.js').Driver
    ;
    
    exports.Driver = Proteus.create(Driver, {
        
        get description () {
            return this.context ? this.context.description : this._description;
        },
        
        /**
         * Add to the current module's description, or store it for the next
         * one to be created.
         * @property description
         * @type {string}
         */
        set description (txt) {
            var ctx = this.context;
            
            if (ctx) {
                ctx.description += txt;
            }
            else {
                if (!this._description) {
                    this._description = "";
                } else {
                    this._description += " ";
                }
                
                this._description += txt;
            }
        },
        
        /**
         * Add anothr module to this one
         * @method require
         * @param name {string} module name
         * @returns {ModuleDriver}
         */
        require: function (name) {
            var ctx = this.context,
                cfg = ConfigModel.find({
                    name: this.context.configuration
                })[0],
                mod = cfg.getModule(name)
            ;
            
            ctx.composition.push({
                require: {
                    id: mod.id,
                }
            });
            
            return this;
        },
        
        /**
         * Include an asset file.
         * 
         * @method include
         * @param path {string} path to the file to include
         * @param type {string} optional, asset type. If not passed, will try
         *      determine from the path above.
         * @returns {ModuleDriver}
         */
        include: function (path, type) {
            if (!type) {
                type = Types.fromPath(path);
            }
            
            this.context.composition.push({
                include: {
                    path: path,
                    type: type
                }
            });
            return this;
        },
        
        /**
         * Include a comment. This will be prefixed with "!" so most
         * minifiers will retain it.
         * 
         * @param txt {string} the comment text
         * @returns {ModuleDriver}
         */
        comment: function (txt) {
            this.context.composition.push({
                comment: {
                    value: txt
                }
            });
            return this;
        },
        
        /**
         * Include a file as a comment.
         * 
         * @method include_comment
         * @param path {string} path to the file
         * @returns {ModuleDriver}
         */
        include_comment: function (path) {
            this.context.composition.push({
                comment: {
                    path: path
                }
            });
            return this;
        },
        
        /**
         * Include an external resource. The 'type' parameter is not optional.
         * 
         * @method fetch
         * @param uri {string} uri to fetch from
         * @param type {string} type of asset returned
         * @returns {ModuleDriver}
         */
        fetch: function (uri, type) {
            this.context.composition.push({
                fetch: {
                    uri: uri,
                    type: type
                }
            });
            return this;
        },
        
        
        /**
         * Execute a shell command to use as an asset.
         * 
         * @method exec
         * @param cmd {string} command to execute
         * @param type {string} asset type returned by command
         * @param args {array} array of arguments to pass to the command
         * @returns {ModuleDriver}
         */
        exec: function (cmd, type, args) {
            this.context.composition.push({
                exec: {
                    command: cmd,
                    type: type,
                    arguments: args
                }
            });
            return this;
        },
        
        /**
         * Run, or add a filter to this module. Module filters run at the point
         * they are encountered in the composition, unlike configuration, or
         * global filters which run after all modules have been compiled,
         * and/or are ready to be rendered.
         * 
         * @method filter
         * @param name {string} name of the filter
         * @param type {string} type of asset to filter
         * @param phase {string} optional, when to run the filter, "compile",
         *      "render", "all"
         * @param fn {function} optional, the function that will filter
         * @returns {ModuleDriver}
         */
        // TODO: look up a defined filter if not all arguments are passed
        filter: function (name, type, phase, fn) {
            this.context.composition.push({
                filter: {
                    name: name,
                    type: type,
                    phase: phase,
                    fn: fn
                }
            });
            return this;
        },
        
        contextChanged: function (newCtx, oldCtx) {
            if (this._description) {
                newCtx.description = this._description;
                delete this._description;
            }
        }
        
    });
                
}(exports));