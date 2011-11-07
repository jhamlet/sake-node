
(function (exports) {
    
    var Proteus     = require("proteus"),
        Path        = require('path'),
        util        = require('../util'),
        ConfigModel = require("../model/config").Model,
        TypeModel   = require("../model/type").Model,
        FilterModel = require("../model/filter").Model,
        Driver      = require('../driver').Driver,
        ConfigDriver = require('./config').Driver,
        BundleDriver = require("./bundle").Driver,
        StitchDriver
    ;
    
    exports.Driver = StitchDriver = Proteus.create(Driver, {

        get stitch () { return StitchDriver; },
        
        set stitch (v) {},
        
        get options () { return StitchDriver.context.options; },
        
        set options (v) {},
        
        get environment () { return StitchDriver.context.environment; },
        
        set environment (v) {},
        
        get env () { return StitchDriver.context.environment; },
        
        set env (v) {},
        
        define_type: function (name, mime, ext) {
            return new TypeModel(name, mime, ext);
        },
        
        type: function (name) {
            return TypeModel.getByName(name) ||
                TypeModel.getByMime(name) ||
                TypeModel.getByExtension(name);
        },
        
        define_filter: function (name, fn) {
            return new FilterModel(name, fn);
        },
        
        /**
         * Include one, or more, stitch configuration files
         * 
         * @method include
         * @param rest {string} list of absolute or relative paths
         */
        include: function (/* rest */) {
            var len = arguments.length,
                i = 0,
                root, path
            ;
            
            root = Path.dirname(module.parent.parent.filename);

            for (; i < len; i++) {
                path = Path.join(root, arguments[i]);
                require(path);
            }
        },

        /**
         * Retrieve or define a configuration.
         * 
         * If name is omitted, returns the default configuration.
         * 
         * The supplied function is then run in the scope of the named 
         * configuration, or default.
         * 
         * @method configure
         * @param name {string} optional, name of the configuration, defaults
         *      to "default".
         * @param fn {function} optional, function to run to define the
         *      named configuration.
         * @returns {type}
         */
        configure: function () {
            var cfg, name, fn;
            
            if (util.isFunction(arguments[0])) {
                fn = arguments[0];
            }
            else {
                name = arguments[0];
                fn = arguments[1];
            }
            
            cfg = ConfigModel.get(name);
            
            if (fn) {
                ConfigDriver.context = cfg;
                ConfigDriver.run(fn);
            }
            
            return ConfigDriver;
        },
        
        config: util.aliasMethod("configure")

    });
    
    StitchDriver.init();

}(exports));