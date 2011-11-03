
(function (exports) {

    var Proteus = require("proteus"),
        Types   = require("../types"),
        util    = require('../util'),
        ConfigModel = require("../model/config").Model,
        Driver  = require('../driver').Driver,
        BundleDriver,
        mime, type
    ;
    
    function bindType (type) {
        return function (fn) {
            BundleDriver.__currentType__ = type;
            BundleDriver.run(fn);
            BundleDriver.__currentType__ = undefined;
        };
    }
    
    exports.Driver = BundleDriver = Proteus.create(Driver, {
        
        get description () {
            return this.context.description;
        },
        
        /**
         * Add to the current module's description, or store it for the next
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
         * Include another module to this one
         * @method include
         * @param name {string} module name
         * @returns {BundleDriver}
         */
        include: function (name) {
            var ctx = this.context,
                cfg = ConfigModel.find({
                    name: this.context.configuration
                })[0],
                mod = cfg.getModule(name)
            ;
            
            ctx.composition.push({
                include: {
                    id: mod.id,
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
                type = this.__currentType__ || Types.fromPath(path);
            }
            
            this.context.composition.push({
                file: {
                    path: path,
                    type: type
                }
            });
            return this;
        },
        
        add: util.aliasMethod("file"),
        
        insert: function (type, val) {
            if (!val) {
                val = type;
                type = this.__currentType__ || Types["text/plain"];
            }
            
            this.context.composition.push({
                insert: {
                    value: val,
                    type: type
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
                type = this.__currentType__; // need to error here if not defined
            }
            
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
         * @param type {string} asset type returned by command
         * @param cmd {string} command to execute
         * @param args {array} array of arguments to pass to the command
         * @returns {BundleDriver}
         */
        exec: function (type, cmd, args) {
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
         * @param type {string} optional, type of asset to filter, defaults to "all"
         * @param name {string} name of the filter
         * @param phase {string} optional, when to run the filter, "compile",
         *      "render", "all"
         * @param fn {function} optional, the function that will filter
         * @returns {BundleDriver}
         */
        // TODO: look up a defined filter if not all arguments are passed
        filter: function (type, name, phase, fn) {
            this.context.composition.push({
                filter: {
                    name: name,
                    type: type,
                    phase: phase,
                    fn: fn
                }
            });
            return this;
        }
        
    });
    
    Object.defineProperty(BundleDriver, "__globalInterface__", {
        value: {
            get description () {
                return BundleDriver.description;
            },
            
            set description (txt) {
                BundleDriver.description = txt;
            },
            
            get desc () {
                return BundleDriver.description;
            },
            
            set desc (txt) {
                BundleDriver.description = txt;
            },
            
            include: BundleDriver.include.bind(BundleDriver),
            
            file: BundleDriver.file.bind(BundleDriver),

            add: util.aliasMethod("file"),
            
            insert: BundleDriver.insert.bind(BundleDriver),
            
            fetch: BundleDriver.fetch.bind(BundleDriver),
            
            exec: BundleDriver.exec.bind(BundleDriver),
            
            filter: BundleDriver.filter.bind(BundleDriver)
        }
    });
    
    for (mime in Types) {
        type = Types[mime];
        BundleDriver.__globalInterface__[type] =
            BundleDriver[type] =
            bindType(type);
    }
    
    BundleDriver.javascript =
        BundleDriver.__globalInterface__.javascript =
        bindType("js");
               
    BundleDriver.stylesheet =
        BundleDriver.__globalInterface__.stylesheet =
        bindType("css");
               
}(exports));