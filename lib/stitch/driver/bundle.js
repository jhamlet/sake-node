
(function (exports) {

    var Proteus = require("proteus"),
        util    = require('../util'),
        ConfigModel = require("../model/config").Model,
        FilterModel = require("../model/filter").Model,
        TypeModel   = require("../model/type").Model,
        Driver  = require('../driver').Driver,
        BundleDriver,
        Types, mime, type
    ;
    
    function bindType (type) {
        return function (fn) {
            BundleDriver.__currentType__ = type;
            BundleDriver.run(fn);
            delete BundleDriver.__currentType__;
        };
    }
    
    function updateBindings (type) {
        var methods = [type.name].concat(type.extensions),
            len = methods.length,
            i = 0,
            name
        ;
        
        for (; i < len; i++) {
            name = methods[i];
            if (!BundleDriver[name]) {
                BundleDriver[name] = bindType(type);
            }
        }
    }
    
    exports.Driver = BundleDriver = Proteus.create(Driver, {
        
        get description () {
            return this.context.description;
        },
        
        /**
         * Add to the current bundle's description, or store it for the next
         * one to be created.
         * @property description
         * @type {string}
         */
        set description (txt) {
            var ctx  = this.context,
                desc = ctx.description;
            
            ctx.description += desc.length ? " " + txt : txt;
        },
        
        get desc () {
            return this.context.description;
        },
        
        set desc (txt) {
            this.description = txt;
        },
        
        /**
         * Include another bundle to this one
         * @method include
         * @param name {string} bundle name
         * @returns {BundleDriver}
         */
        include: function (name) {
            var ctx = this.context,
                bndl = ctx.configuration.bundle(name, true)
            ;
            
            if (!bndl) {
                throw new Error(
                    "No bundle '" + name + "' exists in configuration '" +
                    this.configuration.name + "'."
                );
            }
            
            ctx.composition.push({
                include: {
                    id: bndl.id,
                }
            });
            
            return this;
        },
        
        /**
         * Include an asset file.
         * 
         * @method file
         * @param type {string} optional, asset type. If not passed, will try
         *      determine from the path above.
         * @param path {string} path to the file to include
         * @returns {BundleDriver}
         */
        file: function (type, path) {
            if (!path) {
                path = type;
                type = this.__currentType__ || TypeModel.fromPath(path);
            }
            
            type = TypeModel.get(type);
            
            this.context.composition.push({
                file: {
                    path: path,
                    type: type.id
                }
            });
            return this;
        },
        
        add: util.aliasMethod("file"),
        
        insert: function (type, val) {
            if (!val) {
                val = type;
                type = this.__currentType__ || "text/plain";
            }
            
            type = TypeModel.get(type);
            
            this.context.composition.push({
                insert: {
                    value: val,
                    type: type.id
                }
            });
            
            return this;
        },
        
        /**
         * Include an external resource. The 'type' parameter is not optional.
         * 
         * @method fetch
         * @param type {string} optional, type of asset returned
         * @param uri {string} uri to fetch from
         * @returns {BundleDriver}
         */
        fetch: function (type, uri) {
            if (!uri) {
                uri = type;
                // need to error here if not defined
                type = this.__currentType__;
            }
            
            type = TypeModel.get(type);
            
            this.context.composition.push({
                fetch: {
                    uri: uri,
                    type: type.id
                }
            });
            return this;
        },
        
        
        /**
         * Execute a shell command to use as an asset.
         * 
         * @method exec
         * @param type {string} asset type returned by command
         * @param cmd {string} command to execute
         * @param args {array} array of arguments to pass to the command
         * @returns {BundleDriver}
         */
        exec: function (type, cmd, args) {
            type = TypeModel.get(type);
            this.context.composition.push({
                exec: {
                    command: cmd,
                    type: type.id,
                    arguments: args
                }
            });
            return this;
        },
        
        /**
         * Run, or add a filter to this bundle. Bundle filters run at the point
         * they are encountered in the composition, unlike configuration, or
         * global filters which run after all bundles have been compiled,
         * and/or are ready to be rendered.
         * 
         * @method filter
         * @param type {string} optional, type of asset to filter, defaults to "all"
         * @param name {string} name of the filter
         * @param phase {string} optional, when to run the filter, "compile",
         *      "render", "all"
         * @param fn {function} optional, the function that will filter
         * @returns {BundleDriver}
         */
        // TODO: look up a defined filter if not all arguments are passed
        filter: function (type, name, phase, fn) {
            var f = new FilterModel(type, phase, fn);
            this.context.addFilter(f);
            return this;
        }
        
    });
    
    TypeModel.on("created", updateBindings);
    TypeModel.on("updated", updateBindings);
    
    require("../types");
    
}(exports));