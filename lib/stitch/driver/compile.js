
(function (exports) {
    
    var Proteus = require("proteus"),
        util    = require('../util'),
        Driver  = require('../driver.js').Driver,
        ModuleModel = require("../model/module").Model,
        FilterModel = require("../model/filter").Model,
        O       = Object,
        hasOwnProp = O.hasOwnProperty,
        CompileDriver
    ;
    
    exports.Driver = CompileDriver = Proteus.create(Driver, {
        require: function (args) {
            this.compileModule(ModuleModel.find(args));
        },
        
        include: function (args) {
            var fullpath,
                filters;

            if (this.context.type === args.type) {
                fullpath = this.resolvePath(args.path);
            }
            
            filters = FilterModel.find({
                phase: FilterModel._PHASES.compile
            });
            
            this.composition.push({
                include: {
                    path: fullpath
                }
            });
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
            return this.composition;
        }
    });
    
}(exports));