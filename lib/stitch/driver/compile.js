
(function (exports) {
    
    var Proteus = require("proteus"),
        Path    = require("path"),
        util    = require('../util'),
        Driver  = require('../driver.js').Driver,
        ModuleModel = require("../model/module").Model,
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
        
        require: function (args) {
            this.compileModule(ModuleModel.get(args.id));
        },
        
        include: function (args) {
            var fullpath,
                filters;

            if (this.context.type !== args.type) {
                return;
            }
            
            fullpath = this.resolvePath(args.path);
            
            filters = FilterModel.find(
                function (fltr) {
                    var hasCfg = [
                            this.context.configuration.name,
                            "global"
                        ].indexOf(fltr.configuration) > -1,
                        hasType = [
                            this.context.type,
                            "all"
                        ].indexOf(fltr.type) > -1
                    ;
                
                    return (hasCfg && hasType && fltr.phase === "compile");
                }.bind(this),
                function (a, b) { // sort
                    return a.id - b.id;
                }
            );
            
            filters.forEach(function (fltr) {
                fullpath = fltr.fn.apply(
                    this.context,
                    this.context,
                    fullpath
                ) || fullpath;
            });
            
            this.composition.push({
                include: {
                    path: fullpath
                }
            });
        },
        
        filter: function (args) {
            
        },
        
        compileModule: function (mod) {
            var list = mod.composition,
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
            
            this.compileModule(ctx.module);
            this.filterComposition();
            
            return this.composition;
        }
    });
    
}(exports));