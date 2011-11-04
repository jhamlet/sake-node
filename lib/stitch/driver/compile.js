
(function (exports) {
    
    var Proteus = require("proteus"),
        Path    = require("path"),
        util    = require('../util'),
        Driver  = require('../driver').Driver,
        BundleModel = require("../model/bundle").Model,
        FilterModel = require("../model/filter").Model,
        O       = Object,
        hasOwnProp = O.hasOwnProperty,
        CompileDriver
    ;
    
    exports.Driver = CompileDriver = Proteus.create(Driver, {
        resolvePath: function (path) {
            var srcPaths = this.context.configuration.sourcePaths,
                i = srcPaths.length,
                fullpath
            ;
            
            while (--i) {
                fullpath = Path.join(srcPaths[i], path);
                if (Path.existsSync(fullpath)) {
                    return fullpath;
                }
            }
            
            throw "Could not find '" + path + "' within " +
                JSON.stringify(srcPaths);
        },
        
        include: function (args) {
            this.compileBundle(BundleModel.get(args.id));
        },
        
        file: function (args) {
            var fullpath,
                filters;

            if (this.context.type !== args.type) {
                return;
            }
                        
            this.composition.push({
                path: args.path
            });
        },
        
        compileBundle: function (bun) {
            var list = bun.composition,
                len = list.length,
                i = 0,
                hasOwn = hasOwnProp,
                component, key
            ;
            
            for (; i < len; i++) {
                component = list[i];
                for (key in component) {
                    if (hasOwn.call(component, key) &&
                        util.isFunction(this[key])
                    ) {
                        this[key].call(this, component);
                    }
                }
            }
        },
        
        run: function (ctx) {
            this.composition = [];
            this.context = ctx;
            
            this.compileBundle(ctx.bundle);
            this.filterComposition();
            
            return this.composition;
        }
    });
    
}(exports));