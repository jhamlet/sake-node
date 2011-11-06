
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
        
        include: function (args) {
            this.compileBundle(BundleModel.get(args.id));
        },
        
        file: function (args) {
            var fullpath;

            if (this.context.type !== args.type) {
                return;
            }
            
            fullpath = this.context.config.resolveSourcePath(
                this.applyBundleFilters(args.path)
            );
            
            this.composition.push({
                path: fullpath
            });
        },
        
        compileBundle: function (bndl) {
            var list = bndl.composition,
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
            
            this.applyBundleFilters(bndl);
        },
        
        applyBundleFilters: function (bndl) {
            var list = bndl.compileFilters,
                len = list.length,
                i = 0,
                filter,
                fn
            ;
            
            for (; i < len; i++) {
                filter = FilterModel.get(list[i]);
                fn = filter.fn;
                fn(this.context);
            }
        },
        
        run: function (ctx) {
            this.composition = [];
            this.context = ctx;
            
            this.compileBundle(ctx.bundle);
            
            return this.composition;
        }
    });
    
}(exports));